"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import DashboardNav from "../../../../components/DashboardNav";

export default function CreateMissionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", project_type: "", budget: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { error: insertError } = await supabase.from("matches").insert({
      employer_id: user.id,
      title: form.title,
      description: form.description,
      project_type: form.project_type,
      budget: form.budget ? parseInt(form.budget) : null,
      status: "open",
    });
    if (insertError) { setError(insertError.message); setLoading(false); return; }
    router.push("/dashboard/employer/missions");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav role="employer" />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <h1 className="text-2xl font-bold mb-6">Nouvelle mission</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Titre</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Type de projet</label>
            <input type="text" value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none" placeholder="Web, Mobile, Data..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Budget (€)</label>
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none" />
          </div>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? "Publication..." : "Publier la mission"}
          </button>
        </form>
      </div>
    </div>
  );
}
