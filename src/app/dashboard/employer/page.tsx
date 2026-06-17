"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import DashboardNav from "@/components/DashboardNav";
import Link from "next/link";

export default function EmployerDashboard() {
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
      <DashboardNav role="employer" />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <h1 className="text-2xl font-bold mb-8">Dashboard employeur</h1>

        {!profile?.company_name ? (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-xl font-bold mb-2">Bienvenue sur InCube 👋</h2>
            <p className="text-indigo-100 mb-6">Commence par compléter ton profil entreprise.</p>
            <Link href="/dashboard/employer/profile" className="inline-block px-6 py-3 rounded-xl bg-white text-indigo-600 font-medium hover:shadow-lg transition-all">
              Compléter mon profil →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="font-semibold text-xl mb-1">{profile.company_name} 👋</h2>
            <p className="text-gray-500 mb-6">Bienvenue sur ton tableau de bord employeur.</p>

            {/* Company info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider">🏢 Entreprise</span>
                <p className="font-semibold mt-1.5">{profile.company_name}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider">📧 Email</span>
                <p className="font-semibold mt-1.5 text-sm truncate">{profile.email}</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-3">🚀 Actions rapides</h3>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/employer/create-mission" className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all">
                  + Publier une mission
                </Link>
                <Link href="/dashboard/employer/missions" className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:border-indigo-200 hover:text-indigo-600 transition-all">
                  📋 Voir mes missions
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
