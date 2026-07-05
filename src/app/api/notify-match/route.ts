import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ekkwecomikucablccucv.supabase.co";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_MuihJsNa_JDRdkzxVX3ugS9HhWiiryXsE";

function createSupabaseClient() {
  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
}

export async function POST(req: NextRequest) {
  try {
    const { matchId } = await req.json();
    if (!matchId) {
      return NextResponse.json({ error: "Missing matchId" }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    // Récupérer le match
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (!match) {
      return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
    }

    // Récupérer l'employeur séparément (évite les problèmes de join)
    const { data: employer } = await supabase
      .from("profiles")
      .select("full_name, company_name, email")
      .eq("id", match.employer_id)
      .single();

    // Récupérer le dev (destinataire)
    const { data: devProfile } = await supabase
      .from("profiles")
      .select("full_name, email, dev_number")
      .eq("id", match.dev_id)
      .single();

    if (!devProfile || !devProfile.email) {
      return NextResponse.json({ error: "Profil dev introuvable ou email manquant" }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://incube-project.com";
    const matchUrl = `${siteUrl}/dashboard/dev/matches`;
    const employerName = employer?.company_name || employer?.full_name || "Un employeur";
    const devName = devProfile.full_name || `Dev#${String(devProfile.dev_number || "").padStart(3, "0")}`;

    // Envoyer l'email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "InCube Project <noreply@incube-project.com>",
        to: devProfile.email,
        subject: `💼 ${employerName} a une mission pour vous !`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #10b981, #0d9488); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">InCube</span>
      <span style="display: block; font-size: 12px; color: #9ca3af; font-style: italic;">project</span>
    </div>

    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
      <p style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px;">Bonjour ${devName} 👋</p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        <strong>${employerName}</strong> a une mission qui pourrait vous intéresser sur InCube.
      </p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #374151;"><strong>📋 ${match.title || "Nouvelle mission"}</strong></p>
        <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
          ${(match.description || "").substring(0, 200)}${(match.description || "").length > 200 ? "..." : ""}
        </p>
      </div>

      <a href="${matchUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10b981, #0d9488); color: white; text-decoration: none; border-radius: 12px; font-weight: 500; font-size: 15px;">
        🤝 Voir la proposition
      </a>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; line-height: 1.4;">
        Vous restez anonyme jusqu'à l'acceptation de la mission. L'employeur ne voit pas votre nom ni votre email tant que vous n'acceptez pas.
      </p>
    </div>

    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
      InCube project · La plateforme de matching développeurs juniors
    </p>
  </div>
</body>
</html>
        `,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return NextResponse.json({ error: "Erreur d'envoi email", detail: result }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: result.id });
  } catch (err: any) {
    console.error("notify-match error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
