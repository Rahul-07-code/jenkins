import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bell, BookOpen, Bot, BriefcaseBusiness, Building2, CalendarDays,
  CheckCircle2, ChevronRight, CloudSun, FileText, GraduationCap, Home, Landmark,
  Leaf, Menu, MessageCircle, Search, Settings, ShieldCheck, ShoppingBag, Sparkles,
  Trophy, UserRound, Users, X, WalletCards, Wheat, ClipboardList, CircleHelp
} from "lucide-react";
import { apiFetch, clearSession, getStoredUser, saveSession } from "./lib/api";

const charminar = "https://www.indiatravelforum.in/media/charminar-image-credit-wikimedia-commons.571/full";
const farmerImage = "https://media.assettype.com/tnm/import/sites/default/files/Women_Labourers_Main.JPG?ar=40%3A21&auto=format%2Ccompress&enlarge=true&mode=crop&ogImage=true&overlay=false&overlay_position=bottom&overlay_width=100&w=1200";

type Page =
  | "home" | "login" | "register" | "occupation" | "student-details"
  | "student" | "schemes" | "exams" | "competitions" | "digilocker"
  | "farmer" | "msp" | "shops" | "ai" | "government" | "private"
  | "business" | "senior" | "settings";

const navItems = [
  ["student","Dashboard",Home],["schemes","Schemes",GraduationCap],
  ["exams","Exams & Opportunities",CalendarDays],["competitions","Competitions",Trophy],
  ["digilocker","DigiLocker",ShieldCheck],["ai","Sathi AI",Bot],["settings","Profile & Settings",Settings]
] as const;

const REGISTRATION_DRAFT_KEY = "praja_sathi_registration_draft";

function getRegistrationDraft(){
  try { return JSON.parse(sessionStorage.getItem(REGISTRATION_DRAFT_KEY) || "{}"); }
  catch { return {}; }
}

function saveRegistrationDraft(patch:any){
  const next = { ...getRegistrationDraft(), ...patch };
  sessionStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(next));
  return next;
}

function clearRegistrationDraft(){
  sessionStorage.removeItem(REGISTRATION_DRAFT_KEY);
}

function initials(name:string = "Citizen"){
  return name.split(/\s+/).filter(Boolean).slice(0,2).map((part)=>part[0]).join("").toUpperCase() || "PS";
}

function App(){
  const [page,setPage]=useState<Page>("home");
  const [currentUser,setCurrentUser]=useState<any>(()=>getStoredUser());

  useEffect(()=>{
    const sync=()=>setCurrentUser(getStoredUser());
    window.addEventListener("praja-sathi-auth-change", sync);
    return ()=>window.removeEventListener("praja-sathi-auth-change", sync);
  },[]);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [chat,setChat]=useState([{role:"assistant",text:"Namaste! I’m Sathi AI. Ask me about schemes, services, scholarships or opportunities."}]);
  const [message,setMessage]=useState("");

  const go=(p:Page)=>{setPage(p);setMobileOpen(false);window.scrollTo({top:0,behavior:"smooth"})};

  if(["home","login","register","occupation","student-details"].includes(page))
    return <PublicLayout page={page} go={go}/>;
