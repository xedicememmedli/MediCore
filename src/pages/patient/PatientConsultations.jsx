import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

const mockConsultations = [
  { id: 1, doctorId: 1, doctorName: "Dr. Əli Həsənov", specialtyName: "Kardioloqiya", scheduledTime: "2026-03-10T10:00:00", status: "Confirmed", notes: "Ürək ağrısı" },
  { id: 2, doctorId: 2, doctorName: "Dr. Günel Quliyeva", specialtyName: "Nevrologiya", scheduledTime: "2026-03-12T14:00:00", status: "Pending", notes: "" },
  { id: 3, doctorId: 1, doctorName: "Dr. Əli Həsənov", specialtyName: "Kardioloqiya", scheduledTime: "2026-03-01T09:00:00", status: "Completed", notes: "Yoxlama" },
];
const mockDoctors = [
  { id: 1, appUserName: "Dr. Əli Həsənov", specialtyName: "Kardioloqiya", specialtyId: 1, consultationFee: 50 },
  { id: 2, appUserName: "Dr. Günel Quliyeva", specialtyName: "Nevrologiya", specialtyId: 2, consultationFee: 60 },
  { id: 3, appUserName: "Dr. Tural İsmayılov", specialtyName: "Ortopediya", specialtyId: 3, consultationFee: 70 },
];
const mockSlots = ["09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00"];
const mockSpecialties = [
  { id: 1, name: "Kardioloqiya" }, { id: 2, name: "Nevrologiya" }, { id: 3, name: "Ortopediya" },
];

const STATUS_CONFIG = {
  Pending:   { label: "Gözləyir",    cls: "s-pending",   icon: "⏳" },
  Confirmed: { label: "Təsdiqləndi", cls: "s-confirmed", icon: "✅" },
  Completed: { label: "Tamamlandı",  cls: "s-completed", icon: "🏁" },
  Cancelled: { label: "Ləğv edildi", cls: "s-cancelled", icon: "❌" },
};

const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","İyun","İyul","Avqust","Sentyabr","Oktyabr","Noyabr","Dekabr"];
const SPEC_ICONS = { "Kardioloqiya":"❤️","Nevrologiya":"🧠","Ortopediya":"🦴","Dərmatologiya":"✨","default":"🩺" };

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:16px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }
  .count-badge { display:inline-flex; align-items:center; background:#EAF2F8; border:1px solid #AED6F1; color:#1A5276; font-size:12px; font-weight:700; padding:2px 10px; border-radius:20px; margin-left:10px; }
  .status-tabs { display:flex; gap:8px; margin-bottom:18px; flex-wrap:wrap; }
  .tab-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:9px; border:1.5px solid #D6EAF8; background:#fff; font-size:12px; font-weight:700; color:#5D8AA8; cursor:pointer; transition:all 0.18s; font-family:'Plus Jakarta Sans',sans-serif; }
  .tab-btn.active { border-color:#1A5276; background:#EAF2F8; color:#1A5276; }
  .tab-count { background:#D6EAF8; color:#1A5276; font-size:10px; font-weight:800; padding:1px 6px; border-radius:20px; }
  .tab-btn.active .tab-count { background:#1A5276; color:#fff; }
  .s-pill { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; white-space:nowrap; }
  .s-pending   { background:#EAF2F8; color:#D4AC0D; }
  .s-confirmed { background:#EAF2F8; color:#1A5276; }
  .s-completed { background:#EBF5FB; color:#1F618D; }
  .s-cancelled { background:#FDEDEC; color:#E74C3C; }
  .btn-primary { display:flex; align-items:center; gap:7px; padding:10px 18px; background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
  .btn-primary:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1A5276); transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.7; cursor:not-allowed; }
  .empty-state { text-align:center; padding:60px; background:#fff; border-radius:14px; border:1.5px dashed #AED6F1; }
  .empty-state .ei { font-size:48px; margin-bottom:12px; }
  .empty-state h3 { font-size:16px; font-weight:700; color:#154360; margin-bottom:6px; }
  .empty-state p { font-size:13px; color:#5D8AA8; }
  .err-msg { background:#FDF2F2; border:1px solid #FADBD8; color:#C0392B; padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:14px; }
  .spin { width:14px; height:14px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .skel-line { height:12px; border-radius:6px; background:linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* RANDEVU KARTI */
  .con-list { display:flex; flex-direction:column; gap:12px; }
  .con-card { background:#fff; border-radius:13px; border:1.5px solid #D6EAF8; padding:16px 18px; display:flex; align-items:center; gap:14px; transition:all 0.2s; }
  .con-card:hover { border-color:#AED6F1; box-shadow:0 4px 16px rgba(31,97,141,0.08); }
  .con-doctor-ava { width:46px; height:46px; border-radius:13px; background:linear-gradient(135deg,#1A5276,#1F618D); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; color:#fff; flex-shrink:0; }
  .con-info { flex:1; }
  .con-doctor { font-size:14px; font-weight:800; color:#154360; margin-bottom:3px; }
  .con-spec { font-size:11px; color:#5D8AA8; margin-bottom:4px; }
  .con-time { font-size:12px; color:#8DAFC4; display:flex; align-items:center; gap:5px; }
  .btn-cancel-appt { padding:7px 12px; background:#FDF2F2; border:1.5px solid #FADBD8; border-radius:8px; color:#E74C3C; font-size:11px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.18s; }
  .btn-cancel-appt:hover { background:#FADBD8; }

  /* STEPPER MODAL */
  .overlay { position:fixed; inset:0; background:rgba(21,67,96,0.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; animation:fadeIn 0.18s ease; overflow-y:auto; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .stepper-modal { background:#fff; border-radius:18px; width:100%; max-width:540px; box-shadow:0 24px 64px rgba(21,67,96,0.2); animation:slideUp 0.2s ease; margin:auto; }
  @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }

  /* STEPPER BAŞLIĞI */
  .step-header { padding:22px 24px 0; }
  .step-progress { display:flex; align-items:center; gap:0; margin-bottom:20px; }
  .step-prog-item { display:flex; align-items:center; flex:1; }
  .step-prog-circle { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; border:2px solid #D6EAF8; background:#fff; color:#B0C4D8; flex-shrink:0; transition:all 0.3s; }
  .step-prog-circle.done  { background:linear-gradient(135deg,#1A5276,#1F618D); border-color:#1A5276; color:#fff; }
  .step-prog-circle.active { border-color:#1A5276; color:#1A5276; background:#EAF2F8; }
  .step-prog-line { flex:1; height:2px; background:#D6EAF8; transition:background 0.3s; }
  .step-prog-line.done { background:linear-gradient(90deg,#1A5276,#1F618D); }
  .step-prog-label { font-size:11px; font-weight:700; color:#8DAFC4; margin-top:6px; }
  .step-prog-item.active .step-prog-label { color:#1A5276; }
  .step-labels { display:flex; justify-content:space-between; margin-bottom:18px; }

  .step-title { font-size:18px; font-weight:800; color:#154360; margin-bottom:6px; }
  .step-sub { font-size:13px; color:#5D8AA8; }

  .stepper-body { padding:20px 24px; min-height:180px; }
  .stepper-foot { padding:16px 24px; border-top:1px solid #EBF5FB; display:flex; gap:10px; justify-content:space-between; align-items:center; }
  .btn-step-back { padding:10px 18px; background:#EBF5FB; border:1.5px solid #D6EAF8; border-radius:9px; color:#1F618D; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; }
  .btn-step-back:hover { background:#D6EAF8; }

  /* ADDIM 1 — İXTİSAS */
  .spec-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .spec-opt { padding:14px; border-radius:12px; border:1.5px solid #D6EAF8; background:#F8FCFF; cursor:pointer; transition:all 0.18s; text-align:center; }
  .spec-opt:hover { border-color:#AED6F1; background:#EAF2F8; }
  .spec-opt.selected { border-color:#1A5276; background:#EAF2F8; }
  .spec-opt-icon { font-size:24px; margin-bottom:6px; }
  .spec-opt-name { font-size:12px; font-weight:700; color:#154360; }

  /* ADDIM 2 — HƏKİM */
  .doc-opts { display:flex; flex-direction:column; gap:10px; }
  .doc-opt { padding:14px; border-radius:12px; border:1.5px solid #D6EAF8; background:#F8FCFF; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; gap:12px; }
  .doc-opt:hover { border-color:#AED6F1; }
  .doc-opt.selected { border-color:#1A5276; background:#EAF2F8; }
  .doc-opt-ava { width:40px; height:40px; border-radius:11px; background:linear-gradient(135deg,#1A5276,#1F618D); display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px; font-weight:800; flex-shrink:0; }
  .doc-opt-name { font-size:13px; font-weight:700; color:#154360; }
  .doc-opt-fee { font-size:12px; font-weight:800; color:#1A5276; margin-top:2px; }

  /* ADDIM 3 — TARİX VƏ SAAT */
  .cal-wrap { }
  .cal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .cal-month { font-size:14px; font-weight:800; color:#154360; }
  .cal-nav { width:28px; height:28px; border-radius:8px; background:#EBF5FB; border:none; cursor:pointer; font-size:14px; color:#1F618D; display:flex; align-items:center; justify-content:center; }
  .cal-nav:hover { background:#D6EAF8; }
  .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; margin-bottom:14px; }
  .cal-day-name { text-align:center; font-size:10px; font-weight:800; color:#8DAFC4; padding:4px 0; }
  .cal-day { text-align:center; padding:7px 2px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s; }
  .cal-day:hover:not(.empty):not(.past) { background:#EAF2F8; color:#1A5276; }
  .cal-day.empty { cursor:default; }
  .cal-day.past { color:#C5D8E8; cursor:not-allowed; }
  .cal-day.today { background:#EBF5FB; color:#1F618D; }
  .cal-day.selected { background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; }
  .slots-label { font-size:11px; font-weight:800; color:#5D8AA8; letter-spacing:0.6px; text-transform:uppercase; margin-bottom:8px; }
  .slots-row { display:flex; flex-wrap:wrap; gap:7px; }
  .slot-pill { padding:6px 13px; border-radius:20px; border:1.5px solid #D6EAF8; background:#F8FCFF; font-size:12px; font-weight:700; color:#5D8AA8; cursor:pointer; transition:all 0.18s; }
  .slot-pill:hover { border-color:#1A5276; color:#1A5276; background:#EAF2F8; }
  .slot-pill.selected { background:linear-gradient(135deg,#1A5276,#1F618D); border-color:#1A5276; color:#fff; }

  /* ADDIM 4 — TƏSDİQ */
  .summary-card { background:linear-gradient(135deg,#EAF2F8,#F0FFF8); border:1.5px solid #AED6F1; border-radius:13px; padding:18px; margin-bottom:16px; }
  .summary-row { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #D6EAF8; font-size:13px; }
  .summary-row:last-child { border-bottom:none; }
  .summary-row .lbl { color:#5D8AA8; font-weight:600; }
  .summary-row .val { color:#154360; font-weight:800; }
  .fg { display:flex; flex-direction:column; gap:7px; margin-top:14px; }
  .fl { font-size:12px; font-weight:700; color:#1A5276; letter-spacing:0.5px; text-transform:uppercase; }
  .fi { padding:11px 14px; border:1.5px solid #D6EAF8; border-radius:9px; font-size:14px; color:#1A252F; font-family:'Plus Jakarta Sans',sans-serif; background:#F8FCFF; outline:none; transition:all 0.2s; resize:vertical; }
  .fi:focus { border-color:#1A5276; box-shadow:0 0 0 3px rgba(31,97,141,0.09); }
  .fi::placeholder { color:#B0C4D8; }

  /* UĞUR */
  .success-screen { text-align:center; padding:20px 0; }
  .success-icon { font-size:60px; margin-bottom:16px; animation:successPop 0.4s cubic-bezier(0.36,0.07,0.19,0.97); }
  @keyframes successPop { 0%{transform:scale(0)} 80%{transform:scale(1.2)} 100%{transform:scale(1)} }
  .success-title { font-size:20px; font-weight:800; color:#154360; margin-bottom:8px; }
  .success-sub { font-size:13px; color:#5D8AA8; line-height:1.7; }

  /* CONFIRM BOX */
  .confirm-box { background:#fff; border-radius:14px; padding:28px; max-width:360px; width:100%; text-align:center; box-shadow:0 24px 64px rgba(21,67,96,0.2); animation:slideUp 0.2s ease; }
  .confirm-box .ci { font-size:40px; margin-bottom:12px; }
  .confirm-box h3 { font-size:17px; font-weight:800; color:#154360; margin-bottom:8px; }
  .confirm-box p { font-size:13px; color:#5D8AA8; margin-bottom:22px; line-height:1.6; }
  .confirm-btns { display:flex; gap:10px; }
  .btn-cancel-modal { padding:10px 18px; background:#EBF5FB; border:1.5px solid #D6EAF8; border-radius:9px; color:#1F618D; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; }
  .btn-del-confirm { flex:1; padding:11px; background:linear-gradient(135deg,#E74C3C,#C0392B); color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; }
`;

function MiniCalendar({ selectedDate, onSelect }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const dayNames = ["B","Be","Ça","Çe","Ca","Cü","Ş"];
  const prevM = () => { if (viewMonth===0){setViewYear(y=>y-1);setViewMonth(11);}else setViewMonth(m=>m-1); };
  const nextM = () => { if (viewMonth===11){setViewYear(y=>y+1);setViewMonth(0);}else setViewMonth(m=>m+1); };
  return (
    <div className="cal-wrap">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevM}>‹</button>
        <span className="cal-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="cal-nav" onClick={nextM}>›</button>
      </div>
      <div className="cal-grid">
        {dayNames.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="cal-day empty" />;
          const cellDate = new Date(viewYear, viewMonth, day);
          const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday = cellDate.toDateString() === today.toDateString();
          const isSelected = selectedDate && cellDate.toDateString() === new Date(selectedDate).toDateString();
          return (
            <div key={day} className={`cal-day ${isPast?"past":""} ${isToday?"today":""} ${isSelected?"selected":""}`}
              onClick={() => !isPast && onSelect(new Date(viewYear, viewMonth, day).toISOString().split("T")[0])}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STEP_LABELS = ["İxtisas","Həkim","Tarix & Saat","Təsdiq"];

export default function PatientConsultations() {
  const [data, setData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showStepper, setShowStepper] = useState(false);
  const [step, setStep] = useState(0);
  const [selSpec, setSelSpec] = useState(null);
  const [selDoc, setSelDoc] = useState(null);
  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState("");
  const [note, setNote] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, dRes, sRes] = await Promise.allSettled([
        axios.get(`${API}/api/Consultation`, { headers: authHeader() }),
        axios.get(`${API}/api/Doctor`, { headers: authHeader() }),
        axios.get(`${API}/api/Specialty`, { headers: authHeader() }),
      ]);
      const get = r => r.status==="fulfilled" ? (Array.isArray(r.value.data)?r.value.data:r.value.data?.data||[]) : [];
      setData(get(cRes));
      setDoctors(get(dRes));
      setSpecialties(get(sRes));
    } catch { setData(mockConsultations); setDoctors(mockDoctors); setSpecialties(mockSpecialties); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    setFiltered(data.filter(d => activeTab==="all" || (d.status||"").toLowerCase()===activeTab.toLowerCase()));
  }, [activeTab, data]);

  const loadSlots = async (docId, date) => {
    setSlotsLoading(true);
    try {
      const res = await axios.get(`${API}/api/Consultation/AvailableTimeSlots?doctorId=${docId}&date=${date}`, { headers: authHeader() });
      setSlots(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { setSlots(mockSlots); }
    finally { setSlotsLoading(false); }
  };

  const openStepper = () => { setStep(0); setSelSpec(null); setSelDoc(null); setSelDate(""); setSelTime(""); setNote(""); setError(""); setSuccess(false); setShowStepper(true); };

  const nextStep = async () => {
    if (step===0 && !selSpec) { setError("İxtisas seçin"); return; }
    if (step===1 && !selDoc) { setError("Həkim seçin"); return; }
    if (step===2 && (!selDate||!selTime)) { setError("Tarix və saat seçin"); return; }
    setError(""); setStep(s=>s+1);
  };

  const handleDateChange = (date) => {
    setSelDate(date); setSelTime("");
    if (selDoc) loadSlots(selDoc.id, date);
  };

  const handleBook = async () => {
    setSaving(true); setError("");
    try {
      await axios.post(`${API}/api/Consultation`, {
        doctorId: selDoc.id,
        scheduledTime: new Date(`${selDate}T${selTime}:00`).toISOString(),
        notes: note,
      }, { headers: jsonHeader() });
      setSuccess(true);
      await fetchAll();
    } catch(e) { setError(e.response?.data?.message || "Xəta baş verdi."); }
    finally { setSaving(false); }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await axios.put(`${API}/api/Consultation`, { id: cancelTarget.id, doctorId: cancelTarget.doctorId, status: "Cancelled" }, { headers: jsonHeader() });
      setData(d => d.map(c => c.id===cancelTarget.id ? {...c, status:"Cancelled"} : c));
      setCancelTarget(null);
    } catch { setCancelTarget(null); }
    finally { setCancelling(false); }
  };

  const tabCount = s => s==="all" ? data.length : data.filter(d=>(d.status||"").toLowerCase()===s.toLowerCase()).length;
  const filteredDocs = selSpec ? doctors.filter(d => d.specialtyId===selSpec.id) : doctors;
  const formatDT = dt => { if(!dt) return "—"; const d=new Date(dt); return d.toLocaleDateString("az-AZ",{day:"2-digit",month:"2-digit",year:"numeric"})+" "+d.toLocaleTimeString("az-AZ",{hour:"2-digit",minute:"2-digit"}); };
  const initial = name => (name||"H").replace("Dr.","")[0]?.toUpperCase()||"H";

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div><h1>Konsultasiyalarım <span className="count-badge">{filtered.length}</span></h1><p>Həkimlərlə görüşləriniz</p></div>
        <button className="btn-primary" onClick={openStepper}>📅 Randevu Al</button>
      </div>

      <div className="status-tabs">
        {[{key:"all",icon:"📋",label:"Hamısı"},{key:"Pending",icon:"⏳",label:"Gözləyir"},{key:"Confirmed",icon:"✅",label:"Təsdiqləndi"},{key:"Completed",icon:"🏁",label:"Tamamlandı"},{key:"Cancelled",icon:"❌",label:"Ləğv edildi"}].map(t=>(
          <button key={t.key} className={`tab-btn ${activeTab===t.key?"active":""}`} onClick={()=>setActiveTab(t.key)}>
            {t.icon} {t.label} <span className="tab-count">{tabCount(t.key)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[1,2,3].map(i=><div key={i} style={{background:"#fff",borderRadius:13,border:"1.5px solid #D6EAF8",padding:16,display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:46,height:46,borderRadius:13,background:"#EBF5FB",flexShrink:0}} />
            <div style={{flex:1}}><div className="skel-line" style={{marginBottom:8,width:"60%"}} /><div className="skel-line" style={{width:"40%"}} /></div>
          </div>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="empty-state"><div className="ei">🩺</div><h3>Konsultasiya yoxdur</h3><p>Randevu almaq üçün yuxarıdakı düyməyə klikləyin</p></div>
      ) : (
        <div className="con-list">
          {filtered.map(item=>{
            const st=STATUS_CONFIG[item.status]||STATUS_CONFIG.Pending;
            return (
              <div className="con-card" key={item.id}>
                <div className="con-doctor-ava">{initial(item.doctorName)}</div>
                <div className="con-info">
                  <div className="con-doctor">{item.doctorName||`Həkim #${item.doctorId}`}</div>
                  <div className="con-spec">{item.specialtyName||""}</div>
                  <div className="con-time"><span>📅</span>{formatDT(item.scheduledTime||item.scheduledDate)}</div>
                </div>
                <span className={`s-pill ${st.cls}`}>{st.icon} {st.label}</span>
                {(item.status==="Pending"||item.status==="Confirmed")&&(
                  <button className="btn-cancel-appt" onClick={()=>setCancelTarget(item)}>Ləğv et</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* STEPPER MODAL */}
      {showStepper && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowStepper(false)}>
          <div className="stepper-modal">
            {/* PROGRESS BAR */}
            <div className="step-header">
              <div style={{display:"flex",alignItems:"center",gap:0}}>
                {STEP_LABELS.map((lbl,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",flex:1}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div className={`step-prog-circle ${success||step>i?"done":step===i?"active":""}`}>
                        {success||step>i ? "✓" : i+1}
                      </div>
                      <div style={{fontSize:9,fontWeight:700,color:step===i?"#1A5276":"#B0C4D8",whiteSpace:"nowrap"}}>{lbl}</div>
                    </div>
                    {i<STEP_LABELS.length-1&&<div style={{flex:1,height:2,background:step>i?"#1A5276":"#D6EAF8",margin:"0 4px",marginBottom:18,transition:"background 0.3s"}} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="stepper-body">
              {success ? (
                <div className="success-screen">
                  <div className="success-icon">🎉</div>
                  <div className="success-title">Randevu alındı!</div>
                  <div className="success-sub">
                    <strong>{selDoc?.appUserName}</strong> ilə<br/>
                    {selDate} — {selTime} saatına<br/>
                    randevunuz uğurla qeydə alındı.
                  </div>
                </div>
              ) : (
                <>
                  {error && <div className="err-msg" style={{marginBottom:14}}>⚠️ {error}</div>}

                  {/* ADDIM 0: İXTİSAS */}
                  {step===0&&(
                    <>
                      <div style={{fontSize:15,fontWeight:800,color:"#154360",marginBottom:14}}>🩺 İxtisas seçin</div>
                      <div className="spec-grid">
                        {specialties.map(s=>(
                          <div key={s.id} className={`spec-opt ${selSpec?.id===s.id?"selected":""}`} onClick={()=>setSelSpec(s)}>
                            <div className="spec-opt-icon">{SPEC_ICONS[s.name]||"🩺"}</div>
                            <div className="spec-opt-name">{s.name}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ADDIM 1: HƏKİM */}
                  {step===1&&(
                    <>
                      <div style={{fontSize:15,fontWeight:800,color:"#154360",marginBottom:14}}>👨‍⚕️ Həkim seçin — {selSpec?.name}</div>
                      <div className="doc-opts">
                        {filteredDocs.length===0 ? <div style={{color:"#B0C4D8",fontSize:13}}>Bu ixtisasda həkim yoxdur</div>
                        : filteredDocs.map(d=>(
                          <div key={d.id} className={`doc-opt ${selDoc?.id===d.id?"selected":""}`} onClick={()=>setSelDoc(d)}>
                            <div className="doc-opt-ava">{initial(d.appUserName)}</div>
                            <div style={{flex:1}}>
                              <div className="doc-opt-name">{d.appUserName||`Həkim #${d.id}`}</div>
                              <div className="doc-opt-fee">{d.consultationFee} ₼ / qəbul</div>
                            </div>
                            {selDoc?.id===d.id&&<span style={{color:"#1A5276",fontSize:18}}>✓</span>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ADDIM 2: TARİX & SAAT */}
                  {step===2&&(
                    <>
                      <MiniCalendar selectedDate={selDate} onSelect={handleDateChange} />
                      {selDate&&(
                        <>
                          <div className="slots-label" style={{marginTop:12}}>Boş saatlar — {selDate}</div>
                          {slotsLoading ? <div style={{color:"#B0C4D8",fontSize:13}}>⏳ Yüklənir...</div>
                          : <div className="slots-row">
                            {(slots.length?slots:mockSlots).map(s=>(
                              <div key={s} className={`slot-pill ${selTime===s?"selected":""}`} onClick={()=>setSelTime(s)}>{s}</div>
                            ))}
                          </div>}
                        </>
                      )}
                    </>
                  )}

                  {/* ADDIM 3: TƏSDİQ */}
                  {step===3&&(
                    <>
                      <div className="summary-card">
                        <div className="summary-row"><span className="lbl">Həkim</span><span className="val">{selDoc?.appUserName}</span></div>
                        <div className="summary-row"><span className="lbl">İxtisas</span><span className="val">{selSpec?.name}</span></div>
                        <div className="summary-row"><span className="lbl">Tarix</span><span className="val">{selDate}</span></div>
                        <div className="summary-row"><span className="lbl">Saat</span><span className="val">{selTime}</span></div>
                        <div className="summary-row"><span className="lbl">Qiymət</span><span className="val" style={{color:"#1A5276"}}>{selDoc?.consultationFee} ₼</span></div>
                      </div>
                      <div className="fg">
                        <label className="fl">Şikayət / Qeyd</label>
                        <textarea className="fi" rows={2} placeholder="Nə şikayətiniz var?" value={note} onChange={e=>setNote(e.target.value)} />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="stepper-foot">
              {success ? (
                <button className="btn-primary" style={{marginLeft:"auto"}} onClick={()=>setShowStepper(false)}>✓ Bağla</button>
              ) : (
                <>
                  <button className="btn-step-back" onClick={()=>step>0?setStep(s=>s-1):setShowStepper(false)}>
                    {step===0?"✕ Bağla":"← Geri"}
                  </button>
                  <button className="btn-primary" onClick={step===3?handleBook:nextStep} disabled={saving}>
                    {saving?<><span className="spin"/> Göndərilir...</>:step===3?"📅 Randevunu Təsdiqlə":"Növbəti →"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LƏĞV TƏSDİQİ */}
      {cancelTarget&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setCancelTarget(null)}>
          <div className="confirm-box">
            <div className="ci">❌</div>
            <h3>Randevu ləğv edilsin?</h3>
            <p><strong>{cancelTarget.doctorName}</strong> ilə randevu ləğv ediləcək.</p>
            <div className="confirm-btns">
              <button className="btn-cancel-modal" onClick={()=>setCancelTarget(null)}>Geri qayıt</button>
              <button className="btn-del-confirm" onClick={handleCancel} disabled={cancelling}>
                {cancelling?<span className="spin"/>:"Ləğv et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}