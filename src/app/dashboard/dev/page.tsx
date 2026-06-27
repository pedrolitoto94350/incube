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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile?.full_name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <DashboardNav role="dev" />
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 p-8 md:p-12 text-white">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-lg" />
            <h2 className="text-2xl md:text-3xl font-bold mb-2 relative">Bienvenue sur InCube 👋</h2>
            <p className="text-indigo-100 mb-8 max-w-md relative">Complète ton profil en 2 minutes pour que les employeurs te trouvent.</p>
            <Link
              href="/dashboard/dev/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-medium hover:shadow-xl hover:shadow-indigo-500/20 transition-all relative"
            >
              ✨ Compléter mon profil
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const parseSkills = (skills: any): string[] => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === "string") { try { return JSON.parse(skills); } catch { return []; } }
    return [];
  };
  const skills = parseSkills(profile.skills);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <DashboardNav role="dev" />
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-12">
        {/* Header avec bienvenue */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Hey {profile.full_name.split(" ")[0]} ✨
            </h1>
            <p className="text-slate-500 mt-1">Voici ton tableau de bord développeur</p>
          </div>
          <Link
            href="/dashboard/dev/matches"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all"
          >
            🤝 Voir mes matches
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {[
            { label: "Anglais", value: profile.english_level || "Non renseigné", emoji: "🌍", color: "from-indigo-50 to-purple-50" },
            { label: "Disponibilité", value: profile.availability || "Non renseignée", emoji: "⏰", color: "from-amber-50 to-orange-50" },
            { label: "Matching", value: "En recherche active", emoji: "🎯", color: "from-indigo-50 to-purple-50" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl bg-gradient-to-br ${stat.color} p-4 border border-white/50`}
            >
              <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                <span>{stat.emoji}</span>
                {stat.label}
              </div>
              <p className="text-slate-800 font-semibold mt-1.5 capitalize">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Compétences - section hero */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">🛠️ Compétences</h2>
            <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm">{skills.length} compétence(s)</span>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-100 p-6 shadow-sm">
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {skills.map((s: string) => (
                  <span
                    key={s}
                    className="px-3.5 py-2 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 rounded-xl text-sm font-medium shadow-sm border border-indigo-100/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Aucune compétence renseignée</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">📝 Bio</h2>
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
            </div>
          </div>
        )}

        {/* Quick links mobile */}
        <div className="sm:hidden grid grid-cols-2 gap-3">
          <Link href="/dashboard/dev/matches" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium">
            🤝 Mes matches
          </Link>
          <Link href="/dashboard/dev/profile" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium">
            ✏️ Modifier profil
          </Link>
        </div>
      </div>
    </div>
  );
}
