"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase";
import DashboardNav from "../../../components/DashboardNav";
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
        <h1 className="text-2xl font-bold mb-6">Dashboard employeur</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="font-semibold text-lg mb-4">Bienvenue, {profile?.company_name} 👋</h2>
          <p className="text-gray-500 mb-6">Publiez une mission et trouvez des talents.</p>
          <Link href="/dashboard/employer/create-mission" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all">
            Publier une mission
          </Link>
        </div>
      </div>
    </div>
  );
}
