"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const skillsTags = {
  "Frontend": ["React", "Next.js", "Vue.js", "Angular", "Svelte", "Tailwind CSS", "TypeScript", "HTML/CSS"],
  "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "Ionic"],
  "Backend": ["Node.js", "Python", "Go", "Rust", "Java", "C#", "PHP/Laravel", "Ruby on Rails"],
  "Infra": ["Docker", "AWS", "GCP", "Azure", "Kubernetes", "CI/CD"],
  "Data": ["Python", "SQL", "TensorFlow", "PyTorch", "Big Data"],
  "Autre": ["Figma", "Blockchain/Solidity", "Unity", "C/C++"],
};

const englishLevels = [
  { value: "debutant", label: "Débutant", desc: "Je me débrouille" },
  { value: "intermediaire", label: "Intermédiaire", desc: "Je peux travailler en anglais" },
  { value: "courant", label: "Courant", desc: "Bilingue technique" },
  { value: "natif", label: "Natif / C2", desc: "Comme ma langue maternelle" },
];

const availabilities = [
  { value: "immediat", label: "Immédiat", desc: "dispo tout de suite" },
  { value: "1mois", label: "Sous 1 mois", desc: "préavis 1 mois" },
  { value: "3mois", label: "Sous 3 mois", desc: "préavis 3 mois" },
  { value: "freelance", label: "Freelance", desc: "temps partiel / mission" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DevProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: "",
    skills: [] as string[],
    english: "",
    availability: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/signup/dev");
    })();
  }, [router]);

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/signup/dev"); return; }

    const { error: updateError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name,
      email: user.email,
      role: "dev",
      skills: form.skills,
      english_level: form.english,
      availability: form.availability,
      bio: form.bio,
    });

    if (updateError) { setError(updateError.message); setLoading(false); return; }
    router.push("/dashboard/dev");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 to-white py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InCube</Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Complète ton profil</h1>
          <p className="text-gray-500 text-sm">Les employeurs te trouveront plus facilement</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={classNames(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step === s ? "bg-indigo-600 text-white" :
                step > s ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
              )}>
                {step > s ? "✓" : s}
              </div>
              {s < 4 && <div className={classNames("w-8 h-0.5", step > s ? "bg-green-500" : "bg-gray-200")} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-5">{error}</div>}

          {/* Step 1: Nom */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-lg">👤 Qui es-tu ?</h2>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none transition-all"
                placeholder="Jean Dupont"
                autoFocus
              />
              <div className="flex justify-end">
                <button onClick={() => form.full_name && setStep(2)} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all disabled:opacity-50" disabled={!form.full_name}>
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-lg">💻 Quelles technos maîtrises-tu ?</h2>
              <p className="text-sm text-gray-400">Clique sur celles que tu connais</p>
              {Object.entries(skillsTags).map(([category, tags]) => (
                <div key={category}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleSkill(tag)}
                        className={classNames(
                          "px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all",
                          form.skills.includes(tag)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 transition-all">← Retour</button>
                <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all">
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: English + Availability */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-semibold text-lg">🌍 Infos complémentaires</h2>
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">Niveau d'anglais</label>
                <div className="grid grid-cols-2 gap-3">
                  {englishLevels.map((lvl) => (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setForm({ ...form, english: lvl.value })}
                      className={classNames(
                        "p-3 rounded-xl border-2 text-left transition-all",
                        form.english === lvl.value ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <span className="text-sm font-medium block">{lvl.label}</span>
                      <span className="text-xs text-gray-400">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">⏰ Disponibilité</label>
                <div className="grid grid-cols-2 gap-3">
                  {availabilities.map((av) => (
                    <button
                      key={av.value}
                      type="button"
                      onClick={() => setForm({ ...form, availability: av.value })}
                      className={classNames(
                        "p-3 rounded-xl border-2 text-left transition-all",
                        form.availability === av.value ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <span className="text-sm font-medium block">{av.label}</span>
                      <span className="text-xs text-gray-400">{av.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 transition-all">← Retour</button>
                <button onClick={() => setStep(4)} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all">
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Bio */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-lg">📝 Finalise ton profil</h2>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Bio (optionnelle)</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none resize-none transition-all"
                  placeholder="Parle de toi, de tes projets, de ce que tu recherches..."
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">C'est la première chose que verront les employeurs</p>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 transition-all">← Retour</button>
                <button onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
                  {loading ? "Enregistrement..." : "Terminer →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
