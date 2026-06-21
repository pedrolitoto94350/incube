"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "../../../../../lib/supabase";
import DashboardNav from "../../../../../components/DashboardNav";
import Link from "next/link";

const allSkills = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte", "Tailwind CSS", "TypeScript", "HTML/CSS",
  "React Native", "Flutter", "Swift", "Kotlin", "Ionic",
  "Node.js", "Python", "Go", "Rust", "Java", "C#", "PHP/Laravel", "Ruby on Rails",
  "Docker", "AWS", "GCP", "Azure", "Kubernetes", "CI/CD",
  "SQL", "TensorFlow", "PyTorch", "Big Data",
  "Figma", "Blockchain/Solidity", "Unity", "C/C++",
  "Stripe API", "REST API", "GraphQL", "WordPress", "Shopify", "SEO",
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function parseSkills(skills: any): string[] {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    try { return JSON.parse(skills); } catch { return []; }
  }
  return [];
}

export default function MissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;

  const [mission, setMission] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [showAutoSuggest, setShowAutoSuggest] = useState(true);

  const [proposing, setProposing] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Fetch mission
      const { data: mData, error: mErr } = await supabase.from("matches").select("*").eq("id", missionId).single();
      if (mErr || !mData) { setError("Mission introuvable"); setLoading(false); return; }
      setMission(mData);

      // Auto-select skills from mission's required_skills
      if (mData.required_skills && Array.isArray(mData.required_skills)) {
        const validSkills = mData.required_skills.filter((s: string) => allSkills.includes(s));
        if (validSkills.length > 0) {
          setSelectedSkills(validSkills);
        }
      }

      // Fetch all dev profiles
      const res = await fetch("/api/devs");
      const pData = await res.json();
      if (Array.isArray(pData) && pData.length > 0) {
        const { data: propData } = await supabase
          .from("matches")
          .select("dev_id")
          .eq("employer_id", user.id)
          .in("status", ["proposed", "matched"]);

        const proposedIds = new Set(propData?.map((p: any) => p.dev_id) || []);
        setProfiles(pData.map((p: any) => ({ ...p, already_proposed: proposedIds.has(p.id) })));
      }
      setLoading(false);
    })();
  }, [missionId, router]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const proposeMission = async (devId: string) => {
    setProposing(devId);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from("profiles").select("stripe_payment_method_id").eq("id", user!.id).single();
    if (!profile?.stripe_payment_method_id) {
      setError("💳 Vous devez d'abord enregistrer une carte dans votre profil pour proposer une mission.");
      setProposing(null);
      return;
    }

    const { data: existing } = await supabase
      .from("matches")
      .select("id")
      .eq("employer_id", user!.id)
      .eq("dev_id", devId)
      .in("status", ["proposed", "matched"]);

    if (existing && existing.length > 0) {
      setError("Proposition déjà envoyée à ce développeur");
      setProposing(null);
      return;
    }

    const { error: err } = await supabase.from("matches").insert({
      employer_id: user!.id,
      dev_id: devId,
      title: mission?.title,
      description: mission?.description,
      project_type: mission?.project_type,
      budget: mission?.budget,
      status: "proposed",
    });
    if (err) {
      setError(err.message);
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === devId ? { ...p, already_proposed: true } : p))
      );
    }
    setProposing(null);
  };

  // Computed: devs triés par pertinence pour les compétences sélectionnées
  const sortedProfiles = useMemo(() => {
    if (selectedSkills.length === 0) return [];

    const lowerSelected = selectedSkills.map((s) => s.toLowerCase());
    return profiles
      .map((p) => {
        const skills = parseSkills(p.skills);
        const matchCount = skills.filter((s: string) =>
          lowerSelected.some((ls: string) => s.toLowerCase().includes(ls))
        ).length;
        return { ...p, _matchCount: matchCount, _skills: skills };
      })
      .filter((p) => p._matchCount > 0)
      .sort((a, b) => (b._matchCount - a._matchCount) || ((a.daily_rate || 9999) - (b.daily_rate || 9999)));
  }, [profiles, selectedSkills]);

  const filteredProfiles = sortedProfiles.filter((p) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      p.full_name?.toLowerCase().includes(query) ||
      p.bio?.toLowerCase().includes(query)
    );
  });

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DashboardNav role="employer" />
      <div className="max-w-5xl mx-auto px-4 pt-24"><p className="text-gray-500">Chargement...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DashboardNav role="employer" />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        <Link href="/dashboard/employer/missions" className="text-sm text-emerald-600 hover:text-emerald-800 mb-4 inline-block">← Retour aux missions</Link>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6">{error}</div>}

        {/* Mission header */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mission?.title || "Mission"}</h1>
              <p className="text-gray-500 text-sm mt-1">{mission?.project_type} · {mission?.budget ? `${mission.budget}€` : "Budget non défini"}</p>
            </div>
            <span className={classNames("px-4 py-1.5 text-xs font-medium rounded-full uppercase tracking-wider",
              mission?.status === "open" ? "bg-emerald-50 text-emerald-700" :
              mission?.status === "proposed" ? "bg-amber-50 text-amber-700" :
              "bg-blue-50 text-blue-700"
            )}>{mission?.status}</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{mission?.description}</p>

          {/* Skills de la mission */}
          {mission?.required_skills && Array.isArray(mission.required_skills) && mission.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-emerald-100">
              {mission.required_skills.map((s: string) => (
                <span key={s} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Search section */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Développeurs disponibles</h2>

        <div className="bg-white rounded-2xl border border-emerald-100 p-6 mb-6 shadow-sm space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un développeur..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none"
            />
            <div className="relative">
              <button
                onClick={() => setShowSkillPicker(!showSkillPicker)}
                className={classNames("px-4 py-2.5 rounded-xl border font-medium text-sm transition-all",
                  selectedSkills.length > 0 ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {selectedSkills.length > 0 ? `Compétences (${selectedSkills.length})` : "Filtrer par compétences"}
              </button>
              {showSkillPicker && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-emerald-100 rounded-xl p-4 shadow-lg z-10">
                  <p className="text-xs text-gray-500 mb-3">Sélectionnez les compétences recherchées</p>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                    {allSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={classNames("px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                          selectedSkills.includes(skill) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                        )}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {selectedSkills.length > 0 && (
                    <button onClick={() => { setSelectedSkills([]); setShowSkillPicker(false); }} className="text-xs text-red-500 mt-3 hover:underline">
                      Effacer les filtres
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-gray-400 mr-1">Filtres actifs :</span>
              {selectedSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium">
                  {s}
                  <button onClick={() => toggleSkill(s)} className="hover:text-red-500">✕</button>
                </span>
              ))}
            </div>
          )}

          {/* Suggestion: propose d'utiliser les skills de la mission */}
          {mission?.required_skills && Array.isArray(mission.required_skills) && mission.required_skills.length > 0 && selectedSkills.length === 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-700">
                💡 Cette mission a des compétences définies. <button onClick={() => setSelectedSkills(mission.required_skills.filter((s: string) => allSkills.includes(s)))} className="underline font-medium">Les utiliser pour la recherche</button>
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {selectedSkills.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-emerald-200 p-10 text-center">
              <p className="text-gray-400 font-medium">🔍 Sélectionnez des compétences</p>
              <p className="text-gray-400 text-sm mt-1">Cliquez sur "Filtrer par compétences" ou utilisez les compétences de la mission</p>
            </div>
          )}
          {selectedSkills.length > 0 && filteredProfiles.length === 0 && (
            <div className="bg-white rounded-xl border border-emerald-100 p-8 text-center">
              <p className="text-gray-500">Aucun développeur trouvé pour ces compétences</p>
              <p className="text-gray-400 text-sm mt-1">Modifiez vos filtres ou revenez plus tard</p>
            </div>
          )}
          {filteredProfiles.map((profile) => {
            const skills = parseSkills(profile.skills);
            const devNum = profile.dev_number;
            const profilePath = devNum ? `/profile/dev/${devNum}?missionId=${missionId}` : '#';
            return (
              <div key={profile.id} className="bg-white rounded-xl border border-emerald-100 p-6 hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <Link href={profilePath} className="flex-1 group">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {devNum ? `Dev#${String(devNum).padStart(3, '0')}` : '👨‍💻 Développeur·se'}
                      </h3>
                      {profile._matchCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                          {profile._matchCount} skill{profile._matchCount > 1 ? 's' : ''} match
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      {profile.english_level && <span>🌍 {profile.english_level}</span>}
                      {profile.daily_rate && <span>💰 {profile.daily_rate}€/j</span>}
                      {profile.availability && <span>⏰ {profile.availability === 'disponible' ? 'Disponible' : profile.availability === '1-2_semaines' ? 'Sous 1-2 sem' : 'Sous 3-4 sem'}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {skills.map((skill: string) => {
                        const isMatch = selectedSkills.some((s) => skill.toLowerCase().includes(s.toLowerCase()));
                        return (
                          <span key={skill} className={classNames("text-xs px-2.5 py-1 rounded-md font-medium",
                            isMatch ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                          )}>{skill}</span>
                        );
                      })}
                    </div>
                    {profile.bio && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{profile.bio}</p>}
                    <span className="text-xs text-emerald-600 mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">Voir le profil complet →</span>
                  </Link>
                  <button
                    onClick={() => proposeMission(profile.id)}
                    disabled={proposing === profile.id || profile.already_proposed}
                    className={classNames(
                      "ml-4 px-5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0",
                      profile.already_proposed
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50"
                    )}
                  >
                    {proposing === profile.id ? "..." :
                     profile.already_proposed ? "✅ Proposée" : "Proposer la mission"}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProfiles.length > 0 && (
            <p className="text-xs text-gray-400 text-center pt-4">
              {filteredProfiles.length} développeur{filteredProfiles.length !== 1 ? "s" : ""} trouvé{filteredProfiles.length !== 1 ? "s" : ""}
              · Trié{filteredProfiles.length !== 1 ? "s" : ""} par pertinence
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
