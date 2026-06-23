import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ekkwecomikucablccucv.supabase.co";

// Helper: extraire le token Bearer de la requête
function getUserToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

// Helper: créer un client Supabase avec la meilleure clé disponible
function createSupabaseClient(token?: string) {
  if (token) {
    // Client authentifié avec le token de l'utilisateur (respecte RLS)
    return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  }
  // Fallback service_role (admin) pour les cas où on a besoin de tout lire
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

    // Ne retourner que les infos publiques : pas de full_name, pas d'email
    const { data } = await supabase
      .from("profiles")
      .select("dev_number,skills,bio,daily_rate,availability,english_level,project_types,role")
      .eq("role", "dev")
      .not("dev_number", "is", null);

    if (!data) return NextResponse.json([]);
    return NextResponse.json(data);
  } catch (err: any) {
    // Fallback: requête directe REST avec l'anon key
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=dev_number,skills,bio,daily_rate,availability,english_level,project_types,role&role=eq.dev&dev_number=not.is.null`,
        {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
        }
      );
      return NextResponse.json(await res.json());
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }
}

// POST - Recherche de devs par compétences (anonyme, infos limitées)
export async function POST(req: NextRequest) {
  try {
    const { skills } = await req.json();
    const token = getUserToken(req);
    const supabase = createSupabaseClient(token || undefined);

    // Ne retourner que les infos publiques (pas de nom)
    const { data } = await supabase
      .from("profiles")
      .select("dev_number,skills,bio,daily_rate,availability,english_level,role,project_types")
      .eq("role", "dev")
      .not("dev_number", "is", null);

    if (!data || data.length === 0) {
      return NextResponse.json({ devs: [], total: 0 });
    }

    // Helper pour parser les skills
    const parseSkills = (dev: any): string[] => {
      const raw = dev.skills;
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
    };

    // Filtrer par compétences
    let filtered = data;
    if (skills && Array.isArray(skills) && skills.length > 0) {
      const lowerSkills = skills.map((s: string) => s.toLowerCase().trim());
      filtered = filtered.filter((dev: any) => {
        const devSkills = parseSkills(dev);
        return devSkills.some((ds: string) =>
          lowerSkills.some((ls: string) => ds.toLowerCase().includes(ls))
        );
      });
    }

    // Trier par pertinence
    if (skills && Array.isArray(skills) && skills.length > 0) {
      const lowerSkills = skills.map((s: string) => s.toLowerCase().trim());
      filtered.sort((a: any, b: any) => {
        const aSkills = parseSkills(a);
        const bSkills = parseSkills(b);
        const aMatch = aSkills.filter((s: string) =>
          lowerSkills.some((ls: string) => s.toLowerCase().includes(ls))
        ).length;
        const bMatch = bSkills.filter((s: string) =>
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

// Route pour révéler les infos d'un dev spécifique (protégée, après match accepté)
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

    // Vérifier que l'utilisateur est bien l'employeur de ce match
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

    // Seul l'employeur du match peut voir les infos du dev
    if (match.employer_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (match.status !== "matched" && match.status !== "completed") {
      return NextResponse.json({ error: "Le match doit être accepté pour voir les infos" }, { status: 400 });
    }

    // Révéler les infos du dev (nom, email)
    const { data: devProfile } = await supabase
      .from("profiles")
      .select("full_name, email, dev_number, skills, bio, daily_rate, availability, english_level")
      .eq("id", match.dev_id)
      .single();

    if (!devProfile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    return NextResponse.json(devProfile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
