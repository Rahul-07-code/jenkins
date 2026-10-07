import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bell, BookOpen, Bot, BriefcaseBusiness, Building2, CalendarDays,
  CheckCircle2, ChevronRight, CloudSun, FileText, GraduationCap, Home, Landmark,
  Leaf, Menu, MessageCircle, Search, Settings, ShieldCheck, ShoppingBag, Sparkles,
  Trophy, UserRound, Users, X, WalletCards, Wheat, ClipboardList, CircleHelp
} from "lucide-react";
import { apiFetch, getStoredUser, saveSession } from "./lib/api";

const charminar = "https://www.indiatravelforum.in/media/charminar-image-credit-wikimedia-commons.571/full";
const farmerImage = "https://media.assettype.com/tnm/import/sites/default/files/Women_Labourers_Main.JPG?ar=40%3A21&auto=format%2Ccompress&enlarge=true&mode=crop&ogImage=true&overlay=false&overlay_position=bottom&overlay_width=100&w=1200";

type Page =
  | "home" | "login" | "register" | "occupation" | "student-details"
  | "student" | "schemes" | "exams" | "competitions" | "digilocker"
  | "farmer" | "msp" | "shops" | "ai" | "government" | "private"
  | "business" | "senior" | "other" | "settings";

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
  const [mobileOpen,setMobileOpen]=useState(false);

  useEffect(()=>{
    const sync=()=>setCurrentUser(getStoredUser());
    window.addEventListener("praja-sathi-auth-change", sync);
    return ()=>window.removeEventListener("praja-sathi-auth-change", sync);
  },[]);
  const [query,setQuery]=useState("");
  const [chat,setChat]=useState([{role:"assistant",text:"Namaste! I’m Sathi AI. Ask me about schemes, services, scholarships or opportunities."}]);
  const [message,setMessage]=useState("");

  const go=(p:Page)=>{setPage(p);setMobileOpen(false);window.scrollTo({top:0,behavior:"smooth"})};

  if(["home","login","register","occupation","student-details"].includes(page))
    return <PublicLayout page={page} go={go}/>;

  const titleMap:Record<string,string>={student:"Student Dashboard",schemes:"Schemes",exams:"Exams & Opportunities",competitions:"Competitions & Events",digilocker:"DigiLocker",farmer:"Farmer Dashboard",msp:"MSP & Procurement",shops:"Nearby Agri Shops",ai:"Sathi AI",government:"Government Employee",private:"Private Employee / IT",business:"Business Owner",senior:"Senior Citizen",other:"Other Citizen",settings:"Profile & Settings"};
  const isFarmer=["farmer","msp","shops"].includes(page);
  const isOther=["government","private","business","senior","other"].includes(page);

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>go("student")}><span className="brand-mark">PS</span><span><b>Praja Sathi</b><small>Telangana Citizen Companion</small></span></button>
      <div className="top-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search schemes, exams, services..."/></div>
      <div className="top-actions"><button aria-label="help"><CircleHelp size={19}/></button><button aria-label="notifications"><Bell size={19}/></button><button className="avatar">RK</button></div>
      <button className="mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X/>:<Menu/>}</button>
    </header>
    <div className="workspace">
      <aside className={mobileOpen?"sidebar open":"sidebar"}>
        <div className="profile-mini"><div className="avatar large">{initials(currentUser?.name)}</div><div><strong>{currentUser?.name || "Citizen"}</strong><span>{currentUser?.profile?.occupation ? currentUser.profile.occupation.replace("_"," ") : "Citizen"} · {currentUser?.profile?.district || "Telangana"}</span></div></div>
        <div className="side-label">PERSONALIZED</div>
        {navItems.map(([id,label,Icon])=><button key={id} className={page===id?"side-link active":"side-link"} onClick={()=>go(id as Page)}><Icon size={18}/><span>{label}</span>{id==="schemes"&&<em>8</em>}</button>)}
        <div className="side-divider"/>
        <div className="side-label">OTHER DASHBOARDS</div>
        <button className="side-link" onClick={()=>go("farmer")}><Leaf size={18}/><span>Farmer</span></button>
        <button className="side-link" onClick={()=>go("government")}><Landmark size={18}/><span>Government Employee</span></button>
        <button className="side-link" onClick={()=>go("business")}><BriefcaseBusiness size={18}/><span>Business Owner</span></button>
      </aside>
      <main className="main">
        <div className="breadcrumb"><span>Praja Sathi</span><ChevronRight size={14}/><b>{titleMap[page]}</b></div>
        {page==="student"&&<StudentDashboard go={go}/>}
        {page==="schemes"&&<Schemes/>}
        {page==="exams"&&<Exams/>}
        {page==="competitions"&&<Competitions/>}
        {page==="digilocker"&&<DigiLocker/>}
        {page==="farmer"&&<FarmerDashboard go={go}/>}
        {page==="msp"&&<MSP/>}
        {page==="shops"&&<Shops/>}
        {page==="ai"&&<AI chat={chat} message={message} setMessage={setMessage} send={()=>{if(!message.trim())return;setChat([...chat,{role:"user",text:message},{role:"assistant",text:"I can help you discover relevant Telangana schemes and opportunities. This demo response can later be connected to your backend."}]);setMessage("")}}/>}
        {isOther&&<OtherDashboard kind={page} go={go}/>}
        {page==="settings"&&<SettingsPage/>}
      </main>
    </div>
  </div>
}

function PublicLayout({page,go}:{page:Page;go:(p:Page)=>void}){
  return <div className="public">
    <header className="public-nav"><button className="brand" onClick={()=>go("home")}><span className="brand-mark">PS</span><span><b>Praja Sathi</b><small>Telangana Citizen Companion</small></span></button><nav><button onClick={()=>go("home")}>Home</button><button>About</button><button>Features</button><button>Contact</button></nav><div><button className="outline-btn" onClick={()=>go("login")}>Login</button><button className="primary-btn compact" onClick={()=>go("register")}>Register</button></div></header>
    {page==="home"&&<Landing go={go}/>}
    {page==="login"&&<Login go={go}/>}
    {page==="register"&&<Register go={go}/>}
    {page==="occupation"&&<Occupation go={go}/>}
    {page==="student-details"&&<StudentDetails go={go}/>}
  </div>
}

function Landing({go}:{go:(p:Page)=>void}){
  return <><section className="hero"><div className="hero-copy"><span className="eyebrow">Telangana Government · One Platform · Every Citizen</span><h1>PRAJA <span>SATHI</span></h1><h2>Your Personalized<br/>Telangana Citizen Companion</h2><p>Discover government schemes, services, opportunities and more — all in one place, personalized for you.</p><div className="hero-actions"><button className="primary-btn" onClick={()=>go("register")}>Get Started <ArrowRight size={17}/></button><button className="outline-btn">Watch Demo</button></div><div className="trust"><CheckCircle2 size={16}/> Personalized guidance for every citizen of Telangana</div></div><div className="hero-image"><div className="image-glow"/><img src={charminar} alt="Charminar, Hyderabad"/><div className="floating-badge"><Landmark size={18}/><span><b>For a stronger</b><small>Telangana</small></span></div></div></section><section className="category-strip">{[["Government Schemes",Landmark],["Services",Building2],["Opportunities",Trophy],["AI Guidance",Bot],["All Citizens",Users]].map(([t,I])=><button key={t as string} onClick={()=>go("student")}><span className="icon-tile"><I size={21}/></span><b>{t as string}</b><ChevronRight size={15}/></button>)}</section><section className="home-lower"><div><span className="section-kicker">ONE PLATFORM. MANY POSSIBILITIES.</span><h3>Everything Telangana citizens need, organized around you.</h3></div><div className="feature-grid"><Feature icon={Landmark} title="Government Schemes" text="Discover scholarships, benefits and welfare programs."/><Feature icon={Sparkles} title="Smart Guidance" text="Get personalized next steps with Sathi AI."/><Feature icon={Leaf} title="Farmer Services" text="MSP, procurement, crop and agri-shop information."/><Feature icon={GraduationCap} title="Student Opportunities" text="Exams, competitions, scholarships and deadlines." /></div></section></>
}

function Feature({icon:Icon,title,text}:{icon:any;title:string;text:string}){return <article className="feature"><span className="icon-tile"><Icon size={20}/></span><div><h4>{title}</h4><p>{text}</p></div></article>}

function Login({go}:{go:(p:Page)=>void}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  async function submit(){
    setError("");
    if(!email || !password){ setError("Enter your email and password."); return; }
    setLoading(true);
    try {
      const data=await apiFetch("/auth/login",{method:"POST",body:JSON.stringify({email,password})});
      saveSession(data);
      go("student");
    } catch(err:any){ setError(err.message || "Unable to login."); }
    finally { setLoading(false); }
  }
  return <AuthCard title="Welcome Back!" subtitle="Login to your Praja Sathi account"><div className="tabs"><button className="active">Citizen Login</button><button disabled>Department Login</button></div><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email"/></label><label>Password<div className="input-wrap"><input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Enter password"/><ShieldCheck size={17}/></div></label>{error&&<p className="form-error">{error}</p>}<div className="form-row between"><label className="check"><input type="checkbox"/> Remember me</label><button className="link" type="button">Forgot Password?</button></div><button className="primary-btn full" onClick={submit} disabled={loading}>{loading?"Signing in...":"Login"}</button><p className="auth-foot">Don't have an account? <button className="link" onClick={()=>go("register")}>Register</button></p></AuthCard>
}

function AuthCardfunction AuthCard({title,subtitle,children}:{title:string;subtitle:string;children:any}){return <div className="auth-wrap"><div className="auth-brand"><span className="brand-mark">PS</span><b>Praja Sathi</b></div><div className="auth-card"><span className="step-dot">●</span><h2>{title}</h2><p>{subtitle}</p>{children}</div></div>}

function Register({go}:{go:(p:Page)=>void}){
  const draft=getRegistrationDraft();
  const [name,setName]=useState(draft.name||"");
  const [email,setEmail]=useState(draft.email||"");
  const [password,setPassword]=useState(draft.password||"");
  const [dateOfBirth,setDateOfBirth]=useState(draft.dateOfBirth||"");
  const [gender,setGender]=useState(draft.gender||"");
  const [district,setDistrict]=useState(draft.district||"");
  const [mandal,setMandal]=useState(draft.mandal||"");
  const next=()=>{
    if(!name||!email||!password||!dateOfBirth||!gender||!district||!mandal){ alert("Please complete all required fields."); return; }
    saveRegistrationDraft({name,email,password,dateOfBirth,gender,district,mandal,state:"Telangana"});
    go("occupation");
  };
  return <AuthCard title="Create Your Account" subtitle="Let's start with some basic details"><Progress current={1}/><div className="form-grid"><label>Full Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name"/></label><label>Date of Birth<input value={dateOfBirth} onChange={e=>setDateOfBirth(e.target.value)} type="date"/></label></div><div className="form-grid"><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Enter your email"/></label><label>Gender<select value={gender} onChange={e=>setGender(e.target.value)}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></label></div><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="At least 8 characters"/></label><div className="form-grid"><label>District<select value={district} onChange={e=>setDistrict(e.target.value)}><option value="">Select District</option><option>Hyderabad</option><option>Warangal</option><option>Karimnagar</option><option>Nizamabad</option><option>Khammam</option></select></label><label>Mandal<input value={mandal} onChange={e=>setMandal(e.target.value)} placeholder="Enter mandal"/></label></div><button className="primary-btn full" onClick={next}>Next <ArrowRight size={16}/></button></AuthCard>
}

function Occupation({go}:{go:(p:Page)=>void}){
  const occupations=[["Student","student",GraduationCap],["Farmer","farmer",Leaf],["Government Employee","government",Landmark],["Private Employee","private",BriefcaseBusiness],["Business Owner","business",Building2],["Homemaker","other",Home],["Senior Citizen","senior",Users],["Person with Disability","other",ShieldCheck]] as const;
  const [selected,setSelected]=useState(getRegistrationDraft().persona||"");
  const choose=(value:string)=>{ setSelected(value); saveRegistrationDraft({persona:value}); };
  return <AuthCard title="Tell us about yourself" subtitle="Select the option that best describes you"><Progress current={2}/><div className="occupation-grid">{occupations.map(([t,value,I])=><button className={selected===value?"selected":""} key={t} onClick={()=>choose(value)}><I size={22}/><span>{t}</span></button>)}</div><button className="primary-btn full" disabled={!selected} onClick={()=>go("student-details")}>Next <ArrowRight size={16}/></button></AuthCard>
}

function StudentDetails({go}:{go:(p:Page)=>void}){
  const draft=getRegistrationDraft();
  const persona=draft.persona||"student";
  const [education,setEducation]=useState(draft.education||"");
  const [interests,setInterests]=useState<string[]>(draft.interests||[]);
  const [landSize,setLandSize]=useState(draft.landSize||"");
  const [crops,setCrops]=useState(draft.crops||"");
  const [businessType,setBusinessType]=useState(draft.businessType||"");
  const [loading,setLoading]=useState(false);
  const toggleInterest=(value:string)=>setInterests((current)=>current.includes(value)?current.filter((x)=>x!==value):[...current,value]);
  const domainMap:any={student:"student",farmer:"farmer",government:"employee",private:"employee",business:"business",senior:"senior_citizen",other:"other"};
  const destinationMap:any={student:"student",farmer:"farmer",government:"government",private:"private",business:"business",senior:"senior",other:"other"};
  async function finish(){
    const finalDraft={...getRegistrationDraft(),education,interests,landSize,crops,businessType};
    setLoading(true);
    try {
      const data=await apiFetch("/auth/register",{method:"POST",body:JSON.stringify({name:finalDraft.name,email:finalDraft.email,password:finalDraft.password,profile:{occupation:domainMap[persona]||"other",dateOfBirth:finalDraft.dateOfBirth,gender:finalDraft.gender,state:"Telangana",district:finalDraft.district,mandal:finalDraft.mandal,education,interests}})});
      saveSession(data);
      clearRegistrationDraft();
      go((destinationMap[persona]||"other") as Page);
    } catch(err:any){ alert(err.message||"Unable to create account."); }
    finally { setLoading(false); }
  }
  const isStudent=persona==="student";
  const isFarmer=persona==="farmer";
  const isBusiness=persona==="business";
  return <AuthCard title={isStudent?"Student Details":isFarmer?"Farmer Details":isBusiness?"Business Details":"Personalize Your Profile"} subtitle="Tell us a little more so Praja Sathi can personalize your information"><Progress current={3}/>{isStudent&&<><label>Current Education Level<select value={education} onChange={e=>setEducation(e.target.value)}><option value="">Select education</option><option>Intermediate</option><option>Undergraduate</option><option>Postgraduate</option><option>Diploma</option></select></label><div><span className="field-label">Interests</span><div className="chips">{["Engineering","Competitions","Sports","Scholarships","Jobs"].map((item)=><button className={interests.includes(item)?"selected-chip":""} type="button" key={item} onClick={()=>toggleInterest(item)}>{item}</button>)}</div></div></>}{isFarmer&&<><label>Primary crops<input value={crops} onChange={e=>setCrops(e.target.value)} placeholder="e.g. Paddy, Cotton"/></label><label>Approximate cultivated land (acres)<input value={landSize} onChange={e=>setLandSize(e.target.value)} inputMode="decimal" placeholder="e.g. 4.5"/></label><div><span className="field-label">Interests</span><div className="chips">{["Crop support","MSP","Procurement","Agricultural inputs","Weather"].map((item)=><button className={interests.includes(item)?"selected-chip":""} type="button" key={item} onClick={()=>toggleInterest(item)}>{item}</button>)}</div></div></>}{isBusiness&&<><label>Business type<input value={businessType} onChange={e=>setBusinessType(e.target.value)} placeholder="e.g. Retail, Manufacturing, Services"/></label><div><span className="field-label">Business interests</span><div className="chips">{["MSME","Loans","Subsidies","Tenders","Registrations"].map((item)=><button className={interests.includes(item)?"selected-chip":""} type="button" key={item} onClick={()=>toggleInterest(item)}>{item}</button>)}</div></div></>}{!isStudent&&!isFarmer&&!isBusiness&&<><label>What would you like help with?<div className="chips">{["Schemes","Benefits","Jobs","Services","Documents"].map((item)=><button className={interests.includes(item)?"selected-chip":""} type="button" key={item} onClick={()=>toggleInterest(item)}>{item}</button>)}</div></label></>}<button className="primary-btn full" onClick={finish} disabled={loading}>{loading?"Creating account...":"Complete Registration"} <CheckCircle2 size={16}/></button></AuthCard>
}

function Progressfunction Progress({current}:{current:number}){return <div className="progress"><div className="progress-line"/>{[1,2,3].map(i=><span className={i<=current?"done":""} key={i}>{i<current?"✓":i}</span>)}</div>}

const schemes=[["Post-Matric Scholarship","For SC/ST/BC/EBC students","30 Apr 2026","Scholarship",GraduationCap],["Telangana Overseas Scholarship","For higher studies abroad","15 May 2026","Scholarship",Trophy],["Fee Reimbursement Scheme","For eligible students","20 Apr 2026","Education Support",WalletCards],["Telangana Vidya Bharosa","Educational support scheme","30 Apr 2026","Education Support",BookOpen]];
function Schemes(){return <><PageHeader title="Student Schemes" subtitle="Discover benefits and financial support personalized for your education."/><div className="filterbar"><button className="active">All</button><button>Scholarships</button><button>Fee Reimbursement</button><button>Education Support</button><div className="spacer"/><div className="small-search"><Search size={16}/><input placeholder="Search schemes"/></div></div><div className="scheme-grid">{schemes.map(([t,d,deadline,tag,I])=><article className="scheme-card" key={t as string}><div className="scheme-icon"><I size={21}/></div><div className="scheme-tag">{tag as string}</div><h3>{t as string}</h3><p>{d as string}</p><div className="deadline"><CalendarDays size={15}/><span>Last date: <b>{deadline as string}</b></span></div><button className="primary-btn small">Apply Now</button></article>)}</div></>}

const exams=[["TS EAMCET 2025","Engineering Entrance Exam for Telangana","10 Apr 2025"],["JEE Advanced 2025","For JEE Main qualified candidates","05 May 2025"],["TS ECET 2025","For Diploma holders (Lateral Entry)","30 Apr 2025"],["NDA 2025","National Defence Academy","01 Jun 2025"],["BITSAT 2025","Birla Institute of Technology and Science","10 Oct 2025"]];
function Exams(){return <><PageHeader title="Exams & Opportunities" subtitle="Track important entrance exams and opportunities before their deadlines."/><div className="filterbar"><button className="active">All</button><button>Entrance Exams</button><button>Scholarships</button><button>Competitions</button><button>Sports</button></div><div className="list-card">{exams.map(([t,d,date],i)=><div className="list-row" key={t}><div className="date-box"><b>{date.split(" ")[0]}</b><span>{date.split(" ")[1]?.slice(0,3)}</span></div><div className="row-main"><h3>{t}</h3><p>{d}</p><small>Registration last date: {date}</small></div><button className="outline-btn small">Visit</button></div>)}</div></>}

const competitions=[["IMO - International Mathematics Olympiad","For Classes 1-12","15 Sep 2025",Trophy],["NSO - National Science Olympiad","For Classes 1-12","20 Sep 2025",Sparkles],["Spell Bee Competition","For Classes 1-10","30 Aug 2025",BookOpen],["U-15 Cricket Tournament","For School Students (Under 15)","10 Jul 2025",Trophy],["State Level Science Fair","For School Students","25 Aug 2025",Sparkles]];
function Competitions(){return <><PageHeader title="Competitions & Events" subtitle="Explore academic, sports and innovation opportunities."/><div className="filterbar"><button className="active">Academic</button><button>Sports</button><button>Hackathons</button><button>Workshops</button></div><div className="list-card">{competitions.map(([t,d,date,I])=><div className="list-row" key={t as string}><div className="round-icon"><I size={21}/></div><div className="row-main"><h3>{t as string}</h3><p>{d as string}</p><small>Registration last date: {date as string}</small></div><button className="outline-btn small">Visit</button></div>)}</div></>}

function DigiLocker(){return <div className="digilocker"><div className="digi-hero"><div><span className="digi-logo"><ShieldCheck/></span><span className="eyebrow">SECURE DOCUMENTS</span><h1>DigiLocker</h1><p>Your digital documents, always with you.</p><div className="digi-points"><span>✓ Mark sheets</span><span>✓ Passing certificates</span><span>✓ Aadhaar, PAN and other documents</span><span>✓ Easy sharing and verification</span></div><button className="primary-btn">Go to DigiLocker <ArrowRight size={16}/></button></div><div className="document-stack"><FileText/><FileText/><FileText/></div></div><div className="doc-grid">{["Marksheets","Passing Certificates","Identity Documents"].map((x,i)=><div className="doc-card" key={x}><FileText/><div><b>{x}</b><span>{i+2} documents</span></div><ChevronRight/></div>)}</div></div>}

function StudentDashboard({go}:{go:(p:Page)=>void}){return <><div className="welcome-banner"><div><span className="eyebrow">STUDENT DASHBOARD</span><h1>Good Morning, Rahul <span>👋</span></h1><p>Intermediate 2nd Year · MPC<br/><b>Hyderabad, Telangana</b></p><button className="outline-btn small">Edit Profile</button></div><div className="student-illustration"><GraduationCap size={68}/></div></div><div className="stat-grid">{[["Schemes","8 relevant",Landmark],["Exams","12 upcoming",CalendarDays],["Competitions","6 upcoming",Trophy],["Opportunities","4 new",Sparkles]].map(([t,v,I])=><div className="stat-card" key={t as string}><span className="icon-tile"><I size={20}/></span><div><b>{t as string}</b><strong>{v as string}</strong></div></div>)}</div><section className="section"><SectionTitle title="Quick Actions"/><div className="quick-grid"><Quick icon={ShieldCheck} title="DigiLocker" text="Access your documents" onClick={()=>go("digilocker")}/><Quick icon={Bot} title="Ask Sathi AI" text="Get instant answers" onClick={()=>go("ai")}/><Quick icon={Settings} title="Profile & Settings" text="Update your details" onClick={()=>go("settings")}/></div></section><section className="section two-col"><div><SectionTitle title="Upcoming Deadlines"/><div className="deadline-card"><CalendarDays/><div><b>TS EAMCET 2025</b><span>Engineering Entrance Exam</span></div><strong>10 Apr 2025</strong><button>View</button></div><div className="deadline-card"><GraduationCap/><div><b>Post-Matric Scholarship</b><span>For Intermediate / Degree Students</span></div><strong>30 Apr 2025</strong><button>View</button></div></div><div className="side-highlight"><span className="icon-tile"><Bot/></span><h3>Need help?</h3><p>Sathi AI can help you find schemes, deadlines and opportunities.</p><button className="primary-btn small" onClick={()=>go("ai")}>Ask Sathi AI</button></div></section></>}

function Quick({icon:Icon,title,text,onClick}:{icon:any;title:string;text:string;onClick:()=>void}){return <button className="quick-card" onClick={onClick}><span className="icon-tile"><Icon/></span><span><b>{title}</b><small>{text}</small></span><ChevronRight/></button>}
function SectionTitle({title}:{title:string}){return <div className="section-title"><h2>{title}</h2><button>View all</button></div>}
function PageHeader({title,subtitle}:{title:string;subtitle:string}){return <div className="page-header"><div><span className="eyebrow">PRAJA SATHI</span><h1>{title}</h1><p>{subtitle}</p></div><button className="outline-btn">Download / Share</button></div>}

function FarmerDashboard({go}:{go:(p:Page)=>void}){return <><div className="farmer-banner" style={{backgroundImage:`linear-gradient(90deg,rgba(6,62,47,.9),rgba(6,62,47,.35)),url(${farmerImage})`}}><div><span className="eyebrow light">FARMER DASHBOARD</span><h1>Good Morning, Ramesh 🌾</h1><p>Farmer · Karimnagar, Telangana</p><button className="outline-btn light-btn">Edit Profile</button></div></div><div className="stat-grid">{[["Schemes","6 relevant",Landmark],["MSP Info","5 crops",WalletCards],["Agri Shops","12 nearby",ShoppingBag],["Weather","Live updates",CloudSun]].map(([t,v,I])=><div className="stat-card" key={t as string}><span className="icon-tile green"><I size={20}/></span><div><b>{t as string}</b><strong>{v as string}</strong></div></div>)}</div><section className="section"><SectionTitle title="Your Crops"/><div className="crop-grid">{["Paddy","Cotton","Maize"].map(x=><div className="crop-card" key={x}><Wheat/><b>{x}</b><span>View crop details</span></div>)}<button className="crop-card add"><span>+</span><b>Add Crop</b></button></div></section><section className="section"><SectionTitle title="Quick Actions"/><div className="quick-grid"><Quick icon={WalletCards} title="Check MSP Prices" text="Current crop MSP" onClick={()=>go("msp")}/><Quick icon={ShoppingBag} title="Find Nearby Shops" text="Agri inputs & prices" onClick={()=>go("shops")}/><Quick icon={Bot} title="Ask Sathi AI" text="Farming guidance" onClick={()=>go("ai")}/></div></section></>}

const msp=[["Paddy","2,320","Yes"],["Cotton","7,521","Yes"],["Maize","2,090","Yes"],["Red Gram (Tur)","7,000","Limited"],["Green Gram","8,682","Limited"],["Black Gram","7,400","Limited"],["Groundnut","6,783","Yes"]];
function MSP(){return <><PageHeader title="MSP & Procurement" subtitle="Track minimum support prices and procurement availability."/><div className="filterbar"><button className="active">MSP Prices</button><button>Procurement Centres</button><button>Market Prices</button></div><div className="table-card"><table><thead><tr><th>Crop</th><th>MSP (₹ / Quintal)</th><th>Telangana Procurement</th><th>Actions</th></tr></thead><tbody>{msp.map(r=><tr key={r[0]}><td><b>{r[0]}</b></td><td>₹ {r[1]}</td><td><span className={r[2]==="Yes"?"status green":"status amber"}>{r[2]}</span></td><td><button className="link">View Details</button></td></tr>)}</tbody></table></div></>}

function Shops(){const shops=[["Sri Venkateshwara Agro Shop","Seeds, Fertilizers, Pesticides","2.4 km"],["Rythu Mitra Agri Centre","All types of seeds and fertilizers","3.1 km"],["Agri Trends Seeds and Agri Mart","Seeds, Organic Fertilizers","4.6 km"],["Raju Fertilizers & Seeds","Fertilizers, Pesticides","5.2 km"]];return <><PageHeader title="Nearby Agri Shops" subtitle="Find trusted agricultural inputs and compare prices nearby."/><div className="small-search wide"><Search/><input placeholder="Search seeds, fertilizers, pesticides..."/></div><div className="shop-grid">{shops.map(([n,d,dist])=><article className="shop-card" key={n}><div className="shop-thumb"><Leaf/></div><div><div className="shop-top"><h3>{n}</h3><span className="status green">Open</span></div><p>{d}</p><small>{dist} · Karimnagar</small><button className="outline-btn small">View Prices</button></div></article>)}</div></>}

function AI({chat,message,setMessage,send}:{chat:any[];message:string;setMessage:(s:string)=>void;send:()=>void}){return <div className="ai-page"><div className="ai-intro"><span className="ai-orb"><Bot/></span><div><span className="eyebrow">YOUR PERSONAL ASSISTANT</span><h1>Sathi AI</h1><p>Government schemes, services & opportunities — explained simply.</p></div><select><option>English</option><option>తెలుగు</option><option>हिन्दी</option></select></div><div className="chat-card"><div className="chat-head"><div><b>Sathi AI</b><span><i/> Online</span></div><button><Settings size={17}/></button></div><div className="chat-body">{chat.map((m,i)=><div key={i} className={m.role==="user"?"bubble user":"bubble"}>{m.text}</div>)}<div className="suggestions">{["What scholarships am I eligible for?","Upcoming engineering exams?","Farmer schemes in Telangana?"].map(x=><button key={x} onClick={()=>setMessage(x)}>{x}</button>)}</div></div><div className="chat-input"><input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type your question here..."/><button onClick={send}><ArrowRight/></button></div></div></div>}

function OtherDashboard({kind,go}:{kind:string;go:(p:Page)=>void}){const data:any={government:["Government Employee","Employee Services","Government Circulars","Pension Information","Important Notifications",Landmark],private:["Private Employee / IT Professional","Relevant Scheme","Skill Development Programs","Hackathons & Opportunities","Government Services",BriefcaseBusiness],business:["Business Owner","Business Schemes","MSME Support","Registrations & Licenses","Government Tenders",Building2],senior:["Senior Citizen","Pension Schemes","Healthcare Services","Important Contacts","Document Services",Users],other:["Other Citizen","Government Schemes","Citizen Services","Important Notices","Help & Guidance",UserRound]}[kind] || ["Other Citizen","Government Schemes","Citizen Services","Important Notices","Help & Guidance",UserRound];const Icon=data[5];return <><div className="page-header"><div><span className="eyebrow">CITIZEN SERVICES</span><h1>{data[0]}</h1><p>Personalized services and important information in one place.</p></div><button className="primary-btn" onClick={()=>go("ai")}>Ask Sathi AI</button></div><div className="other-grid">{data.slice(1,5).map((x:string)=><article key={x} className="other-card"><span className="icon-tile"><Icon size={22}/></span><h3>{x}</h3><p>Explore personalized information, applications and updates.</p><button className="link">Explore <ArrowRight size={15}/></button></article>)}</div><div className="notice"><Bell/><div><b>Important notifications</b><p>Check deadlines and service updates regularly to avoid missing important opportunities.</p></div></div></>}

function SettingsPage(){return <><PageHeader title="Profile & Settings" subtitle="Manage your personal information and preferences."/><div className="settings-layout"><div className="profile-card"><div className="avatar xlarge">RK</div><h2>Rahul Kumar</h2><p>Student · Intermediate 2nd Year · MPC</p><button className="outline-btn small">Edit Profile</button></div><div className="settings-card">{["Personal Information","Education Details","Interests","Location","Language Preference","Change Password"].map((x,i)=><button key={x}><span className="icon-tile">{[UserRound,GraduationCap,Sparkles,Building2,MessageCircle,ShieldCheck][i]({size:18})}</span><span><b>{x}</b><small>Manage your {x.toLowerCase()}</small></span><ChevronRight/></button>)}</div></div></>}

export default App;
