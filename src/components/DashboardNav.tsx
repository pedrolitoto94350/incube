"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardNav({ role }: { role: "dev" | "employer" }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const devLinks = [
    { href: "/dashboard/dev", label: "Dashboard" },
    { href: "/dashboard/dev/matches", label: "Mes matches" },
    { href: "/dashboard/dev/profile", label: "Mon profil" },
  ];

  const employerLinks = [
    { href: "/dashboard/employer", label: "Dashboard" },
    { href: "/dashboard/employer/missions", label: "Mes missions" },
    { href: "/dashboard/employer/create-mission", label: "Nouvelle mission" },
    { href: "/dashboard/employer/profile", label: "Mon profil" },
  ];

  const links = role === "dev" ? devLinks : employerLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InCube</Link>
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="relative text-sm">
                {pathname === link.href && (
                  <motion.div layoutId="nav" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-indigo-600" />
                )}
                <span className={pathname === link.href ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-gray-900"}>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">Déconnexion</button>
      </div>
    </nav>
  );
}
