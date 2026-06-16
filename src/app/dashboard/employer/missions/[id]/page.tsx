"use client";

import { useEffect, useState } from "react";
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
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function MissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;

  const [mission, setMission] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  // Proposals
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

      // Fetch all dev profiles
      const { data: pData } = await supabase.from("profiles").select("*").eq("role", "dev");
      if (pData) {
        // Fetch proposals to filter
        const { data: propData } = await supabase
          .from("matches")
          .select("dev_id")
          .eq("employer_id", user.id)
          .eq("status", "proposed");

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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
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

  const parseSkills = (skills: any): string[] => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      try { return JSON.parse(skills); } catch { return []; }
    }
    return [];
  };

  const filteredProfiles = profiles.filter((p) => {
    const skills = parseSkills(p.skills);
    const query = searchQuery.toLowerCase();

    // Text search
    if (query && !p.full_name?.toLowerCase().includes(query) && !p.bio?.toLowerCase().includes(query)) {
      return false;
    }

    // Skill filter
    if (selectedSkills.length > 0) {
      const hasSkill = selectedSkills.some((s) => skills.includes(s));
      if (!hasSkill) return false;
    }

    return true;
  });

  if (loading) return <div className="min-h-screen bg-gray-50"><DashboardNav role="employer" /><div className="max-w-5xl mx-auto px-4 pt-24"><p className="text-gray-500">Chargement...</p></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav role="employer" />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Back button */}
        <Link href="/dashboard/employer/missions" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">← Retour aux missions</Link>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6">{error}</div>}

        {/* Mission header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{mission?.title || "Mission"}</h1>
              <p className="text-gray-500 text-sm mt-1">{mission?.project_type} · {mission?.budget ? `${mission.budget}€` : "Budget non défini"}</p>
            </div>
            <span className={classNames("px-4 py-1.5 text-xs font-medium rounded-full uppercase tracking-wider",
              mission?.status === "open" ? "bg-green-50 text-green-700" :
              mission?.status === "proposed" ? "bg-yellow-50 text-yellow-700" :
              "bg-blue-50 text-blue-700"
            )}>{mission?.status}</span>
          </div>
          <p className="text-gray-700">{mission?.description}</p>
        </div>

        {/* Search section */}
        <h2 className="text-xl font-bold mb-4">🔍 Trouver des développeurs</h2>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
          {/* Search bar */}
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou mot-clé..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none"
            />
            <div className="relative">
              <button
                onClick={() => setShowSkillPicker(!showSkillPicker)}
                className={classNames("px-4 py-2.5 rounded-xl border font-medium text-sm transition-all",
                  selectedSkills.length > 0 ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {selectedSkills.length > 0 ? `Compétences (${selectedSkills.length})` : "Filtrer par compétences"}
              </button>
              {showSkillPicker && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl p-4 shadow-lg z-10">
                  <p className="text-xs text-gray-500 mb-3">Sélectionnez les compétences recherchées</p>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                    {allSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={classNames("px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                          selectedSkills.includes(skill) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
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

          {(selectedSkills.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md font-medium">
                  {s}
                  <button onClick={() => toggleSkill(s)} className="hover:text-red-500">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredProfiles.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Aucun développeur trouvé</p>
              <p className="text-gray-400 text-sm mt-1">Modifiez vos filtres pour élargir la recherche</p>
            </div>
          )}
          {filteredProfiles.map((profile) => {
            const skills = parseSkills(profile.skills);
            return (
              <div key={profile.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{profile.full_name || "Anonyme"}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      {profile.english_level && <span>🌍 {profile.english_level}</span>}
                      {profile.availability && <span>⏰ {profile.availability}</span>}
                      {profile.email && <span className="text-xs">{profile.email}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {skills.map((skill: string) => (
                        <span key={skill} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">{skill}</span>
                      ))}
                    </div>
                    {profile.bio && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{profile.bio}</p>}
                  </div>
                  <button
                    onClick={() => proposeMission(profile.id)}
                    disabled={proposing === profile.id || profile.already_proposed}
                    className={classNames(
                      "ml-4 px-5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                      profile.already_proposed
                        ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    )}
                  >
                    {proposing === profile.id ? "..." :
                     profile.already_proposed ? "✅ Proposée" : "Proposer la mission"}
                  </button>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-gray-400 text-center pt-4">
            {filteredProfiles.length} développeur{filteredProfiles.length !== 1 ? "s" : ""} trouvé{filteredProfiles.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
