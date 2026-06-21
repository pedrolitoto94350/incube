import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

const SKILLS_LIST = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte", "TypeScript", "JavaScript",
  "Node.js", "Express", "Python", "Django", "Flask", "PHP", "Laravel",
  "Java", "Spring Boot", "C#", ".NET", "Go", "Rust",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "Firebase",
  "Tailwind CSS", "Bootstrap", "SASS/SCSS", "CSS", "HTML",
  "REST API", "GraphQL", "WebSocket", "API intégration", "Stripe API",
  "React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android",
  "Docker", "Kubernetes", "AWS", "Vercel", "CI/CD", "Git",
  "WordPress", "Shopify", "WooCommerce", "Webflow",
  "SEO", "UI/UX Design", "Figma", "Responsive Design",
  "Automatisation", "Web scraping", "IA / Machine Learning", "Chatbot IA",
  "Email automation", "CRM intégration", "Notion API", "Airtable",
  "Cybersécurité", "Performance optimization",
];

const FALLBACK_MAP: Record<string, string[]> = {
  "site vitrine": ["React", "Next.js", "Tailwind CSS", "HTML", "CSS"],
  "ecommerce": ["Shopify", "WooCommerce", "Stripe API", "React", "Node.js"],
  "boutique en ligne": ["Shopify", "WooCommerce", "Stripe API", "React", "Node.js"],
  "blog": ["Next.js", "WordPress", "SEO", "Tailwind CSS"],
  "application mobile": ["React Native", "Flutter", "Swift", "Firebase"],
  "api": ["Node.js", "Python", "REST API", "PostgreSQL", "Docker"],
  "automatisation": ["Python", "Node.js", "API intégration", "Automatisation"],
  "ia": ["Python", "IA / Machine Learning", "Chatbot IA"],
  "chatbot": ["Python", "Chatbot IA", "WebSocket", "API intégration"],
  "landing page": ["React", "Next.js", "Tailwind CSS", "HTML", "CSS"],
  "dashboard": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js"],
  "wordpress": ["WordPress", "PHP", "CSS", "HTML", "SEO"],
  "saas": ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Stripe API", "Tailwind CSS"],
};

export async function POST(req: NextRequest) {
  try {
    const { description, title } = await req.json();
    if (!description || description.length < 10) {
      return NextResponse.json({ error: "Description trop courte" }, { status: 400 });
    }

    // Fallback: si pas de clé DeepSeek, on utilise le mapping par mots-clés
    if (!DEEPSEEK_API_KEY) {
      const lower = description.toLowerCase() + " " + (title || "").toLowerCase();
      const matched = new Set<string>();
      for (const [keyword, skills] of Object.entries(FALLBACK_MAP)) {
        if (lower.includes(keyword)) skills.forEach((s) => matched.add(s));
      }
      return NextResponse.json({ skills: Array.from(matched) });
    }

    // Appel DeepSeek
    const prompt = `Tu es un expert technique qui aide des recruteurs à identifier les compétences nécessaires pour leurs projets web. À partir de la description d'un projet, retourne UNIQUEMENT un tableau JSON des compétences techniques pertinentes parmi cette liste : ${SKILLS_LIST.join(", ")}. Choisis entre 3 et 5 compétences maximum. Privilégie la qualité à la quantité : ne propose que les compétences vraiment indispensables pour le projet, celles qui sont les plus discriminantes pour trouver le bon développeur.

Description du projet: "${title ? title + " — " : ""}${description}"

Réponds UNIQUEMENT avec un tableau JSON : ["Compétence 1", "Compétence 2", ...]`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("DeepSeek error:", response.status, text);
      throw new Error("DeepSeek API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    const cleaned = content.replace(/```json?/g, "").replace(/```/g, "").trim();
    let skills: string[] = [];
    try { skills = JSON.parse(cleaned); } catch {
      skills = cleaned.split(",").map((s: string) => s.replace(/^[\s"'\[]+/, "").replace(/[\s"'\]\,]+$/, "")).filter(Boolean);
    }

    // Filtrer avec matching plus permissif (contient plutôt que égal)
    const allSkillsLower = SKILLS_LIST.map((s) => s.toLowerCase());
    const valid = skills.filter((s: string) => {
      const sl = s.toLowerCase().trim();
      return allSkillsLower.some((ref) => ref === sl || ref.includes(sl) || sl.includes(ref));
    });

    // Limiter à 5 compétences max
    const fallback = FALLBACK_MAP[description.toLowerCase().slice(0, 20)];
    if (valid.length < 2) {
      return NextResponse.json({ skills: fallback ? fallback.slice(0, 5) : ["React", "Node.js", "Tailwind CSS"] });
    }
    return NextResponse.json({ skills: valid.slice(0, 5) });
  } catch (error) {
    console.error("Suggest skills error:", error);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}
