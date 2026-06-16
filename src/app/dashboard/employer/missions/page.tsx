"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import DashboardNav from "../../../../components/DashboardNav";
import Link from "next/link";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function EmployerMissionsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("matches").select("*").eq("employer_id", user.id).order("created_at", { ascending: false });
      if (data) setMatches(data);
      setLoading(false);
    })();
  }, [router]);

  const statusColors: Record<string, string> = {
    open: "bg-green-50 text-green-700",
    proposed: "bg-yellow-50 text-yellow-700",
    matched: "bg-blue-50 text-blue-700",
    completed: "bg-gray-50 text-gray-600",
    cancelled: "bg-red-50 text-red-600",
  };

  const statusLabels: Record<string, string> = {
    open: "Active",
    proposed: "En cours",
    matched: "Match",
    completed: "Terminée",
    cancelled: "Annulée",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav role="employer" />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Mes missions</h1>
          <Link href="/dashboard/employer/create-mission" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition-all">
            + Nouvelle mission
          </Link>
        </div>

        {loading && <p className="text-gray-500">Chargement...</p>}

        {!loading && matches.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Aucune mission créée pour le moment.</p>
            <Link href="/dashboard/employer/create-mission" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
              Créer ma première mission →
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((match) => (
            <Link
              key={match.id}
              href={`/dashboard/employer/missions/${match.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{match.title || "Mission sans titre"}</h3>
                <span className={classNames("px-3 py-1 text-xs font-medium rounded-full", statusColors[match.status] || "bg-gray-50")}>
                  {statusLabels[match.status] || match.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {match.project_type && <span>{match.project_type}</span>}
                {match.budget && <span>💰 {match.budget}€</span>}
              </div>
              {match.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{match.description}</p>}
              <p className="text-xs text-gray-400 mt-3">
                Créée le {new Date(match.created_at).toLocaleDateString("fr-FR")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
