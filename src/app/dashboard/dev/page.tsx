"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase";
import DashboardNav from "../../../components/DashboardNav";

interface Profile {
  full_name: string;
  email: string;
  skills: string;
  role: string;
}

export default function DevDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
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
        <h1 className="text-2xl font-bold mb-6">Dashboard développeur</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="font-semibold text-lg mb-4">Bienvenue, {profile?.full_name} 👋</h2>
          <p className="text-gray-500 mb-6">Complétez votre profil pour augmenter vos chances de match.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-xl p-4"><span className="text-sm text-gray-500">Compétences</span><p className="font-medium">{profile?.skills || "Non renseigné"}</p></div>
            <div className="bg-indigo-50 rounded-xl p-4"><span className="text-sm text-gray-500">Email</span><p className="font-medium">{profile?.email}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
