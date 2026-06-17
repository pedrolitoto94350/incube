"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardNav({ role }: { role: "dev" | "employer" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isEmployer = role === "employer";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const devLinks = [
    { href: "/dashboard/dev", label: "📊 Dashboard" },
    { href: "/dashboard/dev/matches", label: "🤝 Mes matches" },
    { href: "/dashboard/dev/profile", label: "👤 Mon profil" },
  ];

  const employerLinks = [
    { href: "/dashboard/employer", label: "📊 Dashboard" },
    { href: "/dashboard/employer/missions", label: "📋 Mes missions" },
    { href: "/dashboard/employer/create-mission", label: "➕ Nouvelle mission" },
    { href: "/dashboard/employer/profile", label: "👤 Mon profil" },
  ];

  const links = isEmployer ? employerLinks : devLinks;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md ${
        isEmployer
          ? "bg-emerald-950 text-emerald-100 border-emerald-800"
          : "bg-indigo-950 text-indigo-100 border-indigo-800"
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className={`font-bold text-lg ${
              isEmployer ? "text-emerald-300" : "text-indigo-300"
            }`}>InCube</Link>
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="relative text-sm">
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav"
                      className={`absolute -bottom-[17px] left-0 right-0 h-0.5 ${
                        isEmployer ? "bg-emerald-400" : "bg-indigo-400"
                      }`}
                    />
                  )}
                  <span className={
                    pathname === link.href
                      ? (isEmployer ? "text-emerald-200 font-medium" : "text-indigo-200 font-medium")
                      : "text-white/60 hover:text-white/90"
                  }>
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

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/80 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <button onClick={handleLogout} className={`hidden md:block text-sm ${
            isEmployer ? "text-emerald-300 hover:text-emerald-100" : "text-indigo-300 hover:text-indigo-100"
          } transition-colors`}>Déconnexion</button>
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
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? isEmployer ? "bg-emerald-800 text-emerald-200" : "bg-indigo-800 text-indigo-200"
                      : "text-white/60 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className={`my-2 ${isEmployer ? "border-emerald-800" : "border-indigo-800"}`} />
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-900/30 font-medium transition-all">
                🚪 Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
