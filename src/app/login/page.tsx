"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";
import Link from "next/link";

export default function LoginPage() {
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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setError("Erreur de connexion"); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    router.push(profile?.role === "employer" ? "/dashboard/employer" : "/dashboard/dev");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-emerald-600">InCube</Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Connexion</h1>
          <p className="text-gray-500 text-sm">Accédez à votre tableau de bord</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all" placeholder="vous@exemple.fr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <p className="text-center text-sm text-gray-500">Pas encore inscrit ? <Link href="/signup" className="text-emerald-600 hover:underline">Créer un compte</Link></p>
        </form>
      </div>
    </div>
  );
}
