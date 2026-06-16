"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import DashboardNav from "../../../../components/DashboardNav";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DevMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [refusing, setRefusing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: mData } = await supabase.from("matches").select("*").eq("dev_id", user.id).order("created_at", { ascending: false });
      if (mData) {
        setMatches(mData);
        // Fetch employer profiles
        // Parse skills from string to array if needed
      const parseSkills = (skills: any): string[] => {
        if (Array.isArray(skills)) return skills;
        if (typeof skills === 'string') {
          try { return JSON.parse(skills); } catch { return []; }
        }
        return [];
      };

      const employerIds = [...new Set(mData.map((m: any) => m.employer_id))];
        if (employerIds.length > 0) {
          const { data: pData } = await supabase.from("profiles").select("*").in("id", employerIds);
          if (pData) {
            const profileMap: Record<string, any> = {};
            pData.forEach((p) => { profileMap[p.id] = p; });
            setProfiles(profileMap);
          }
        }
      }
      setLoading(false);
    })();
  }, [router]);

  const acceptMission = async (matchId: string) => {
    setAccepting(matchId);
    const supabase = createClient();
    const { error } = await supabase.from("matches").update({ status: "matched" }).eq("id", matchId);
    if (error) {
      setMessage("Erreur lors de l'acceptation");
    } else {
      setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, status: "matched" } : m));
      setMessage("✅ Mission acceptée ! L'employeur va vous contacter.");
    }
    setAccepting(null);
  };

  const refuseMission = async (matchId: string) => {
    setRefusing(matchId);
    const supabase = createClient();
    const { error } = await supabase.from("matches").update({ status: "cancelled" }).eq("id", matchId);
    if (error) {
      setMessageType("error");
      setMessage("Erreur lors du refus");
    } else {
      setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, status: "cancelled" } : m));
      setMessageType("error");
      setMessage("❌ Mission refusée");
    }
    setRefusing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav role="dev" />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <h1 className="text-2xl font-bold mb-6">Mes propositions</h1>

        {message && <div className={classNames("mb-6 p-4 rounded-xl text-sm", messageType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600")}>{message}</div>}

        {loading && <p className="text-gray-500">Chargement...</p>}

        {!loading && matches.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Aucune proposition pour le moment.</p>
            <p className="text-gray-400 text-sm mt-2">Les employeurs te proposeront des missions ici.</p>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((match) => {
            const employer = profiles[match.employer_id];
            return (
              <div
                key={match.id}
                className={classNames(
                  "bg-white rounded-xl border p-6 transition-all",
                  match.status === "matched" ? "border-green-200 bg-green-50/30" : "border-gray-200"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={classNames("px-3 py-1 text-xs font-medium rounded-full",
                        match.status === "matched" ? "bg-green-50 text-green-700" :
                        match.status === "proposed" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-700"
                      )}>
                        {match.status === "matched" ? "✅ Acceptée" :
                         match.status === "proposed" ? "📩 Proposition" : match.status}
                      </span>
                      {match.budget && <span className="text-sm text-gray-500">💰 {match.budget}€</span>}
                    </div>

                    <h3 className="font-semibold text-lg mt-2">{match.title || "Mission"}</h3>
                    {employer && <p className="text-sm text-gray-500 mt-0.5">Par {employer.company_name || employer.full_name || "un employeur"}</p>}
                    {match.description && <p className="text-sm text-gray-600 mt-2">{match.description}</p>}
                    {match.project_type && <p className="text-xs text-gray-400 mt-2">{match.project_type}</p>}

                    <p className="text-xs text-gray-400 mt-3">
                      Reçue le {new Date(match.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {match.status === "proposed" && (
                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => acceptMission(match.id)}
                        disabled={accepting === match.id}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {accepting === match.id ? "..." : "✅ Accepter"}
                      </button>
                      <button
                        onClick={() => refuseMission(match.id)}
                        disabled={refusing === match.id}
                        className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {refusing === match.id ? "..." : "❌ Refuser"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
