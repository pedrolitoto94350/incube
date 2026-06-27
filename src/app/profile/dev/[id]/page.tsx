"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const devNumber = params.id as string;
  const missionFromUrl = searchParams.get("missionId") || "";
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proposalError, setProposalError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMission, setSelectedMission] = useState(missionFromUrl);
  const [mission, setMission] = useState<any>(null);
  const [proposing, setProposing] = useState(false);
  const [proposed, setProposed] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const num = parseInt(devNumber, 10);
      if (isNaN(num)) { setError("Profil introuvable"); setLoading(false); return; }
      const { data, error: err } = await supabase.from("profiles").select("*").eq("dev_number", num).eq("profile_completed", true).single();
      if (err || !data) { setError("Profil introuvable"); setLoading(false); return; }
      setProfile(data);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const { data: uProf } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
        setUserProfile(uProf);
        if (uProf?.role === "employer") {
          const { data: mData } = await supabase.from("matches").select("id, title, status").eq("employer_id", currentUser.id).in("status", ["open", "proposed"]);
          if (mData) setMissions(mData);
          if (missionFromUrl) {
            setSelectedMission(missionFromUrl);
            const { data: missionData } = await supabase.from("matches").select("id, title, description, project_type, budget").eq("id", missionFromUrl).eq("employer_id", currentUser.id).single();
            if (missionData) setMission(missionData);
          }
          const { data: existing } = await supabase.from("matches").select("id").eq("employer_id", currentUser.id).eq("dev_id", data.id);
          if (existing && existing.length > 0) setProposed(true);
        }
      }
      setLoading(false);
    })();
  }, [devNumber]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center gap-4">
      <span className="text-4xl">🔍</span>
      <p className="text-gray-500 text-lg font-medium">{error}</p>
      <Link href="/" className="text-sm text-emerald-600 hover:underline">Retour à l&apos;accueil</Link>
    </div>
  );

  const skills = parseJSONArray(profile.skills);
  const projectTypes = parseJSONArray(profile.project_types);
  const screenshotUrls = parseJSONArray(profile.screenshot_urls);
  const screenshotCaptions = parseJSONArray(profile.screenshot_captions);
  const codeSnippets = parseJSONArray(profile.code_snippets);
  const textShowcases = parseJSONArray(profile.text_showcases);
  const devLabel = `Dev#${String(profile.dev_number).padStart(3, "0")}`;
  const backUrl = missionFromUrl ? `/dashboard/employer/missions/${missionFromUrl}` : "/dashboard/employer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="bg-emerald-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight">InCube</span>
              <span className="text-[10px] italic opacity-70 -mt-0.5">project</span>
            </Link>
            <span className="text-emerald-300 text-sm">|</span>
            <span className="text-sm text-emerald-200">{devLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={backUrl} className="text-xs text-emerald-200 hover:text-white transition-colors flex items-center gap-1">
              ← Retour
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">👨‍💻</span>
                <h1 className="text-2xl font-bold text-gray-900">{devLabel}</h1>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {projectTypes.map((pt: string) => (
                  <span key={pt} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                    {PROJECT_TYPE_LABELS[pt] || pt}
                  </span>
                ))}
                {profile.project_type_other && (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">{profile.project_type_other}</span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                {profile.daily_rate && <span className="flex items-center gap-1">💰 <strong className="text-gray-700">{profile.daily_rate}€</strong> / jour</span>}
                {profile.availability && <span className="flex items-center gap-1">⏰ {AVAILABILITY_LABELS[profile.availability] || profile.availability}</span>}
              </div>
            </div>
          </div>
          {skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-emerald-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">📝 Présentation</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Screenshots */}
        {screenshotUrls.length > 0 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📸 Réalisations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {screenshotUrls.map((url: string, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden border border-emerald-200 group">
                  <img src={url} alt={`Réalisation ${i + 1}`} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
                  {screenshotCaptions[i] && <div className="p-3 bg-emerald-50 border-t border-emerald-100"><p className="text-sm text-emerald-800">{screenshotCaptions[i]}</p></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video */}
        {profile.demo_video_url && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🎥 Démonstration vidéo</h2>
            <video controls className="w-full rounded-xl max-h-[500px] bg-black" preload="metadata">
              <source src={profile.demo_video_url} type="video/mp4" />
            </video>
          </div>
        )}

        {/* Code */}
        {codeSnippets.length > 0 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📄 Extraits de code</h2>
            <div className="space-y-3">
              {codeSnippets.map((snippet: string, i: number) => (
                <pre key={i} className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap"><code>{snippet}</code></pre>
              ))}
            </div>
          </div>
        )}

        {/* Showcases */}
        {textShowcases.length > 0 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">✍️ Réalisations en détail</h2>
            <div className="space-y-4">
              {textShowcases.map((showcase: string, i: number) => (
                <div key={i} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{showcase}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proposer une mission */}
        <div className="text-center py-8">
          {!user ? (
            <>
              <p className="text-sm text-gray-400 mb-4">Intéressé par ce profil ? Connectez-vous pour proposer une mission.</p>
              <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all">🔑 Espace recruteur</Link>
            </>
          ) : userProfile?.role !== "employer" ? (
            <p className="text-sm text-gray-400">Connecté en tant que développeur · <Link href="/dashboard/dev" className="text-emerald-600 hover:underline">Mon tableau de bord</Link></p>
          ) : proposed ? (
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <p className="text-emerald-700 font-medium">✅ Proposition déjà envoyée à ce développeur</p>
                <p className="text-emerald-600 text-sm mt-1">En attente de sa réponse</p>
              </div>
            </div>
          ) : missionFromUrl && mission ? (
            <div className="max-w-lg mx-auto bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">📩 Proposer une mission</h3>
              <p className="text-sm text-gray-500 mb-4">
                <strong>{mission.title || "Mission"}</strong>
                {mission.budget && ` · ${mission.budget}€`}
                {mission.project_type && ` · ${mission.project_type}`}
              </p>
              <button onClick={async () => {
                setProposing(true); setProposalError("");
                const supabase = createClient();
                const { data: employerProf } = await supabase.from("profiles").select("stripe_payment_method_id").eq("id", user.id).single();
                if (!employerProf?.stripe_payment_method_id) { setProposalError("💳 Enregistrez d'abord une carte dans votre profil"); setProposing(false); return; }
                const { error: err } = await supabase.from("matches").insert({ employer_id: user.id, dev_id: profile.id, title: mission.title, description: mission.description, project_type: mission.project_type, budget: mission.budget, status: "proposed" });
                if (err) { setProposalError(err.message?.includes("duplicate") ? "Proposition déjà envoyée" : err.message); } else { setProposed(true); }
                setProposing(false);
              }} disabled={proposing} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {proposing ? "Envoi..." : `Proposer cette mission à ${devLabel} →`}
              </button>
              {proposalError && <p className="text-sm text-red-600 mt-2">{proposalError}</p>}
              <p className="text-xs text-gray-400 mt-2">Pas la bonne mission ? <Link href="/dashboard/employer/missions" className="text-emerald-500 hover:underline">Voir mes missions</Link></p>
            </div>
          ) : missions.length === 0 ? (
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-amber-700 font-medium">📝 Créez d&apos;abord une mission</p>
                <p className="text-amber-600 text-sm mt-1 mb-3">Vous devez avoir une mission active pour proposer à ce développeur.</p>
                <Link href="/dashboard/employer/create-mission" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all">Créer une mission</Link>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">📩 Proposer une mission à {devLabel}</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select value={selectedMission} onChange={(e) => setSelectedMission(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none text-sm bg-white">
                  <option value="">Choisir une mission...</option>
                  {missions.map((m) => (<option key={m.id} value={m.id}>{m.title || "Mission sans titre"}</option>))}
                </select>
                <button onClick={async () => {
                  if (!selectedMission) return;
                  setProposing(true); setProposalError("");
                  const supabase = createClient();
                  const { data: employerProf } = await supabase.from("profiles").select("stripe_payment_method_id").eq("id", user.id).single();
                  if (!employerProf?.stripe_payment_method_id) { setProposalError("💳 Enregistrez d'abord une carte dans votre profil"); setProposing(false); return; }
                  const { data: missionData } = await supabase.from("matches").select("*").eq("id", selectedMission).single();
                  if (!missionData) { setProposing(false); return; }
                  const { error: err } = await supabase.from("matches").insert({ employer_id: user.id, dev_id: profile.id, title: missionData.title, description: missionData.description, project_type: missionData.project_type, budget: missionData.budget, status: "proposed" });
                  if (err) { setProposalError(err.message?.includes("duplicate") ? "Proposition déjà envoyée" : err.message); } else { setProposed(true); }
                  setProposing(false);
                }} disabled={!selectedMission || proposing} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                  {proposing ? "Envoi..." : "Proposer →"}
                </button>
              </div>
              {proposalError && <p className="text-sm text-red-600 mt-2">{proposalError}</p>}
            </div>
          )}
        </div>

        {/* Footer légal */}
        <div className="text-center text-xs text-gray-400 pt-8 border-t border-emerald-200">InCube · SIRET 104 549 001 00014 · RCS Paris · TVA FR104549001</div>
      </div>
    </div>
  );
}
