import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bell, BookOpen, Bot, BriefcaseBusiness, Building2, CalendarDays, CalendarClock,
  CheckCircle2, ChevronRight, CloudSun, FileText, GraduationCap, Home, Landmark,
  Leaf, Menu, MessageCircle, Search, Settings, ShieldCheck, ShoppingBag, Sparkles,
  Trophy, UserRound, Users, X, WalletCards, Wheat, ClipboardList, CircleHelp
} from "lucide-react";
import { apiFetch, getStoredUser, saveSession } from "./lib/api";
import SchemesData from "./components/Schemes";
import AdminDashboard from "./components/AdminDashboard";
import SavedPage from "./components/SavedPage";
