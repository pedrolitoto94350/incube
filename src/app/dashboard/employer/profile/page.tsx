"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase";
import DashboardNav from "../../../../components/DashboardNav";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../../../lib/stripe-client";

function SetupForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const result = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: window.location.origin + "/dashboard/employer/profile" },
    });

    if (result.error) {
      setError(result.error.message || "Erreur");
      setLoading(false);
    } else if (result.setupIntent?.status === "succeeded") {
      // Save payment method to user profile
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const si = result.setupIntent as any
        await supabase.from("profiles").update({
          stripe_customer_id: si.customer as string,
          stripe_payment_method_id: si.payment_method as string,
        }).eq("id", user.id);
      }
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
        {loading ? "..." : "Enregistrer la carte"}
      </button>
    </form>
  );
}

export default function EmployerEditProfile() {
  const router = useRouter();
  const [form, setForm] = useState({ company_name: "", full_name: "", company_size: "", sector: "" });
  const [clientSecret, setClientSecret] = useState("");
  const [cardAdded, setCardAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasCard, setHasCard] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setForm({
          company_name: data.company_name || "",
          full_name: data.full_name || "",
          company_size: data.company_size || "",
          sector: data.sector || "",
        });
        setHasCard(!!data.stripe_payment_method_id);
      }
      // Create setup intent
      try {
        const res = await fetch("/api/stripe/setup-intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
        const json = await res.json();
        if (json.clientSecret) setClientSecret(json.clientSecret);
      } catch (e) {}
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [router]);

  const saveProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><DashboardNav role="employer" /><div className="max-w-4xl mx-auto px-4 pt-24"><p className="text-gray-500">Chargement...</p></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav role="employer" />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold mb-6">Mon profil entreprise</h1>

        {/* Profile info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">🏢 Entreprise</label>
            <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">👤 Votre nom</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">👥 Taille</label>
            <select value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white">
              <option value="">Sélectionnez</option>
              <option value="1">Freelance</option>
              <option value="2-10">TPE (2-10)</option>
              <option value="10-50">PME (10-50)</option>
              <option value="50-200">ETI (50-200)</option>
              <option value="200+">Grande entreprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">🎯 Secteur</label>
            <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white">
              <option value="">Sélectionnez</option>
              <option value="tech">Tech / SaaS</option>
              <option value="finance">Finance</option>
              <option value="sante">Santé</option>
              <option value="commerce">E-commerce</option>
              <option value="industrie">Industrie</option>
              <option value="consulting">Conseil</option>
              <option value="media">Média</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <button onClick={saveProfile} disabled={saving} className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50">
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>

        {/* Payment card section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="font-semibold text-lg mb-3">💳 Carte de paiement</h2>
          <p className="text-sm text-gray-500 mb-4">
            {hasCard 
              ? "✅ Carte enregistrée. La commission sera prélevée automatiquement lors d'un match."
              : "Enregistrez votre carte pour pouvoir proposer des missions. Vous ne serez débité que si un développeur accepte (commission plafonnée à 300€)."
            }
          </p>
          {!hasCard && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SetupForm onSuccess={() => setCardAdded(true)} />
            </Elements>
          )}
          {(hasCard || cardAdded) && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm">✅ Carte enregistrée</div>
          )}
        </div>
      </div>
    </div>
  );
}
