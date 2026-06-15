"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import DashboardNav from "@/components/DashboardNav";

export default function EmployerEditProfile() {
  const router = useRouter();
  const [form, setForm] = useState({ company_name: "", full_name: "", company_size: "", sector: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setForm({
          company_name: data.company_name || "",
          full_name: data.full_name || "",
          company_size: data.company_size || "",
          sector: data.sector || "",
        });
      }
      setLoading(false);
    })();
  }, [router]);

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Chargement...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav role="employer" />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <h1 className="text-2xl font-bold mb-6">Mon profil entreprise</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">🏢 Entreprise</label>
            <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">👤 Votre nom</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">👥 Taille</label>
            <select value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white">
              <option value="">Sélectionnez</option>
              <option value="1">Freelance</option>
              <option value="2-10">TPE (2-10)</option>
              <option value="10-50">PME (10-50)</option>
              <option value="50-200">ETI (50-200)</option>
              <option value="200+">Grande entreprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">🎯 Secteur</label>
            <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white">
              <option value="">Sélectionnez</option>
              <option value="tech">Tech / SaaS</option>
              <option value="finance">Finance</option>
              <option value="sante">Santé</option>
              <option value="commerce">E-commerce</option>
              <option value="industrie">Industrie</option>
              <option value="consulting">Conseil</option>
              <option value="media">Média</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <button onClick={save} disabled={saving} className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}
