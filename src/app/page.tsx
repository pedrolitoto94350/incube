"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { CookieFooterLink } from "@/components/CookieConsent";

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, size: Math.random() * 2 + 1 });
    }
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(99, 102, 241, 0.12)";
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

function FloatingCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <>
      <ParticleBackground />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-emerald-300">InCube</Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#pourquoi-incube" className="text-emerald-100/70 hover:text-emerald-100 transition-colors">Notre philosophie</a>
            <a href="#pour-employeurs" className="text-emerald-100/70 hover:text-emerald-100 transition-colors">Employeurs</a>
            <a href="#comment-ca-marche" className="text-emerald-100/70 hover:text-emerald-100 transition-colors">Comment ça marche</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-emerald-100/70 hover:text-emerald-100">Connexion</Link>
            <Link href="/signup" className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg transition-all">Rejoindre</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
        <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <motion.div className="relative z-10 max-w-4xl mx-auto text-center px-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div className="inline-block mb-6 px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs text-white font-medium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            🚀 Plateforme de matching équitable
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
            Le talent ne se mesure<br /><span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">pas à un diplôme</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            InCube connecte les développeurs de la nouvelle génération — no-code, automation, agents IA — aux entreprises qui ont un projet à concrétiser. Sans CV à rallonge. Sans intermédiaire qui prend tout. Juste le travail, et la rencontre.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup/dev" className="px-8 py-4 rounded-2xl bg-white text-emerald-800 font-semibold text-lg hover:shadow-xl transition-all">Je suis développeur</Link>
            <Link href="/signup/employer" className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/20 transition-all">Je cherche un développeur</Link>
          </div>
        </motion.div>
      </section>

      {/* POURQUOI INCUBE — 3 piliers */}
      <section id="pourquoi-incube" className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs text-emerald-600 font-medium uppercase tracking-widest">Notre philosophie</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Une plateforme pensée autrement</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FloatingCard delay={0}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 transition-all h-full">
                <h3 className="text-lg font-semibold mb-3">Le travail avant le diplôme</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Ici, on ne demande pas votre parcours. On regarde ce que vous savez faire : vos démos, vos projets, vos compétences réelles. Votre profil reste anonyme jusqu&apos;au match — c&apos;est votre travail qui parle en premier.</p>
              </div>
            </FloatingCard>
            <FloatingCard delay={0.15}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 transition-all h-full">
                <h3 className="text-lg font-semibold mb-3">Les devs gardent 100%</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Aucune commission prélevée sur le développeur. Vous fixez votre tarif, vous touchez l&apos;intégralité. La mise en relation est financée par l&apos;entreprise, pas par vous.</p>
              </div>
            </FloatingCard>
            <FloatingCard delay={0.3}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 transition-all h-full">
                <h3 className="text-lg font-semibold mb-3">Un tremplin, pas une cage</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Notre but n&apos;est pas de vous retenir, mais de vous lancer. Décrochez vos premières missions, construisez un vrai portfolio, et prenez votre envol. On est fiers d&apos;être votre point de départ.</p>
              </div>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* POUR LES ENTREPRISES */}
      <section id="pour-employeurs" className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs text-emerald-600 font-medium uppercase tracking-widest">Côté employeurs</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Recruteurs : le talent, sans le risque</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Site vitrine, automatisation, e-commerce, agents IA : trouvez le profil qu&apos;il vous faut, au bon prix, sans engagement.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FloatingCard delay={0}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 transition-all h-full">
                <h3 className="text-lg font-semibold mb-2">Zéro risque</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Parcourez les profils gratuitement. Vous ne payez rien tant que vous n&apos;avez pas trouvé votre développeur.</p>
              </div>
            </FloatingCard>
            <FloatingCard delay={0.15}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 transition-all h-full">
                <h3 className="text-lg font-semibold mb-2">Coût transparent</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Un montant clair, connu d&apos;avance, au moment du match. Pas de pourcentage qui gonfle, pas de frais cachés.</p>
              </div>
            </FloatingCard>
            <FloatingCard delay={0.3}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 transition-all h-full">
                <h3 className="text-lg font-semibold mb-2">Rapide</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Des profils disponibles, prêts à démarrer, sélectionnés pour leurs compétences concrètes.</p>
              </div>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE — 3 étapes */}
      <section id="comment-ca-marche" className="relative z-10 py-32 px-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs text-emerald-200 font-medium uppercase tracking-widest">Processus</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-16">Simple, du début à la fin</h2>
          <div className="grid md:grid-cols-3 gap-12 text-left">
            <div>
              <div className="text-4xl font-bold text-emerald-300 mb-3">1.</div>
              <h3 className="text-lg font-semibold mb-2">Parcourez</h3>
              <p className="text-emerald-200 text-sm leading-relaxed">Parcourez les profils anonymes et découvrez les compétences, les démos et les tarifs.</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-300 mb-3">2.</div>
              <h3 className="text-lg font-semibold mb-2">Proposez</h3>
              <p className="text-emerald-200 text-sm leading-relaxed">Proposez votre projet au développeur de votre choix. Il accepte — et seulement là, vous échangez vos coordonnées.</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-300 mb-3">3.</div>
              <h3 className="text-lg font-semibold mb-2">Travaillez</h3>
              <p className="text-emerald-200 text-sm leading-relaxed">Vous travaillez en direct, en toute liberté. InCube vous a réunis, le reste vous appartient.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FINALE — CTA */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à commencer ?</h2>
          <p className="text-gray-600 mb-10">Que vous cherchiez votre première mission ou votre prochain collaborateur, votre place est ici.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup/dev" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-xl transition-all">Je suis développeur</Link>
            <Link href="/signup/employer" className="px-8 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-emerald-300 transition-all">Je cherche un développeur</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <span className="font-bold text-emerald-600 text-lg">InCube</span>
              <p className="text-sm text-gray-500 mt-2">Plateforme de matching équitable entre développeurs et employeurs.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Navigation</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <Link href="/login">Connexion</Link>
                <Link href="/signup">Inscription</Link>
                <a href="#pourquoi-incube">Notre philosophie</a>
                <a href="#comment-ca-marche">Comment ça marche</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Mentions légales</h4>
              <div className="text-sm text-gray-500 space-y-1">
                <p>SIRET 104 549 001 00014</p>
                <p>RCS Paris</p>
                <p>N° TVA : FR104549001</p>
              </div>
              <div className="mt-3">
                <CookieFooterLink onOpen={() => {}} />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            Propulsé par <a href="https://micheledouard.fr" className="hover:text-gray-600 underline">Micheledouard.fr</a> · © 2026 Tous droits réservés
          </div>
        </div>
      </footer>
    </>
  );
}
