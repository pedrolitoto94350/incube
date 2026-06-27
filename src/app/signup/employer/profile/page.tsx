"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function EmployerProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ company_name: "", full_name: "", company_size: "", sector: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/signup/employer");
    };
    check();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/signup/employer"); return; }

    const { error: updateError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name,
      company_name: form.company_name,
      email: user.email,
      role: "employer",
    });

    if (updateError) { setError(updateError.message); setLoading(false); return; }
    router.push("/dashboard/employer");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 to-white py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">InCube</span>
            <span className="text-xs italic text-gray-400 -mt-1">project</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Complétez votre profil</h1>
          <p className="text-gray-500 text-sm">Parlez-nous de votre entreprise</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">🏢 Nom de l'entreprise</label>
            <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none transition-all" placeholder="Ma Super Boîte" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">👤 Votre nom</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none transition-all" placeholder="Jean Dupont" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">👥 Taille de l'entreprise</label>
            <select value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none bg-white">
              <option value="">Sélectionnez</option>
              <option value="1">Freelance / Indépendant</option>
              <option value="2-10">TPE (2-10)</option>
              <option value="10-50">PME (10-50)</option>
              <option value="50-200">ETI (50-200)</option>
              <option value="200+">Grande entreprise (200+)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">🎯 Secteur d'activité</label>
            <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none bg-white">
              <option value="">Sélectionnez</option>
              <option value="tech">Tech / SaaS</option>
              <option value="finance">Finance / Banque</option>
              <option value="sante">Santé / Medtech</option>
              <option value="commerce">E-commerce / Retail</option>
              <option value="industrie">Industrie / Manufacturing</option>
              <option value="consulting">Conseil / Consulting</option>
              <option value="media">Média / Communication</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50">
            {loading ? "Enregistrement..." : "C'est parti →"}
          </button>
        </form>
      </div>
    </div>
  );
}
