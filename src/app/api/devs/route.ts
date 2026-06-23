import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ekkwecomikucablccucv.supabase.co";

// Helper: parser les skills (peut être string JSON, array, ou string simple)
function parseSkills(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return raw.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

// Helper: normaliser un profil dev pour le frontend
function normalizeDevProfile(profile: any) {
  return {
    dev_number: profile.dev_number,
    skills: parseSkills(profile.skills),
    bio: profile.bio || "",
    daily_rate: profile.daily_rate || null,
    availability: profile.availability || "",
    english_level: profile.english_level || "",
    project_types: profile.project_types || [],
    role: profile.role || "dev",
  };
}

// Helper: extraire le token Bearer de la requête
function getUserToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

// Helper: créer un client Supabase
function createSupabaseClient(token?: string) {
  if (token) {
    return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
}

// GET - Liste publique des devs (anonyme, infos limitées)
export async function GET(req: NextRequest) {
  try {
    const token = getUserToken(req);
    const supabase = createSupabaseClient(token || undefined);

    const { data } = await supabase
      .from("profiles")
      .select("dev_number,skills,bio,daily_rate,availability,english_level,project_types,role")
      .eq("role", "dev")
      .not("dev_number", "is", null);

    if (data && data.length > 0) {
      return NextResponse.json(data.map(normalizeDevProfile));
    }

    // Fallback: requête directe REST
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=dev_number,skills,bio,daily_rate,availability,english_level,project_types,role&role=eq.dev&dev_number=not.is.null`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
      }
    );
    const fallbackData = await res.json();
    if (Array.isArray(fallbackData)) {
      return NextResponse.json(fallbackData.map(normalizeDevProfile));
    }
    return NextResponse.json([]);
  } catch (err: any) {
    return NextResponse.json({ devs: [], error: err.message }, { status: 500 });
  }
}

// POST - Recherche de devs par compétences (anonyme, infos limitées)
export async function POST(req: NextRequest) {
  try {
    const { skills } = await req.json();
    const token = getUserToken(req);
    const supabase = createSupabaseClient(token || undefined);

    const { data } = await supabase
      .from("profiles")
      .select("dev_number,skills,bio,daily_rate,availability,english_level,role,project_types")
      .eq("role", "dev")
      .not("dev_number", "is", null);

    if (!data || data.length === 0) {
      return NextResponse.json({ devs: [], total: 0 });
    }

    // Normaliser et parser les devs
    let filtered = data.map(normalizeDevProfile);

    // Filtrer par compétences
    if (skills && Array.isArray(skills) && skills.length > 0) {
      const lowerSkills = skills.map((s: string) => s.toLowerCase().trim());
      filtered = filtered.filter((dev: any) =>
        dev.skills.some((ds: string) =>
          lowerSkills.some((ls: string) => ds.toLowerCase().includes(ls))
        )
      );

      // Trier par pertinence
      filtered.sort((a: any, b: any) => {
        const aMatch = a.skills.filter((s: string) =>
          lowerSkills.some((ls: string) => s.toLowerCase().includes(ls))
        ).length;
        const bMatch = b.skills.filter((s: string) =>
          lowerSkills.some((ls: string) => s.toLowerCase().includes(ls))
        ).length;
        return bMatch - aMatch;
      });
    }

    return NextResponse.json({ devs: filtered, total: filtered.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT - Révéler les infos d'un dev spécifique (protégée, après match accepté)
export async function PUT(req: NextRequest) {
  try {
    const token = getUserToken(req);
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { matchId } = await req.json();
    if (!matchId) {
      return NextResponse.json({ error: "Missing matchId" }, { status: 400 });
    }

    const supabase = createSupabaseClient(token);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: match } = await supabase
      .from("matches")
      .select("employer_id, dev_id, status")
      .eq("id", matchId)
      .single();

    if (!match) {
      return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
    }

    if (match.employer_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (match.status !== "matched" && match.status !== "completed") {
      return NextResponse.json({ error: "Le match doit être accepté pour voir les infos" }, { status: 400 });
    }

    const { data: devProfile } = await supabase
      .from("profiles")
      .select("full_name, email, dev_number, skills, bio, daily_rate, availability, english_level")
      .eq("id", match.dev_id)
      .single();

    if (!devProfile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    return NextResponse.json(normalizeDevProfile(devProfile));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
