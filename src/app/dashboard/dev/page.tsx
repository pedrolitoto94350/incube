"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import DashboardNav from "@/components/DashboardNav";
import Link from "next/link";

export default function DevDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Chargement...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav role="dev" />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard développeur</h1>
        </div>

        {!profile?.full_name ? (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-xl font-bold mb-2">Bienvenue sur InCube 👋</h2>
            <p className="text-indigo-100 mb-6">Commence par compléter ton profil pour que les employeurs puissent te trouver.</p>
            <Link href="/dashboard/dev/profile" className="inline-block px-6 py-3 rounded-xl bg-white text-indigo-600 font-medium hover:shadow-lg transition-all">
              Compléter mon profil →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="font-semibold text-xl mb-1">Salut {profile.full_name} 👋</h2>
            <p className="text-gray-500 mb-6">Bienvenue sur ton tableau de bord.</p>

            {/* Skills section — agrandie et aérée */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">🛠️ Compétences</span>
                  <p className="text-sm text-gray-400 mt-0.5">Les compétences que tu as renseignées</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(profile.skills) ? profile.skills.map((s: string) => (
                  <span key={s} className="px-3.5 py-2 bg-white shadow-sm border border-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:shadow-md hover:border-indigo-200 transition-all">
                    {s}
                  </span>
                )) : <span className="text-gray-400 text-sm">—</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider">🌍 Anglais</span>
                <p className="font-semibold mt-1.5 capitalize">{profile.english_level || "—"}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider">⏰ Disponibilité</span>
                <p className="font-semibold mt-1.5 capitalize">{profile.availability || "—"}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider">📧 Email</span>
                <p className="font-semibold mt-1.5 text-sm truncate">{profile.email}</p>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 bg-slate-50 rounded-xl p-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider">📝 Bio</span>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
