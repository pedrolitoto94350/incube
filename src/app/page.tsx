"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

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
    for (let i = 0; i < 80; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, size: Math.random() * 3 + 1 });
    }
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
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
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
}

function FloatingCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-lg border-b border-gray-100" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InCube</Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">Comment ça marche</a>
          <a href="#for-devs" className="hover:text-indigo-600 transition-colors">Développeurs</a>
          <a href="#for-employers" className="hover:text-indigo-600 transition-colors">Employeurs</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-700 hover:text-indigo-600">Connexion</Link>
          <Link href="/signup" className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all">Rejoindre</Link>
        </div>
      </div>
    </nav>
  );
}

const steps = [
  { number: "01", title: "Inscrivez-vous", desc: "Développeur ou employeur, créez votre profil en 2 minutes.", color: "from-indigo-500 to-purple-500" },
  { number: "02", title: "Matching aléatoire", desc: "Notre algo vous présente des profils sans biais.", color: "from-purple-500 to-pink-500" },
  { number: "03", title: "Match & échangez", desc: "Si les deux sont intéressés, c'est un match !", color: "from-pink-500 to-rose-500" },
  { number: "04", title: "Mission accomplie", desc: "Commission unique de 300€. Zéro engagement.", color: "from-rose-500 to-orange-500" },
];

export default function Home() {
  return (
    <>
      <ParticleBackground />
      <Navbar />
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <motion.div className="max-w-4xl mx-auto text-center" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div className="inline-block mb-6 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs text-indigo-600 font-medium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            🚀 Nouvelle plateforme de matching équitable
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Le matching<br /><span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">enfin équitable</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            InCube connecte développeurs juniors français avec employeurs européens. Matching aléatoire, zéro CV, zéro engagement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup/dev" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg hover:shadow-xl transition-all">Je suis développeur</Link>
            <Link href="/signup/employer" className="px-8 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:border-indigo-300 transition-all">Je recrute</Link>
          </div>
        </motion.div>
      </section>
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs text-indigo-600 font-medium uppercase tracking-widest">Comment ça marche</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Du profil à la mission en 4 étapes</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <FloatingCard key={step.number} delay={i * 0.15}>
                <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 transition-all">
                  <span className={`inline-block text-3xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-4`}>{step.number}</span>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>
      <section className="py-32 px-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div><div className="text-5xl font-bold mb-2">300€</div><div className="text-indigo-200 text-lg">Commission unique par mission</div></div>
            <div><div className="text-5xl font-bold mb-2">0%</div><div className="text-indigo-200 text-lg">De commission pour les devs</div></div>
            <div><div className="text-5xl font-bold mb-2">7 jours</div><div className="text-indigo-200 text-lg">Pour trouver votre match</div></div>
          </div>
        </div>
      </section>
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à rejoindre l'aventure ?</h2>
          <p className="text-gray-600 mb-10">Inscrivez-vous gratuitement. Pas d'abonnement, pas d'engagement.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup/dev" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-xl transition-all">Je suis développeur</Link>
            <Link href="/signup/employer" className="px-8 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-indigo-300 transition-all">Je recrute</Link>
          </div>
        </div>
      </section>
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InCube</span>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/login">Connexion</Link>
            <Link href="/signup">Inscription</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
