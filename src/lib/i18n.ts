import { useEffect, useState } from "react";

export type Language = "en" | "te" | "hi";

const dictionaries: Record<Language, Record<string, string>> = {
  en: {
    home: "Home", schemes: "Schemes", exams: "Exams & Opportunities", ai: "Sathi AI",
    profile: "Profile", saved: "Saved & Activity", admin: "Admin Console",
    login: "Login", register: "Register", getStarted: "Get Started",
    search: "Search schemes, exams, services...", dashboard: "Dashboard",
    officialPortal: "Official Portal", askSathi: "Ask Sathi AI", refresh: "Refresh"
  },
  te: {
    home: "హోమ్", schemes: "పథకాలు", exams: "పరీక్షలు & అవకాశాలు", ai: "సాథి AI",
    profile: "ప్రొఫైల్", saved: "సేవ్ చేసినవి & రిమైండర్లు", admin: "అడ్మిన్",
    login: "లాగిన్", register: "నమోదు", getStarted: "ప్రారంభించండి",
    search: "పథకాలు, పరీక్షలు, సేవలను శోధించండి...", dashboard: "డ్యాష్‌బోర్డ్",
    officialPortal: "అధికారిక పోర్టల్", askSathi: "సాథి AIని అడగండి", refresh: "రిఫ్రెష్"
  },
  hi: {
    home: "होम", schemes: "योजनाएँ", exams: "परीक्षाएँ और अवसर", ai: "साथी AI",
    profile: "प्रोफ़ाइल", saved: "सेव और रिमाइंडर", admin: "एडमिन",
    login: "लॉगिन", register: "रजिस्टर", getStarted: "शुरू करें",
    search: "योजनाएँ, परीक्षाएँ, सेवाएँ खोजें...", dashboard: "डैशबोर्ड",
    officialPortal: "आधिकारिक पोर्टल", askSathi: "साथी AI से पूछें", refresh: "रिफ्रेश"
  }
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("praja_sathi_language") as Language | null;
    return saved && dictionaries[saved] ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("praja_sathi_language", language);
    document.documentElement.lang = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN";
    window.dispatchEvent(new Event("praja-sathi-language-change"));
  }, [language]);

  const t = (key: string) => dictionaries[language][key] || dictionaries.en[key] || key;
  return { language, setLanguage, t };
}
