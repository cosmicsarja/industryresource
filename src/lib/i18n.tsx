import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "kn";

const T = {
  en: {
    siteName: "IndustryResource",
    tagline: "India's Multi-City Industrial Marketplace",
    browse: "Browse",
    requirements: "Requirements",
    postRequirement: "Post a Requirement",
    listBusiness: "List Your Business",
    login: "Login",
    logout: "Logout",
    dashboard: "Dashboard",
    searchPlaceholder: "Search for lathe, CNC, welding...",
    findVendors: "Find Vendors",
    category: "Category",
    city: "City",
    zone: "Zone",
    allCategories: "All Categories",
    allCities: "All Cities",
    allZones: "All Zones",
    heroTitle: "Find Any Industrial Workshop — Instantly",
    heroSub: "Verified vendors. Real machines. Direct WhatsApp connect. No middlemen.",
    featuredCategories: "Featured Categories",
    topRated: "Top Rated Workshops",
    howItWorks: "How It Works",
    step1: "Search Your Requirement",
    step2: "Compare Verified Vendors",
    step3: "Connect via WhatsApp",
    industrialZones: "Industrial Hubs",
    whyUs: "Why IndustryResource",
    pricing: "Vendor Plans",
    verified: "Verified",
    featured: "Featured",
    viewProfile: "View Profile",
    whatsapp: "WhatsApp",
    call: "Call",
    sendEnquiry: "Send Enquiry",
    vendors: "vendors",
    noResults: "No vendors found. Try clearing filters.",
    filters: "Filters",
    rating: "Rating",
    plan: "Plan",
    sortBy: "Sort By",
    bestMatch: "Best Match",
    newest: "Newest",
    free: "Free",
    standard: "Standard",
    premium: "Premium",
    gold: "Gold",
    getStarted: "Get Started",
    perYear: "/ year",
    signupTitle: "Create your account",
    loginTitle: "Welcome back",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    phone: "Phone",
    iAm: "I am a",
    customer: "Customer",
    vendor: "Vendor",
    submit: "Submit",
    save: "Save",
    saving: "Saving…",
  },
  kn: {
    siteName: "IndustryResource",
    tagline: "ಭಾರತದ ಬಹು-ನಗರ ಕೈಗಾರಿಕಾ ಮಾರುಕಟ್ಟೆ",
    browse: "ಬ್ರೌಸ್",
    requirements: "ಅವಶ್ಯಕತೆಗಳು",
    postRequirement: "ಅವಶ್ಯಕತೆ ಪೋಸ್ಟ್ ಮಾಡಿ",
    listBusiness: "ನಿಮ್ಮ ವ್ಯಾಪಾರ ನೋಂದಾಯಿಸಿ",
    login: "ಲಾಗಿನ್",
    logout: "ಲಾಗ್‌ಔಟ್",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    searchPlaceholder: "ಲೇಥ್, ಸಿಎನ್‌ಸಿ, ವೆಲ್ಡಿಂಗ್ ಹುಡುಕಿ...",
    findVendors: "ವಿಕ್ರೇತರನ್ನು ಹುಡುಕಿ",
    category: "ವರ್ಗ",
    city: "ನಗರ",
    zone: "ವಲಯ",
    allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
    allCities: "ಎಲ್ಲಾ ನಗರಗಳು",
    allZones: "ಎಲ್ಲಾ ವಲಯಗಳು",
    heroTitle: "ಯಾವುದೇ ಕೈಗಾರಿಕಾ ಕಾರ್ಯಾಗಾರ ಹುಡುಕಿ — ತಕ್ಷಣ",
    heroSub: "ಪರಿಶೀಲಿಸಿದ ವಿಕ್ರೇತರು. ನಿಜವಾದ ಯಂತ್ರಗಳು. ನೇರ ವಾಟ್ಸಾಪ್ ಸಂಪರ್ಕ.",
    featuredCategories: "ವಿಶೇಷ ವರ್ಗಗಳು",
    topRated: "ಅತ್ಯುತ್ತಮ ಕಾರ್ಯಾಗಾರಗಳು",
    howItWorks: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    step1: "ನಿಮ್ಮ ಅವಶ್ಯಕತೆಯನ್ನು ಹುಡುಕಿ",
    step2: "ಪರಿಶೀಲಿಸಿದ ವಿಕ್ರೇತರನ್ನು ಹೋಲಿಸಿ",
    step3: "ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ",
    industrialZones: "ಕೈಗಾರಿಕಾ ಕೇಂದ್ರಗಳು",
    whyUs: "ಯಾಕೆ IndustryResource",
    pricing: "ವಿಕ್ರೇತ ಯೋಜನೆಗಳು",
    verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    featured: "ವಿಶೇಷ",
    viewProfile: "ಪ್ರೊಫೈಲ್ ನೋಡಿ",
    whatsapp: "ವಾಟ್ಸಾಪ್",
    call: "ಕರೆ",
    sendEnquiry: "ವಿಚಾರಣೆ ಕಳುಹಿಸಿ",
    vendors: "ವಿಕ್ರೇತರು",
    noResults: "ಯಾವುದೇ ವಿಕ್ರೇತರು ಸಿಗಲಿಲ್ಲ.",
    filters: "ಫಿಲ್ಟರ್‌ಗಳು",
    rating: "ರೇಟಿಂಗ್",
    plan: "ಯೋಜನೆ",
    sortBy: "ವಿಂಗಡಿಸಿ",
    bestMatch: "ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ",
    newest: "ಹೊಸ",
    free: "ಉಚಿತ",
    standard: "ಸ್ಟ್ಯಾಂಡರ್ಡ್",
    premium: "ಪ್ರೀಮಿಯಂ",
    gold: "ಗೋಲ್ಡ್",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",
    perYear: "/ ವರ್ಷ",
    signupTitle: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
    loginTitle: "ಮತ್ತೆ ಸ್ವಾಗತ",
    email: "ಇಮೇಲ್",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    phone: "ಫೋನ್",
    iAm: "ನಾನು",
    customer: "ಗ್ರಾಹಕ",
    vendor: "ವಿಕ್ರೇತ",
    submit: "ಸಲ್ಲಿಸಿ",
    save: "ಉಳಿಸಿ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ…",
  },
} as const;

type Key = keyof typeof T["en"];

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("ir_lang") as Lang | null;
    if (stored === "en" || stored === "kn") setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("ir_lang", l);
  };
  const t = (key: Key) => T[lang][key] ?? T.en[key];
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
}
