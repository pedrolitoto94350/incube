"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  site_vitrine: "Site vitrine",
  ecommerce: "E-commerce / boutique en ligne",
  automatisation: "Automatisation",
  agents_ia: "Agents IA",
  landing_page: "Landing page",
  integration_api: "Intégration / API",
  autre: "Autre",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  disponible: "Disponible maintenant",
  "1-2_semaines": "Sous 1-2 semaines",
  "3-4_semaines": "Sous 3-4 semaines",
};

function parseJSONArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") try { return JSON.parse(val); } catch { return []; }
  return [];
}

function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function DevProfilePublicPage() {
  const params = useParams();
  const devNumber = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const num = parseInt(devNumber, 10);
      if (isNaN(num)) { setError("Profil introuvable"); setLoading(false); return; }
      const { data, error: err } = await supabase
        .from("profiles")
        .select("*")
        .eq("dev_number", num)
        .eq("profile_completed", true)
        .single();

      if (err || !data) { setError("Profil introuvable"); setLoading(false); return; }
      setProfile(data);
      setLoading(false);
    })();
  }, [devNumber]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center gap-4">
      <span className="text-4xl">🔍</span>
      <p className="text-gray-500 text-lg font-medium">{error}</p>
      <Link href="/" className="text-sm text-indigo-600 hover:underline">Retour à l&apos;accueil</Link>
    </div>
  );

  const skills = parseJSONArray(profile.skills);
  const projectTypes = parseJSONArray(profile.project_types);
  const screenshotUrls = parseJSONArray(profile.screenshot_urls);
  const screenshotCaptions = parseJSONArray(profile.screenshot_captions);
  const codeSnippets = parseJSONArray(profile.code_snippets);
  const textShowcases = parseJSONArray(profile.text_showcases);
  const devLabel = `Dev#${String(profile.dev_number).padStart(3, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation minimale */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InCube</Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">Espace recruteur</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header anonyme */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">👨‍💻</span>
                <h1 className="text-2xl font-bold text-gray-900">{devLabel}</h1>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {projectTypes.map((pt: string) => (
                  <span key={pt} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                    {PROJECT_TYPE_LABELS[pt] || pt}
                  </span>
                ))}
                {profile.project_type_other && (
                  <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                    {profile.project_type_other}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                {profile.daily_rate && (
                  <span className="flex items-center gap-1">💰 <strong className="text-gray-700">{profile.daily_rate}€</strong> / jour</span>
                )}
                {profile.availability && (
                  <span className="flex items-center gap-1">⏰ {AVAILABILITY_LABELS[profile.availability] || profile.availability}</span>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">📝 Présentation</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Screenshots */}
        {screenshotUrls.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📸 Réalisations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {screenshotUrls.map((url: string, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-200 group">
                  <div className="relative">
                    <img src={url} alt={`Réalisation ${i + 1}`} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  {screenshotCaptions[i] && (
                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{screenshotCaptions[i]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo video */}
        {profile.demo_video_url && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🎥 Démonstration vidéo</h2>
            <video controls className="w-full rounded-xl max-h-[500px] bg-black" preload="metadata">
              <source src={profile.demo_video_url} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>
        )}

        {/* Code snippets */}
        {codeSnippets.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📄 Extraits de code</h2>
            <div className="space-y-3">
              {codeSnippets.map((snippet: string, i: number) => (
                <pre key={i} className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap">
                  <code>{snippet}</code>
                </pre>
              ))}
            </div>
          </div>
        )}

        {/* Text showcases */}
        {textShowcases.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">✍️ Réalisations en détail</h2>
            <div className="space-y-4">
              {textShowcases.map((showcase: string, i: number) => (
                <div key={i} className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{showcase}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer action */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-400 mb-4">
            Intéressé par ce profil ? Connectez-vous pour proposer une mission.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all"
          >
            🔑 Espace recruteur
          </Link>
        </div>

        {/* Footer légal */}
        <div className="text-center text-xs text-gray-400 pt-8 border-t border-gray-200">
          InCube · SIRET 104 549 001 00014 · RCS Paris · TVA FR104549001
        </div>
      </div>
    </div>
  );
}
