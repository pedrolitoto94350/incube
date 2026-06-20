"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────
type ProjectType =
  | "site_vitrine"
  | "ecommerce"
  | "automatisation"
  | "agents_ia"
  | "landing_page"
  | "integration_api"
  | "autre";

interface FormData {
  projectTypes: ProjectType[];
  projectTypeOther: string;
  skills: string[];
  bio: string;
  dailyRate: number | "";
  availability: string;
  screenshots: File[];
  screenshotCaptions: string[];
  demoVideo: File | null;
  codeSnippets: string[];
  textShowcases: string[];
  contactEmail: string;
  acceptCheck1: boolean;
  acceptCheck2: boolean;
  acceptCheck3: boolean;
}

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "site_vitrine", label: "Site vitrine" },
  { value: "ecommerce", label: "E-commerce / boutique en ligne" },
  { value: "automatisation", label: "Automatisation (Zapier, Make…)" },
  { value: "agents_ia", label: "Agents IA (CrewAI, OpenClaw, Hermes…)" },
  { value: "landing_page", label: "Landing page" },
  { value: "integration_api", label: "Intégration / API" },
  { value: "autre", label: "Autre" },
];

const AVAILABILITIES = [
  { value: "disponible", label: "Disponible maintenant" },
  { value: "1-2_semaines", label: "Sous 1-2 semaines" },
  { value: "3-4_semaines", label: "Sous 3-4 semaines" },
];

const SKILL_SUGGESTIONS = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte", "TypeScript",
  "JavaScript", "HTML/CSS", "Tailwind CSS", "Node.js", "Python",
  "Go", "Rust", "PHP/Laravel", "Ruby on Rails", "Django",
  "Flask", "FastAPI", "Swift", "Kotlin", "Flutter", "React Native",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
  "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST APIs",
  "Zapier", "Make", "n8n", "CrewAI", "LangChain", "OpenAI API",
  "Figma", "Storybook", "Cypress", "Playwright", "CI/CD", "Git",
  "Supabase", "Firebase", "Stripe", "Shopify", "WordPress",
];

const STEPS_LABELS = ["Compétences", "Présentation", "Démo", "Contact"];

// ── Helpers ────────────────────────────────────────────────────────
function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function hasContactInfo(text: string): boolean {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,}\)?[-.\s]?\d{2,}[-.\s]?\d{2,}[-.\s]?\d{2,}/;
  const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/;
  const handleRegex = /@[\w]+/;
  return emailRegex.test(text) || phoneRegex.test(text) || urlRegex.test(text) || handleRegex.test(text);
}

function stripExif(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(new File([blob], file.name, { type: file.type }));
          else resolve(file);
        },
        file.type,
        0.92
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

// ── Animations ─────────────────────────────────────────────────────
function StepSlide({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ── TagInput ───────────────────────────────────────────────────────
function TagInput({
  tags, onChange, suggestions, placeholder, minTags,
}: {
  tags: string[]; onChange: (tags: string[]) => void;
  suggestions: string[]; placeholder?: string; minTags?: number;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().startsWith(input.toLowerCase()) && !tags.includes(s)
  );
  const addTag = useCallback((tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [tags, onChange]);
  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-sm font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-indigo-700">&times;</button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text" value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (input.trim()) addTag(input); } if (e.key === "Backspace" && !input && tags.length) removeTag(tags[tags.length - 1]); }}
          placeholder={placeholder || "Tapez un outil puis Entrée"}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
            {filtered.map((s) => (
              <button key={s} type="button" onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 text-gray-700 transition-colors"
              >{s}</button>
            ))}
          </div>
        )}
      </div>
      {minTags && tags.length < minTags && (
        <p className="text-xs text-amber-600 mt-1">Ajoutez au moins {minTags} technologies ({tags.length}/{minTags})</p>
      )}
    </div>
  );
}

// ── ImagePreview ───────────────────────────────────────────────────
function ImagePreview({ file, index, caption, onCaptionChange, onRemove }: {
  file: File; index: number; caption: string; onCaptionChange: (val: string) => void; onRemove: () => void;
}) {
  const url = URL.createObjectURL(file);
  return (
    <div className="relative border border-gray-200 rounded-xl p-3 bg-gray-50">
      <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center z-10 hover:bg-red-600">&times;</button>
      <img src={url} alt={`Capture ${index + 1}`} className="w-full h-40 object-cover rounded-lg mb-2" />
      <input type="text" value={caption} onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Ex : Tableau de bord d'automatisation des commandes" maxLength={100}
        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400" />
      <p className="text-xs text-gray-400 mt-1">Légende ({caption.length}/100)</p>
    </div>
  );
}

// ── WarningBlock ───────────────────────────────────────────────────
function WarningBlock({ children }: { children: React.ReactNode }) {
  return <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-relaxed">⚠️ {children}</div>;
}

// ── AnonymousTextarea ──────────────────────────────────────────────
function AnonymousTextarea({ value, onChange, placeholder, maxLength, rows, autoFocus, helpText }: {
  value: string; onChange: (val: string) => void; placeholder?: string; maxLength?: number; rows?: number; autoFocus?: boolean; helpText?: string;
}) {
  const [warn, setWarn] = useState(false);
  return (
    <div>
      <textarea value={value} onChange={(e) => { onChange(e.target.value); setWarn(hasContactInfo(e.target.value)); }}
        placeholder={placeholder} maxLength={maxLength} rows={rows || 4} autoFocus={autoFocus}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none transition-all text-sm"
      />
      {warn && <p className="text-xs text-red-600 mt-1">Pour protéger votre anonymat, les coordonnées et liens externes ne sont pas autorisés.</p>}
      {helpText && !warn && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
      {maxLength && <p className="text-xs text-gray-400 mt-1 text-right">{value.length}/{maxLength}</p>}
    </div>
  );
}
// ── Main Component ─────────────────────────────────────────────────
export default function DevProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [devNumber, setDevNumber] = useState<number | null>(null);

  const [form, setForm] = useState<FormData>({
    projectTypes: [], projectTypeOther: "", skills: [], bio: "", dailyRate: "",
    availability: "", screenshots: [], screenshotCaptions: [], demoVideo: null,
    codeSnippets: [""], textShowcases: [""], contactEmail: "",
    acceptCheck1: false, acceptCheck2: false, acceptCheck3: false,
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/signup/dev"); return; }
      setUserId(user.id);
      setForm((prev) => ({ ...prev, contactEmail: user.email || "" }));
    })();
  }, [router]);

  const updateForm = (patch: Partial<FormData>) => setForm((prev) => ({ ...prev, ...patch }));

  const toggleProjectType = (pt: ProjectType) => {
    setForm((prev) => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(pt)
        ? prev.projectTypes.filter((p) => p !== pt)
        : [...prev.projectTypes, pt],
    }));
  };

  const addScreenshots = async (files: FileList | null) => {
    if (!files) return;
    const cleaned: File[] = [];
    const current = form.screenshots.length;
    for (let i = 0; i < Math.min(files.length, 5 - current); i++) {
      cleaned.push(await stripExif(files[i]));
    }
    updateForm({
      screenshots: [...form.screenshots, ...cleaned],
      screenshotCaptions: [...form.screenshotCaptions, ...cleaned.map(() => "")],
    });
  };

  const addCodeSnippet = () => {
    if (form.codeSnippets.length < 3) updateForm({ codeSnippets: [...form.codeSnippets, ""] });
  };
  const updateCodeSnippet = (i: number, val: string) => {
    const arr = [...form.codeSnippets]; arr[i] = val;
    updateForm({ codeSnippets: arr });
  };
  const removeCodeSnippet = (i: number) => {
    const arr = form.codeSnippets.filter((_, idx) => idx !== i);
    updateForm({ codeSnippets: arr.length ? arr : [""] });
  };

  const addTextShowcase = () => {
    if (form.textShowcases.length < 3) updateForm({ textShowcases: [...form.textShowcases, ""] });
  };
  const updateTextShowcase = (i: number, val: string) => {
    const arr = [...form.textShowcases]; arr[i] = val;
    updateForm({ textShowcases: arr });
  };
  const removeTextShowcase = (i: number) => {
    const arr = form.textShowcases.filter((_, idx) => idx !== i);
    updateForm({ textShowcases: arr.length ? arr : [""] });
  };

  const canGoNext = (s: number): boolean => {
    switch (s) {
      case 1: return form.projectTypes.length >= 1;
      case 2: return form.bio.trim().length > 0 && form.dailyRate !== "" && Number(form.dailyRate) > 0 && form.availability !== "" && !hasContactInfo(form.bio);
      case 3: return true;
      case 4: return form.contactEmail.includes("@") && form.acceptCheck1 && form.acceptCheck2 && form.acceptCheck3;
      default: return false;
    }
  };

  const assignDevNumber = async (supabase: ReturnType<typeof createClient>): Promise<number> => {
    const { data } = await supabase.from("profiles").select("dev_number").not("dev_number", "is", null).order("dev_number", { ascending: false }).limit(1);
    return (data && data.length > 0 ? data[0].dev_number : 0) + 1;
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    const allTexts = [form.bio, ...form.screenshotCaptions, ...form.codeSnippets, ...form.textShowcases];
    for (const t of allTexts) {
      if (hasContactInfo(t)) {
        setError("Certains champs contiennent des coordonnées. Veuillez les retirer pour préserver votre anonymat.");
        setLoading(false); return;
      }
    }
    const supabase = createClient();
    const number = await assignDevNumber(supabase);
    setDevNumber(number);

    const screenshotUrls: string[] = [];
    for (let i = 0; i < form.screenshots.length; i++) {
      const file = form.screenshots[i];
      const ext = file.name.split(".").pop();
      const path = `dev-${number}/${Date.now()}-${i}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("dev-screenshots").upload(path, file, { contentType: file.type, upsert: false });
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from("dev-screenshots").getPublicUrl(path);
        screenshotUrls.push(urlData.publicUrl);
      }
    }

    let videoUrl = "";
    if (form.demoVideo) {
      const ext = form.demoVideo.name.split(".").pop();
      const path = `dev-${number}/demo-${Date.now()}.${ext}`;
      const { error: vidError } = await supabase.storage.from("dev-screenshots").upload(path, form.demoVideo, { contentType: form.demoVideo.type, upsert: false });
      if (!vidError) {
        const { data: urlData } = supabase.storage.from("dev-screenshots").getPublicUrl(path);
        videoUrl = urlData.publicUrl;
      }
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: userId,
      role: "dev",
      dev_number: number,
      full_name: `Dev#${String(number).padStart(3, "0")}`,
      project_types: form.projectTypes,
      project_type_other: form.projectTypeOther || null,
      skills: form.skills,
      bio: form.bio,
      daily_rate: Number(form.dailyRate),
      availability: form.availability,
      screenshot_urls: screenshotUrls,
      screenshot_captions: form.screenshotCaptions.filter((c) => c.trim()),
      demo_video_url: videoUrl || null,
      code_snippets: form.codeSnippets.filter((c) => c.trim()),
      text_showcases: form.textShowcases.filter((t) => t.trim()),
      contact_email: form.contactEmail,
      profile_completed: true,
    });

    if (upsertError) { setError(upsertError.message); setLoading(false); return; }
    router.push(`/profile/dev/${number}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InCube</Link>
          <h1 className="text-xl font-bold mt-4 mb-1 text-gray-900">Finalise ton profil développeur</h1>
          <p className="text-sm text-gray-500">Anonyme jusqu&apos;au match. Montre tes compétences, cache ton identité.</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS_LABELS.map((label, i) => (
              <div key={label} className="flex flex-col items-center flex-1">
                <div className={classNames(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  step > i + 1 ? "bg-emerald-500 text-white"
                  : step === i + 1 ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : "bg-gray-100 text-gray-400"
                )}>
                  {step > i + 1 ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={classNames("text-xs mt-1.5 font-medium", step >= i + 1 ? "text-indigo-600" : "text-gray-400")}>{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS_LABELS.length - 1)) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-5 border border-red-200">{error}</div>}

          <StepSlide stepKey={step}>

            {/* ═══ STEP 1 ═══ */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-semibold text-lg text-gray-900 mb-1">🔧 Types de projets que vous savez réaliser</h2>
                  <p className="text-sm text-gray-400 mb-3">Sélectionnez au moins un type</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PROJECT_TYPES.map((pt) => (
                      <button key={pt.value} type="button" onClick={() => toggleProjectType(pt.value)}
                        className={classNames("px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all",
                          form.projectTypes.includes(pt.value) ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-100 bg-white text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
                        )}>{pt.label}</button>
                    ))}
                  </div>
                  {form.projectTypes.includes("autre") && (
                    <input type="text" value={form.projectTypeOther}
                      onChange={(e) => updateForm({ projectTypeOther: e.target.value })}
                      placeholder="Précisez le type de projet" maxLength={100}
                      className="mt-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-900 mb-1">🛠️ Vos outils et technologies</h2>
                  <p className="text-sm text-gray-400 mb-3">Ajoutez au moins 3 technologies</p>
                  <TagInput tags={form.skills} onChange={(tags) => updateForm({ skills: tags })}
                    suggestions={SKILL_SUGGESTIONS} placeholder="Tapez un outil puis Entrée (ex: React, Docker…)" minTags={3} />
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => canGoNext(1) && setStep(2)} disabled={!canGoNext(1)}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                    Étape suivante →
                  </button>
                </div>
              </div>
            )}

            {/* ═══ STEP 2 ═══ */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-semibold text-lg text-gray-900 mb-1">📝 Décrivez ce que vous savez faire</h2>
                  <AnonymousTextarea value={form.bio} onChange={(val) => updateForm({ bio: val })}
                    placeholder="Ex : Je conçois des automatisations qui font gagner du temps sur les tâches répétitives, et des sites vitrines rapides à déployer."
                    maxLength={500} rows={4} autoFocus
                    helpText="⚠️ Ne citez aucun nom (client, entreprise, le vôtre). Décrivez vos compétences, pas votre parcours." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tarif journalier (€)</label>
                  <input type="number" value={form.dailyRate}
                    onChange={(e) => updateForm({ dailyRate: e.target.value ? Number(e.target.value) : "" })}
                    min={0} max={99999}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="350" />
                  <p className="text-xs text-gray-400 mt-1">Vous gardez 100% de ce tarif. La mise en relation est financée par l&apos;entreprise.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {AVAILABILITIES.map((av) => (
                      <button key={av.value} type="button" onClick={() => updateForm({ availability: av.value })}
                        className={classNames("px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                          form.availability === av.value ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-100 bg-white text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
                        )}>{av.label}</button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 transition-all text-sm">← Retour</button>
                  <button type="button" onClick={() => canGoNext(2) && setStep(3)} disabled={!canGoNext(2)}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                    Étape suivante →
                  </button>
                </div>
              </div>
            )}

            {/* ═══ STEP 3 ═══ */}
            {step === 3 && (
              <div className="space-y-6">
                <WarningBlock>Vos démos sont votre meilleur argument. Mais avant de les ajouter, masquez tout élément identifiant : nom dans un onglet, URL dans la barre d&apos;adresse, logo ou nom de client, signature. Montrez le <strong>RÉSULTAT</strong>, pas le commanditaire.</WarningBlock>

                <div>
                  <h3 className="font-semibold text-base text-gray-900 mb-1">📸 Captures de projets</h3>
                  <p className="text-xs text-gray-400 mb-3">Jusqu&apos;à 5 images. Les métadonnées EXIF sont automatiquement supprimées.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {form.screenshots.map((file, i) => (
                      <ImagePreview key={`ss-${i}`} file={file} index={i} caption={form.screenshotCaptions[i] || ""}
                        onCaptionChange={(val) => { const arr = [...form.screenshotCaptions]; arr[i] = val; updateForm({ screenshotCaptions: arr }); }}
                        onRemove={() => { updateForm({ screenshots: form.screenshots.filter((_, idx) => idx !== i), screenshotCaptions: form.screenshotCaptions.filter((_, idx) => idx !== i) }); }} />
                    ))}
                    {form.screenshots.length < 5 && (
                      <label className="flex items-center justify-center h-44 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                        <div className="text-center"><span className="text-2xl text-gray-300">+</span><p className="text-xs text-gray-400 mt-1">Ajouter une capture</p></div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => addScreenshots(e.target.files)} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-amber-600 mt-2">Floutez les noms, URLs et logos clients avant de télécharger.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-base text-gray-900 mb-1">🎥 Vidéo de démonstration (optionnelle)</h3>
                  <p className="text-xs text-gray-400 mb-3">MP4 ou WebM, max 5 minutes</p>
                  {form.demoVideo ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-sm text-gray-700 truncate flex-1">{form.demoVideo.name}</span>
                      <button type="button" onClick={() => updateForm({ demoVideo: null })} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                      <div className="text-center"><span className="text-2xl text-gray-300">🎬</span><p className="text-xs text-gray-400 mt-1">Ajouter une vidéo</p></div>
                      <input type="file" accept="video/mp4,video/webm" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) updateForm({ demoVideo: e.target.files[0] }); }} />
                    </label>
                  )}
                  <p className="text-xs text-amber-600 mt-2">Coupez le son si on vous entend vous nommer. Vérifiez qu&apos;aucune notification, onglet ou URL personnelle n&apos;apparaît à l&apos;écran.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-base text-gray-900 mb-1">📄 Extraits de code (jusqu&apos;à 3, optionnel)</h3>
                  <p className="text-xs text-amber-600 mb-2">Retirez les commentaires signés, emails, clés API et chemins de fichiers contenant votre nom.</p>
                  {form.codeSnippets.map((snip, i) => (
                    <div key={`cs-${i}`} className="mb-2">
                      <div className="flex items-center gap-2">
                        <textarea value={snip} onChange={(e) => updateCodeSnippet(i, e.target.value)} rows={3}
                          placeholder={`Extrait ${i + 1}`}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm font-mono resize-none" />
                        {form.codeSnippets.length > 1 && (
                          <button type="button" onClick={() => removeCodeSnippet(i)} className="text-red-400 hover:text-red-600 text-xl">&times;</button>
                        )}
                      </div>
                      {hasContactInfo(snip) && <p className="text-xs text-red-600 mt-1">Ce texte contient des coordonnées.</p>}
                    </div>
                  ))}
                  {form.codeSnippets.length < 3 && form.codeSnippets[form.codeSnippets.length - 1]?.trim() && (
                    <button type="button" onClick={addCodeSnippet} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">+ Ajouter un extrait</button>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-base text-gray-900 mb-1">✍️ Exemples de réalisations en texte (jusqu&apos;à 3, optionnel)</h3>
                  {form.textShowcases.map((showcase, i) => (
                    <div key={`ts-${i}`} className="mb-2">
                      <div className="flex items-center gap-2">
                        <AnonymousTextarea value={showcase} onChange={(val) => updateTextShowcase(i, val)}
                          placeholder="Ex : Automatisation de la prise de rendez-vous d'un cabinet médical → 3h de saisie économisées par semaine."
                          helpText="Décrivez le résultat obtenu, jamais le nom du client." />
                        {form.textShowcases.length > 1 && (
                          <button type="button" onClick={() => removeTextShowcase(i)} className="text-red-400 hover:text-red-600 text-xl">&times;</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {form.textShowcases.length < 3 && form.textShowcases[form.textShowcases.length - 1]?.trim() && (
                    <button type="button" onClick={addTextShowcase} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">+ Ajouter un exemple</button>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 transition-all text-sm">← Retour</button>
                  <button type="button" onClick={() => canGoNext(3) && setStep(4)} disabled={!canGoNext(3)}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                    Étape suivante →
                  </button>
                </div>
              </div>
            )}

            {/* ═══ STEP 4 ═══ */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-semibold text-lg text-gray-900 mb-1">📧 Contact et engagement</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contact</label>
                    <input type="email" value={form.contactEmail} onChange={(e) => updateForm({ contactEmail: e.target.value })} required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="vous@exemple.fr" />
                    <p className="text-xs text-gray-400 mt-1">Chiffré et invisible sur votre profil. Révélé uniquement au recruteur après que vous ayez accepté un match.</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900 mb-3">Checklist d&apos;anonymat</h3>
                  <p className="text-sm text-gray-500 mb-3">Cochez toutes les cases obligatoires avant de publier votre profil.</p>
                  <div className="space-y-3">
                    {[
                      { key: "acceptCheck1", label: "Mes démos ne contiennent aucun nom, logo ou coordonnée permettant de m&apos;identifier ou d&apos;identifier un client." },
                      { key: "acceptCheck2", label: "Les travaux que je présente sont réellement les miens." },
                      { key: "acceptCheck3", label: "Je m&apos;engage à mener à bien les missions que j&apos;accepte." },
                    ].map((item) => (
                      <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={(form as any)[item.key]} onChange={(e) => updateForm({ [item.key]: e.target.checked } as any)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: item.label }} />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 transition-all text-sm">← Retour</button>
                  <button type="button" onClick={handleSubmit} disabled={!canGoNext(4) || loading}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                    {loading ? "Publication..." : "📢 Publier mon profil"}
                  </button>
                </div>
              </div>
            )}
          </StepSlide>
        </div>

        {devNumber && (
          <div className="text-center mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
            <p className="text-lg font-semibold text-emerald-700">✅ Votre profil est en ligne !</p>
            <p className="text-sm text-emerald-600 mt-1">
              Vous apparaîtrez dans les recherches des recruteurs de façon anonyme sous le nom{" "}
              <strong>Dev#{String(devNumber).padStart(3, "0")}</strong>.
            </p>
            <Link href={`/profile/dev/${devNumber}`}
              className="inline-block mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all text-sm">
              Voir mon profil public
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
