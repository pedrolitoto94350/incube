"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type ConsentState = "loading" | "accepted" | "refused" | "customize";
type ConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
  functional: boolean; // toujours true (essentiel)
};

const CONSENT_KEY = "incube_cookies_consent";

const defaultPreferences: ConsentPreferences = {
  analytics: false,
  marketing: false,
  functional: true,
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
  }
}

export default function CookieConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>("loading");
  const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showFooterLink, setShowFooterLink] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConsent(parsed.consent);
        setPreferences(parsed.preferences || defaultPreferences);
        applyConsent(parsed.consent, parsed.preferences || defaultPreferences);
      } catch {
        setConsent("loading");
      }
    } else {
      setConsent("loading");
    }
  }, []);

  function applyConsent(state: ConsentState, prefs: ConsentPreferences) {
    if (state === "accepted") {
      // Activer analytics si souhaité (placeholder pour l'instant)
      console.log("[Cookies] Consentement accepté");
      // Exemple : gtag('consent', 'update', { analytics_storage: 'granted' });
    } else if (state === "refused") {
      console.log("[Cookies] Consentement refusé");
      // Exemple : gtag('consent', 'update', { analytics_storage: 'denied' });
    } else if (state === "customize") {
      if (prefs.analytics) {
        console.log("[Cookies] Analytics accepté (personnalisé)");
      }
    }
  }

  function saveConsent(state: ConsentState, prefs: ConsentPreferences) {
    const data = { consent: state, preferences: prefs, timestamp: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    setConsent(state);
    setPreferences(prefs);
    setShowCustomize(false);
    setShowFooterLink(true);
    applyConsent(state, prefs);
  }

  function acceptAll() {
    saveConsent("accepted", { analytics: true, marketing: true, functional: true });
  }

  function refuseAll() {
    saveConsent("refused", { analytics: false, marketing: false, functional: true });
  }

  function saveCustom() {
    saveConsent("customize", preferences);
  }

  function openPreferences() {
    setShowCustomize(true);
    setConsent("customize");
  }

  function revokeConsent() {
    localStorage.removeItem(CONSENT_KEY);
    setConsent("loading");
    setShowFooterLink(false);
  }

  // Si déjà consenti, ne montrer que le lien "Gérer mes préférences" dans le footer (rendu via un slot)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <>
      {/* BANNIÈRE PRINCIPALE */}
      <AnimatePresence>
        {consent === "loading" && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
          >
            <div className="max-w-4xl mx-auto bg-emerald-950 border border-emerald-800 rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2">🍪 On respecte votre vie privée</h3>
                  <p className="text-emerald-200/80 text-sm leading-relaxed">
                    InCube utilise des cookies pour améliorer votre expérience et mesurer son audience.
                    Vous pouvez choisir librement ce que vous acceptez.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-emerald-300/60">
                    <span>✅ Mesure d&apos;audience</span>
                    <span>🔒 Cookies essentiels (toujours actifs)</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={refuseAll}
                    className="px-6 py-3 rounded-xl border border-emerald-700 text-emerald-200 text-sm font-medium hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
                  >
                    Tout refuser
                  </button>
                  <button
                    onClick={openPreferences}
                    className="px-6 py-3 rounded-xl border border-emerald-700 text-emerald-200 text-sm font-medium hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
                  >
                    Personnaliser
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    Tout accepter
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PANNEAU DE PERSONNALISATION */}
      <AnimatePresence>
        {showCustomize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCustomize(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-emerald-950 border border-emerald-800 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
            >
              <h3 className="text-white font-semibold text-lg mb-6">🍪 Personnalisez vos préférences</h3>

              <div className="space-y-4 mb-8">
                {/* Essentiels — toujours actifs */}
                <div className="flex items-start justify-between p-4 bg-emerald-900/30 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium text-sm">Cookies essentiels</h4>
                    <p className="text-emerald-200/60 text-xs mt-1">Nécessaires au fonctionnement du site (connexion, sécurité). Toujours actifs.</p>
                  </div>
                  <div className="ml-4 px-3 py-1 bg-emerald-700/50 rounded-full text-xs text-emerald-200 font-medium whitespace-nowrap">
                    Toujours actif
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between p-4 bg-emerald-900/30 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium text-sm">Mesure d&apos;audience</h4>
                    <p className="text-emerald-200/60 text-xs mt-1">Nous aident à comprendre comment vous utilisez le site pour l&apos;améliorer.</p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.analytics}
                    onChange={(v) => setPreferences({ ...preferences, analytics: v })}
                  />
                </div>

                {/* Marketing (placeholder) */}
                <div className="flex items-start justify-between p-4 bg-emerald-900/30 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium text-sm">Cookies marketing</h4>
                    <p className="text-emerald-200/60 text-xs mt-1">Utilisés pour vous proposer des offres pertinentes. (Actuellement non utilisés sur InCube)</p>
                  </div>
                  <ToggleSwitch
                    checked={preferences.marketing}
                    onChange={(v) => setPreferences({ ...preferences, marketing: v })}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={refuseAll}
                  className="flex-1 px-6 py-3 rounded-xl border border-emerald-700 text-emerald-200 text-sm font-medium hover:bg-emerald-900/50 transition-colors"
                >
                  Tout refuser
                </button>
                <button
                  onClick={saveCustom}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg transition-all"
                >
                  Enregistrer mes choix
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIEN "GÉRER MES PRÉFÉRENCES" — injecté via un portail dans le footer */}
      {showFooterLink && consent !== "loading" && (
        <div id="cookie-footer-link" className="hidden" data-consent={consent} />
      )}
    </>
  );
}

// Composant toggle switch
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-emerald-500" : "bg-emerald-800"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function CookieFooterLink({ onOpen }: { onOpen: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.consent === "accepted" || parsed.consent === "refused" || parsed.consent === "customize") {
          setShow(true);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => {
        localStorage.removeItem(CONSENT_KEY);
        window.location.reload();
      }}
      className="text-sm text-emerald-400/70 hover:text-emerald-400 underline transition-colors"
    >
      Gérer mes préférences cookies
    </button>
  );
}
