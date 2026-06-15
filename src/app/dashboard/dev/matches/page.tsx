"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import DashboardNav from "../../../../components/DashboardNav";

export default function DevMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("matches").select("*").eq("dev_id", user.id).order("created_at", { ascending: false });
      if (data) setMatches(data);
      setLoading(false);
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav role="dev" />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <h1 className="text-2xl font-bold mb-6">Mes matches</h1>
        {loading && <p className="text-gray-500">Chargement...</p>}
        {!loading && matches.length === 0 && <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><p className="text-gray-500">Aucun match pour le moment.</p></div>}
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${match.status === "matched" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{match.status}</span>
              </div>
              <p className="text-gray-700 text-sm">{match.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
