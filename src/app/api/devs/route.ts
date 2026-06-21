import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ekkwecomikucablccucv.supabase.co";

// Toujours retourner GET pour compatibilité (tous les devs)
export async function GET() {
  const keys = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ].filter(Boolean) as string[];

  for (const key of keys) {
    try {
      const supabase = createClient(supabaseUrl, key);
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,dev_number,skills,bio,daily_rate,availability,english_level,role")
        .eq("role", "dev")
        .not("dev_number", "is", null);
      if (data && data.length > 0) return NextResponse.json(data);
    } catch {}
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,full_name,skills,dev_number,role,daily_rate&role=eq.dev&dev_number=not.is.null`, {
      headers: {
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
      },
    });
    return NextResponse.json(await res.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST pour filtrer par compétences
export async function POST(req: NextRequest) {
  try {
    const { skills, projectTypes } = await req.json();

    const keys = [
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ].filter(Boolean) as string[];

    for (const key of keys) {
      try {
        const supabase = createClient(supabaseUrl, key);
        let query = supabase
          .from("profiles")
          .select("id,dev_number,skills,bio,daily_rate,availability,english_level,role,project_types")
          .eq("role", "dev")
          .not("dev_number", "is", null);

        // Récupération de tous les devs, filtrage côté serveur
        const { data } = await query;
        if (!data || data.length === 0) continue;

        // Helper pour parser les skills (string JSON ou array)
        const parseSkills = (dev: any): string[] => {
          const raw = dev.skills;
          if (Array.isArray(raw)) return raw;
          if (typeof raw === "string") {
            try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : [raw]; }
            catch { return raw.split(",").map((s: string) => s.trim()).filter(Boolean); }
          }
          return [];
        };

        // Filtrer par compétences (si fournies)
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

        // Trier par nombre de compétences matchantes (les plus pertinents en premier)
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
      } catch {}
    }

    return NextResponse.json({ devs: [], total: 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
