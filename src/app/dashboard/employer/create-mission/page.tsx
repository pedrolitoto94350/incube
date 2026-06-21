"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import DashboardNav from "../../../../components/DashboardNav";

const PREDEFINED_SKILLS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "PHP",
  "Tailwind CSS", "WordPress", "Shopify", "Laravel", "Flutter", "React Native",
  "SQL", "PostgreSQL", "Stripe API", "REST API", "GraphQL", "Docker", "AWS",
  "SEO", "UI/UX Design", "Figma", "Automatisation", "Chatbot IA",
];

const PROJECT_TYPE_SUGGESTIONS = [
  { label: "🌐 Site vitrine", desc: "Site institutionnel avec pages d'informations" },
  { label: "🛒 E-commerce", desc: "Boutique en ligne avec panier et paiement" },
  { label: "📱 Application mobile", desc: "App iOS ou Android" },
  { label: "🤖 Automatisation", desc: "Process automatisés, scraping, workflows" },
  { label: "🧠 IA / Chatbot", desc: "Intelligence artificielle, assistants" },
  { label: "📊 Dashboard SaaS", desc: "Application web avec comptes utilisateurs" },
  { label: "🎨 Landing page", desc: "Page de vente ou d'acquisition" },
  { label: "🔌 API / Backend", desc: "API REST, microservices, base de données" },
];

export default function CreateMissionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", description: "", project_type: [] as string[], budget: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchingDevs, setMatchingDevs] = useState<any[]>([]);
  const [searchingDevs, setSearchingDevs] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAnalysis = useCallback(async (desc: string, title: string) => {
    if (desc.length < 15) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/suggest-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc, title }),
      });
      const data = await res.json();
      if (data.skills) {
        setSuggestedSkills(data.skills);
      }
    } catch {}
    setAnalyzing(false);
  }, []);

  // Debounced analysis on description change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (form.description.length >= 15) {
        triggerAnalysis(form.description, form.title);
      }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.description, form.title, triggerAnalysis]);

  // Recherche de devs correspondants
  const searchDevs = useCallback(async () => {
    if (skills.length === 0) { setMatchingDevs([]); return; }
    setSearchingDevs(true);
    try {
      const res = await fetch("/api/devs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      });
      const data = await res.json();
      setMatchingDevs(data.devs || []);
    } catch {}
    setSearchingDevs(false);
  }, [skills]);

  useEffect(() => {
    const t = setTimeout(() => searchDevs(), 500);
    return () => clearTimeout(t);
  }, [skills, searchDevs]);

  const addSkill = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (s: string) => setSkills(skills.filter((k) => k !== s));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { error: insertError } = await supabase.from("matches").insert({
      employer_id: user.id,
      title: form.title,
      description: form.description,
      project_type: form.project_type.join(", "),
      budget: form.budget ? parseInt(form.budget) : null,
      required_skills: skills,
      status: "open",
    });
    if (insertError) { setError(insertError.message); setLoading(false); return; }
    router.push("/dashboard/employer/missions");
  };

  const canGoNext = () => {
    if (step === 1) return form.title.length >= 3 && form.description.length >= 15;
    if (step === 2) return skills.length > 0;
    if (step === 3) return form.project_type.length > 0;
    if (step === 4) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <DashboardNav role="employer" />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s ? "bg-emerald-500 text-white" : step === s ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "bg-gray-200 text-gray-500"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 4 && <div className={`w-12 h-0.5 ${step > s ? "bg-emerald-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 : Description */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="text-3xl mb-2 block">📝</span>
              <h2 className="text-xl font-bold text-gray-900">Décrivez votre projet</h2>
              <p className="text-sm text-gray-500 mt-1">Racontez-nous votre besoin en quelques phrases</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Titre de la mission *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Site e-commerce pour artisan chocolatier" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Description détaillée *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={5} placeholder="Décrivez votre projet en détail : objectifs, fonctionnalités souhaitées, public cible, contraintes techniques éventuelles..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none transition-all resize-y" />
                <p className="text-xs text-gray-400 mt-1">{form.description.length} caractères — minimum 15</p>
              </div>
              {analyzing && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 p-3 bg-emerald-50 rounded-xl">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  Analyse de votre description...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 : Compétences */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="text-3xl mb-2 block">🎯</span>
              <h2 className="text-xl font-bold text-gray-900">Compétences recherchées</h2>
              <p className="text-sm text-gray-500 mt-1">Voici les compétences que nous suggérons pour votre projet</p>
            </div>

            {suggestedSkills.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Suggestions basées sur votre description</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map((s) => (
                    <button key={s} onClick={() => addSkill(s)} disabled={skills.includes(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        skills.includes(s) ? "bg-emerald-100 text-emerald-500 cursor-default" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}>
                      {skills.includes(s) ? "✓ " : "+ "}{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {suggestedSkills.length > 0 ? "Ou ajoutez manuellement" : "Ajoutez les compétences nécessaires"}
              </p>
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))} placeholder="Ex: React, Stripe API, PostgreSQL..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none" />
                <button onClick={() => addSkill(skillInput)} disabled={!skillInput.trim()} className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200 transition-all disabled:opacity-40">Ajouter</button>
              </div>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-emerald-400 hover:text-red-500 transition-all">✕</button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-700">
                💡 <strong>Vous ne savez pas quelles compétences choisir ?</strong> Pas d'inquiétude — décrivez simplement votre projet à l'étape 1 et nous suggérons les compétences adaptées. Vous pouvez aussi les modifier librement.
              </p>
            </div>
          </div>
        )}

        {/* Step 3 : Type & Budget */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="text-3xl mb-2 block">📋</span>
              <h2 className="text-xl font-bold text-gray-900">Précisez votre projet</h2>
              <p className="text-sm text-gray-500 mt-1">Ces informations aideront les développeurs à se positionner</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Type(s) de projet</label>
                <p className="text-xs text-gray-400 mb-3">Sélectionnez un ou plusieurs types</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROJECT_TYPE_SUGGESTIONS.map((pt) => {
                    const selected = form.project_type.includes(pt.label);
                    return (
                      <button key={pt.label} type="button" onClick={() => {
                        setForm({
                          ...form,
                          project_type: selected
                            ? form.project_type.filter((t) => t !== pt.label)
                            : [...form.project_type, pt.label],
                        });
                      }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selected ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "border-gray-200 hover:border-emerald-300 bg-white"
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                            selected ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300"
                          }`}>
                            {selected && <span className="text-xs font-bold">✓</span>}
                          </div>
                          <div>
                            <span className="font-medium text-sm text-gray-900">{pt.label}</span>
                            <p className="text-xs text-gray-500 mt-0.5">{pt.desc}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {form.project_type.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.project_type.map((t) => (
                      <span key={t} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Budget indicatif (€)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                  <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Ex: 3000" className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 outline-none" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Optionnel — laissez vide si vous n'avez pas d'idée de budget</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 : Aperçu & devs */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="text-3xl mb-2 block">🔍</span>
              <h2 className="text-xl font-bold text-gray-900">Récapitulatif</h2>
              <p className="text-sm text-gray-500 mt-1">{matchingDevs.length} développeur(s) correspondent à vos critères</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <h3 className="font-semibold text-gray-900">{form.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{form.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">{s}</span>
                ))}
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                {form.project_type.length > 0 && <span>📋 {form.project_type.join(" · ")}</span>}
                {form.budget && <span>💰 {form.budget}€</span>}
              </div>
            </div>

            {/* Matching devs preview */}
            <div className="border-t border-emerald-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Développeurs disponibles
                {searchingDevs && <span className="inline-block w-4 h-4 ml-2 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin align-middle" />}
              </h3>
              {matchingDevs.length === 0 && !searchingDevs && (
                <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <p className="text-amber-700 text-sm">Aucun développeur ne correspond à ces compétences pour le moment</p>
                  <p className="text-amber-600 text-xs mt-1">Une fois votre mission publiée, nous prévenons les développeurs dès qu'un profil correspondant est disponible</p>
                </div>
              )}
              {matchingDevs.slice(0, 5).map((dev: any) => (
                <div key={dev.id} className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-all">
                  <span className="text-2xl">👨‍💻</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">Dev#{String(dev.dev_number || "").padStart(3, "0")}</p>
                    <p className="text-xs text-gray-500 truncate">{(dev.skills || []).slice(0, 4).join(" · ")}</p>
                  </div>
                  {dev.daily_rate && <span className="text-xs font-medium text-emerald-600">{dev.daily_rate}€/jour</span>}
                </div>
              ))}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mt-4">{error}</div>}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-white/50 transition-all">
            ← {step === 1 ? "Annuler" : "Retour"}
          </button>
          <div className="flex items-center gap-3">
            {step === 3 && (
              <button onClick={handleSubmit} disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all">
                {loading ? "Publication..." : "⚡ Publier directement"}
              </button>
            )}
            {step < 4 ? (
              <button onClick={() => { if (step === 3 && matchingDevs.length === 0) { handleSubmit(); return; } setStep(step + 1); }} disabled={!canGoNext()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {step === 3 ? "🔍 Voir les devs disponibles →" : "Continuer →"}
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50">
                {loading ? "Publication..." : "✅ Publier la mission"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
