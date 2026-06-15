"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function DevProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", skills: "", bio: "", english: "", availability: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/signup/dev");
    };
    check();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      bio: form.bio,
    });
    
    if (updateError) { setError(updateError.message); setLoading(false); return; }
    router.push("/dashboard/dev");
  };

  const skillsOptions = [
    { label: "Frontend", desc: "React, Next.js, Vue, Tailwind, TypeScript" },
    { label: "Backend", desc: "Node.js, Python, Laravel, Go, Rust, Java" },
    { label: "Mobile", desc: "React Native, Flutter, Swift, Kotlin" },
    { label: "Fullstack", desc: "Combinaison front + back" },
    { label: "Data / IA", desc: "Python, TensorFlow, SQL,数据分析" },
    { label: "DevOps / Cloud", desc: "Docker, AWS, GCP, CI/CD, Kubernetes" },
    { label: "UI / UX", desc: "Figma, Design Systems, Prototypage" },
    { label: "Autre", desc: "Blockchain, IoT, Game Dev, etc." },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 to-white py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InCube</Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Complète ton profil</h1>
          <p className="text-gray-500 text-sm">Montre aux employeurs ce que tu sais faire</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">👤 Prénom & Nom</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none transition-all" placeholder="Jean Dupont" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">💻 Compétences</label>
            <p className="text-xs text-gray-400 mb-3">Choisis le domaine qui te correspond le mieux</p>
            <div className="grid grid-cols-2 gap-3">
              {skillsOptions.map((skill) => (
                <label key={skill.label} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.skills === skill.label ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <input type="radio" name="skills" value={skill.label} checked={form.skills === skill.label} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="mt-0.5 accent-indigo-600" />
                  <div>
                    <span className="text-sm font-medium">{skill.label}</span>
                    <p className="text-xs text-gray-400">{skill.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">🌍 Niveau d'anglais</label>
            <select value={form.english} onChange={(e) => setForm({ ...form, english: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none bg-white">
              <option value="">Sélectionne ton niveau</option>
              <option value="debutant">Débutant (je me débrouille)</option>
              <option value="intermediaire">Intermédiaire (je peux travailler en anglais)</option>
              <option value="courant">Courant (bilingue technique)</option>
              <option value="natif">Natif / C2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">⏰ Disponibilité</label>
            <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none bg-white">
              <option value="">Quand peux-tu commencer ?</option>
              <option value="immediat">Immédiat</option>
              <option value="1mois">Sous 1 mois</option>
              <option value="3mois">Sous 3 mois</option>
              <option value="freelance">Freelance / temps partiel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">📝 Bio (optionnel)</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none transition-all resize-none" placeholder="Parle-nous de toi, de tes projets, de ce que tu recherches..." />
            <p className="text-xs text-gray-400 mt-1">Les employeurs verront cette bio en premier</p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? "Enregistrement..." : "C'est parti →"}
          </button>
        </form>
      </div>
    </div>
  );
}
