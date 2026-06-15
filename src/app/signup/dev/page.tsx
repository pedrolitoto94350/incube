"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase";
import Link from "next/link";

export default function SignupDevPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", skills: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: "dev" } },
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: form.full_name,
        email: form.email,
        role: "dev",
        skills: form.skills,
      });
    }
    router.push("/dashboard/dev");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InCube</Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Inscription développeur</h1>
          <p className="text-gray-500 text-sm">Montrez vos compétences, pas votre CV</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-100 space-y-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Nom complet</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Mot de passe</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Compétences</label>
            <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none transition-all" placeholder="React, Node.js, Python..." />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? "Inscription..." : "Créer mon compte"}
          </button>
          <p className="text-center text-sm text-gray-500">Déjà inscrit ? <Link href="/login" className="text-indigo-600 hover:underline">Se connecter</Link></p>
        </form>
      </div>
    </div>
  );
}
