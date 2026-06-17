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

  const links = role === "dev" ? devLinks : employerLinks;
  const currentLabel = links.find(l => pathname === l.href)?.label || "Menu";

  return (
    <>
      {/* Desktop nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InCube</Link>
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="relative text-sm">
                  {pathname === link.href && (
                    <motion.div layoutId="nav" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                  <span className={pathname === link.href ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-gray-900"}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <button onClick={handleLogout} className="hidden md:block text-sm text-gray-500 hover:text-red-600 transition-colors">Déconnexion</button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-50 md:hidden bg-white border-b border-gray-100 shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-100" />
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 font-medium transition-all">
                🚪 Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
