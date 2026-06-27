"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardNavProps {
  role: "employer" | "dev";
}

export default function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isEmployer = role === "employer";

  const [devPendingCount, setDevPendingCount] = useState(0);
  const [empNotificationCount, setEmpNotificationCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isEmployer) {
        const { count } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("employer_id", user.id)
          .eq("status", "proposed");

        const channel = supabase
          .channel("employer-matches")
          .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "matches",
            filter: `employer_id=eq.${user.id}`,
          }, () => {
            fetchCounts();
            router.refresh();
          })
          .subscribe();
      } else {
        const { count } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("dev_id", user.id)
          .eq("status", "proposed");

        const channel = supabase
          .channel("dev-matches")
          .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "matches",
            filter: `dev_id=eq.${user.id}`,
          }, () => {
            fetchCounts();
            router.refresh();
          })
          .subscribe();
      }
    };
    fetchCounts();
  }, [isEmployer, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const devLinks = [
    { href: "/dashboard/dev", label: "📊 Dashboard" },
    { href: "/dashboard/dev/matches", label: "🤝 Mes matchs" },
    { href: "/dashboard/dev/profile", label: "👤 Mon profil" },
  ];

  const empLinks = [
    { href: "/dashboard/employer", label: "📊 Dashboard" },
    { href: "/dashboard/employer/missions", label: "📋 Mes missions" },
    { href: "/dashboard/employer/create-mission", label: "➕ Nouvelle mission" },
    { href: "/dashboard/employer/profile", label: "👤 Mon profil" },
  ];

  const links = isEmployer ? empLinks : devLinks;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md ${
        isEmployer
          ? "bg-emerald-950 text-emerald-100 border-emerald-800"
          : "bg-indigo-950 text-indigo-100 border-indigo-800"
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`flex flex-col leading-none ${
                isEmployer ? "text-emerald-300" : "text-indigo-300"
              }`}
            >
              <span className="font-bold text-lg">InCube</span>
              <span className="text-[11px] italic opacity-60 -mt-0.5">
                project
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm"
                >
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav"
                      className={`absolute -bottom-[17px] left-0 right-0 h-0.5 ${
                        isEmployer ? "bg-emerald-400" : "bg-indigo-400"
                      }`}
                    />
                  )}
                  <span
                    className={`relative inline-flex items-center gap-1 ${
                      pathname === link.href
                        ? isEmployer
                          ? "text-emerald-200 font-medium"
                          : "text-indigo-200 font-medium"
                        : "text-white/60 hover:text-white/90"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
              <span className={`ml-4 text-xs px-3 py-1 rounded-xl font-bold tracking-wider uppercase ${
                isEmployer
                  ? "bg-emerald-800 text-emerald-200"
                  : "bg-indigo-800 text-indigo-200"
              }`}>
                {isEmployer ? "🏢 EMPLOYEUR" : "👨‍💻 DEV"}
              </span>
            </div>
          </div>

          {(devPendingCount > 0 && !isEmployer) && (
            <div className="md:hidden flex items-center gap-1 mr-2">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {devPendingCount}
              </span>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white/80 p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <button
            onClick={handleLogout}
            className={`hidden md:block text-sm transition-colors ${
              isEmployer
                ? "text-emerald-300 hover:text-emerald-100"
                : "text-indigo-300 hover:text-indigo-100"
            }`}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-16 left-0 right-0 z-50 md:hidden shadow-lg border-b ${
              isEmployer
                ? "bg-emerald-950 border-emerald-800"
                : "bg-indigo-950 border-indigo-800"
            }`}
          >
            <div className="px-4 py-3 space-y-1">
              <div className={`text-xs px-3 py-2 rounded-xl font-bold tracking-wider uppercase text-center mb-2 ${
                isEmployer
                  ? "bg-emerald-800 text-emerald-200"
                  : "bg-indigo-800 text-indigo-200"
              }`}>
                {isEmployer ? "🏢 EMPLOYEUR" : "👨‍💻 DEV"}
              </div>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? isEmployer
                        ? "bg-emerald-800 text-emerald-200"
                        : "bg-indigo-800 text-indigo-200"
                      : "text-white/60 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                  {link.badge && link.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {link.badge > 9 ? "9+" : link.badge}
                    </span>
                  )}
                </Link>
              ))}
              <hr className={`my-2 ${isEmployer ? "border-emerald-800" : "border-indigo-800"}`} />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-900/30 font-medium transition-all"
              >
                🚪 Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
