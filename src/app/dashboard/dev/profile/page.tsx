"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import DashboardNav from "../../../../components/DashboardNav";

// Toutes les compétences disponibles
const ALL_SKILLS = {
  "Frontend": ["React", "Next.js", "Vue.js", "Angular", "Svelte", "Tailwind CSS", "TypeScript", "JavaScript", "HTML/CSS", "Framer Motion"],
  "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "Ionic"],
  "Backend": ["Node.js", "Python", "Java", "PHP", "Go", "Rust", "C#/.NET", "Ruby", "Django", "Laravel"],
  "Infra & DevOps": ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Linux", "Nginx"],
  "Data & AI": ["Python", "SQL", "TensorFlow", "PyTorch", "Pandas", "MongoDB", "PostgreSQL", "Redis"],
  "Design & Autre": ["Figma", "Adobe XD", "UI/UX", "Blockchain", "Unity", "Godot", "WordPress"],
};

function parseSkills(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}

export default function DevProfilePage() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [englishLevel, setEnglishLevel] = useState("");
  const [availability, setAvailability] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setSelectedSkills(parseSkills(data.skills));
        setBio(data.bio || "");
        setEnglishLevel(data.english_level || "");
        setAvailability(data.availability || "");
      }
      setLoading(false);
    })();
  }, [router]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("profiles").update({
        skills: JSON.stringify(selectedSkills),
        bio,
        english_level: englishLevel,
        availability,
      }).eq("id", user.id);
      if (error) setMessage("❌ " + error.message);
      else setMessage("✅ Profil sauvegardé !");
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"><DashboardNav role="dev" /><div className="max-w-4xl mx-auto px-4 pt-28"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mt-20" /></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <DashboardNav role="dev" />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">✏️ Mon profil</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-medium ${message.startsWith("✅") ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
            {message}
          </div>
        )}

        {/* Skills section */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 mb-4 shadow-sm">
          <h2 className="font-semibold text-lg text-slate-800 mb-2">🛠️ Compétences</h2>
          <p className="text-sm text-slate-400 mb-5">Clique sur une compétence pour l&apos;ajouter ou la retirer</p>

          {/* Selected skills */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedSkills.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 group"
                >
                  {s}
                  <span className="text-indigo-200 group-hover:text-white transition-colors">✕</span>
                </button>
              ))}
            </div>
          )}

          {/* All skills by category */}
          <div className="space-y-4">
            {Object.entries(ALL_SKILLS).map(([category, skills]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                          isSelected
                            ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bio, English, Availability */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 mb-4 shadow-sm">
          <h2 className="font-semibold text-lg text-slate-800 mb-5">📋 Infos complémentaires</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">🌍 Niveau d&apos;anglais</label>
              <select value={englishLevel} onChange={(e) => setEnglishLevel(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white text-slate-700 focus:border-indigo-400">
                <option value="">Sélectionne</option>
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="courant">Courant</option>
                <option value="bilingue">Bilingue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">⏰ Disponibilité</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white text-slate-700 focus:border-indigo-400">
                <option value="">Sélectionne</option>
                <option value="immediat">Immédiat</option>
                <option value="1-semaine">Sous 1 semaine</option>
                <option value="1-mois">Sous 1 mois</option>
                <option value="soir-weekend">Soir et week-end</option>
                <option value="pas-dispo">Pas disponible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">📝 Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 text-slate-700" placeholder="Parle-nous de toi, ton parcours, tes projets..." />
            </div>
          </div>
        </div>

        {/* Save */}
        <button onClick={save} disabled={saving} className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 text-center">
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sauvegarde...
            </span>
          ) : "💾 Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
