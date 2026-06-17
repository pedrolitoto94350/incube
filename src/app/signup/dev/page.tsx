"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function SignupDevPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: "dev" } },
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    router.push("/signup/dev/profile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 to-white py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-emerald-600">InCube</Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Devenir développeur</h1>
          <p className="text-gray-500 text-sm">Crée ton compte en 10 secondes</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all" placeholder="vous@exemple.fr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all" placeholder="6 caractères minimum" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50">
            {loading ? "Création..." : "Créer mon compte"}
          </button>
          <p className="text-center text-sm text-gray-500">Déjà inscrit ? <Link href="/login" className="text-emerald-600 hover:underline">Se connecter</Link></p>
        </form>
      </div>
    </div>
  );
}
