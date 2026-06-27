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
  const [missions, setMissions] = useState<any[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);

      const { data: mData } = await supabase.from("matches").select("id").eq("employer_id", user.id);
      if (mData) setMatchesCount(mData.length);

      const { data: missData } = await supabase.from("matches").select("title, budget, status").eq("employer_id", user.id);
      if (missData) setMissions(missData);

      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile?.company_name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
        <DashboardNav role="employer" />
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-8 md:p-12 text-white">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-lg" />
            <h2 className="text-2xl md:text-3xl font-bold mb-2 relative">Bienvenue sur InCube 👋</h2>
            <p className="text-emerald-100 mb-8 max-w-md relative">Configure ton profil entreprise pour commencer à recruter.</p>
            <Link
              href="/dashboard/employer/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-700 font-medium hover:shadow-xl hover:shadow-emerald-500/20 transition-all relative"
            >
              ✨ Configurer mon entreprise
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeMissions = missions.filter(m => m.status === "proposed" || m.status === "active").length;
  const matchedMissions = missions.filter(m => m.status === "matched").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DashboardNav role="employer" />
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-12">
        {/* Header */}
        {/* Missing card banner */}
        {!profile?.stripe_payment_method_id && (
          <div className="mb-6 p-4 rounded-xl border border-dashed border-gray-200 bg-white flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800">💳 Carte bleue requise</p>
              <p className="text-sm text-gray-500">Vous ne pouvez pas proposer de mission sans carte enregistrée.</p>
            </div>
            <Link href="/dashboard/employer/profile" className="shrink-0 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap">
              Ajouter →
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {profile.company_name} ✨
            </h1>
            <p className="text-slate-500 mt-1">Tableau de bord recruteur</p>
          </div>
          <Link
            href="/dashboard/employer/create-mission"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all"
          >
            ➜ Publier une mission
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Missions actives", value: activeMissions, emoji: "📋", color: "from-blue-50 to-emerald-50" },
            { label: "Matchs réalisés", value: matchedMissions, emoji: "🤝", color: "from-emerald-50 to-teal-50" },
            { label: "Propositions", value: matchesCount, emoji: "📩", color: "from-amber-50 to-orange-50" },
            { label: "Secteur", value: profile.sector || "—", emoji: "🎯", color: "from-rose-50 to-pink-50" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl bg-gradient-to-br ${stat.color} p-4 border border-white/50`}
            >
              <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                <span>{stat.emoji}</span>
                {stat.label}
              </div>
              <p className="text-slate-800 font-semibold mt-1.5 capitalize text-lg">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">🚀 Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/dashboard/employer/create-mission"
              className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <span className="text-2xl mb-2 block">📝</span>
              <p className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">Nouvelle mission</p>
              <p className="text-sm text-slate-400 mt-1">Décris le projet et ton budget</p>
            </Link>
            <Link
              href="/dashboard/employer/missions"
              className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <span className="text-2xl mb-2 block">📋</span>
              <p className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">Mes missions</p>
              <p className="text-sm text-slate-400 mt-1">Gère tes annonces et propositions</p>
            </Link>
            <Link
              href="/dashboard/employer/profile"
              className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <span className="text-2xl mb-2 block">⚙️</span>
              <p className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">Mon profil</p>
              <p className="text-sm text-slate-400 mt-1">Gère les infos de ton entreprise</p>
            </Link>
          </div>
        </div>

        {/* Mobile shortcuts */}
        <div className="sm:hidden grid grid-cols-2 gap-3">
          <Link href="/dashboard/employer/missions" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium">
            📋 Mes missions
          </Link>
          <Link href="/dashboard/employer/create-mission" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium">
            ➜ Nouvelle mission
          </Link>
        </div>
      </div>
    </div>
  );
}
