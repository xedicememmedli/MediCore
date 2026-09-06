import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

const mockDoctors = [
  { id: 1, appUserName: "Dr. Əli Həsənov", specialtyName: "Kardioloqiya", specialtyId: 1, consultationFee: 50, experience: 12, education: "Tibb Universiteti", biography: "Ürək-damar xəstəliklərinin müalicəsində 12 illik təcrübə.", workingHours: "09:00-18:00", imageUrl: "" },
  { id: 2, appUserName: "Dr. Günel Quliyeva", specialtyName: "Nevrologiya", specialtyId: 2, consultationFee: 60, experience: 8, education: "AzTU Tibb fakültəsi", biography: "Sinir sistemi xəstəliklərinin diaqnostikası üzrə mütəxəssis.", workingHours: "10:00-17:00", imageUrl: "" },
  { id: 3, appUserName: "Dr. Tural İsmayılov", specialtyName: "Ortopediya", specialtyId: 3, consultationFee: 70, experience: 15, education: "Bakı Dövlət Universiteti", biography: "Sümük-oynaq xəstəliklərinin cərrahi müalicəsi.", workingHours: "08:00-16:00", imageUrl: "" },
  { id: 4, appUserName: "Dr. Nigar Abbasova", specialtyName: "Dərmatologiya", specialtyId: 4, consultationFee: 45, experience: 6, education: "Tibb Universiteti", biography: "Dəri xəstəliklərinin diaqnostikası və müalicəsi.", workingHours: "11:00-19:00", imageUrl: "" },
];
const mockSpecialties = [
  { id: 1, name: "Kardioloqiya" }, { id: 2, name: "Nevrologiya" },
  { id: 3, name: "Ortopediya" }, { id: 4, name: "Dərmatologiya" },
];
const mockSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "16:00"];

const SPEC_ICONS = {
  "Kardioloqiya": "❤️", "Nevrologiya": "🧠", "Ortopediya": "🦴",
  "Dərmatologiya": "✨", "Oftalmologiya": "👁️", "Pediatriya": "👶",
  "Stomatoloji": "🦷", "default": "🩺",
};

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:16px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }

  /* SPEC FİLTER */
  .spec-filters { display:flex; gap:8px; margin-bottom:20px; overflow-x:auto; padding-bottom:4px; }
  .spec-filters::-webkit-scrollbar { height:0; }
  .spec-chip { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:20px; border:1.5px solid #D6EAF8; background:#fff; font-size:12px; font-weight:700; color:#5D8AA8; cursor:pointer; transition:all 0.18s; white-space:nowrap; flex-shrink:0; }
  .spec-chip:hover { border-color:#AED6F1; color:#1A5276; }
  .spec-chip.active { border-color:#1A5276; background:#EAF2F8; color:#1A5276; }

  /* TOOLBAR */
  .toolbar { display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
  .search-bar { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #D6EAF8; border-radius:9px; padding:9px 14px; flex:1; max-width:320px; transition:all 0.2s; }
  .search-bar:focus-within { border-color:#1A5276; box-shadow:0 0 0 3px rgba(31,97,141,0.08); }
  .search-bar input { border:none; background:none; outline:none; font-size:13px; color:#1A252F; width:100%; font-family:'Plus Jakarta Sans',sans-serif; }
  .search-bar input::placeholder { color:#B0C4D8; }

  /* DOKTOR KARTLARİ */
  .doc-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:16px; }
  .doc-card { background:#fff; border-radius:16px; border:1.5px solid #D6EAF8; overflow:hidden; transition:all 0.22s; cursor:pointer; }
  .doc-card:hover { border-color:#AED6F1; transform:translateY(-3px); box-shadow:0 12px 32px rgba(31,97,141,0.12); }
  .doc-card-top { padding:18px 18px 14px; display:flex; gap:14px; align-items:flex-start; }
  .doc-avatar { width:54px; height:54px; border-radius:14px; background:linear-gradient(135deg,#1A5276,#1F618D); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:#fff; flex-shrink:0; }
  .doc-name { font-size:15px; font-weight:800; color:#154360; margin-bottom:3px; }
  .doc-spec { display:inline-flex; align-items:center; gap:4px; background:#EAF2F8; border:1px solid #AED6F1; color:#1A5276; font-size:11px; font-weight:700; padding:3px 9px; border-radius:20px; margin-bottom:6px; }
  .doc-exp { font-size:12px; color:#8DAFC4; }
  .doc-fee-big { font-size:18px; font-weight:800; color:#1A5276; margin-top:2px; }

  /* BOŞ SAATLAR */
  .doc-slots-wrap { padding:0 18px 14px; }
  .slots-label { font-size:11px; font-weight:800; color:#5D8AA8; letter-spacing:0.6px; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .slots-label .dot { width:6px; height:6px; border-radius:50%; background:#1F618D; animation:pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
  .slots-row { display:flex; flex-wrap:wrap; gap:6px; }
  .slot-pill { padding:5px 11px; border-radius:20px; border:1.5px solid #D6EAF8; background:#F8FCFF; font-size:11px; font-weight:700; color:#5D8AA8; cursor:pointer; transition:all 0.18s; }
  .slot-pill:hover { border-color:#1A5276; color:#1A5276; background:#EAF2F8; }
  .slot-pill.selected { background:linear-gradient(135deg,#1A5276,#1F618D); border-color:#1A5276; color:#fff; }
  .no-slots { font-size:12px; color:#B0C4D8; font-style:italic; }

  .doc-card-footer { padding:10px 18px 16px; }
  .btn-book { width:100%; padding:11px; background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:7px; }
  .btn-book:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1A5276); transform:translateY(-1px); box-shadow:0 6px 16px rgba(31,97,141,0.3); }
  .btn-book:disabled { background:#D6EAF8; color:#8DAFC4; cursor:not-allowed; transform:none; box-shadow:none; }

  /* SKELETON */
  .skel-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:16px; }
  .skel-card { background:#fff; border-radius:16px; border:1.5px solid #D6EAF8; overflow:hidden; }
  .skel-top { padding:18px; display:flex; gap:14px; }
  .skel-avatar { width:54px; height:54px; border-radius:14px; background:#EBF5FB; flex-shrink:0; }
  .skel-lines { flex:1; display:flex; flex-direction:column; gap:8px; }
  .skel-line { height:12px; border-radius:6px; background:linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .skel-slots { padding:0 18px 14px; display:flex; gap:8px; }
  .skel-slot { height:28px; width:60px; border-radius:20px; background:linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }

  /* MODAL */
  .overlay { position:fixed; inset:0; background:rgba(21,67,96,0.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; animation:fadeIn 0.18s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal { background:#fff; border-radius:16px; width:100%; max-width:480px; box-shadow:0 24px 64px rgba(21,67,96,0.2); animation:slideUp 0.2s ease; }
  @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-head { padding:22px 24px 18px; border-bottom:1px solid #EBF5FB; display:flex; align-items:center; justify-content:space-between; }
  .modal-title { font-size:17px; font-weight:800; color:#154360; }
  .modal-x { width:30px; height:30px; border-radius:8px; background:#EBF5FB; border:none; cursor:pointer; font-size:14px; color:#5D8AA8; display:flex; align-items:center; justify-content:center; }
  .modal-x:hover { background:#D6EAF8; }
  .modal-body { padding:22px 24px; display:flex; flex-direction:column; gap:16px; }
  .modal-foot { padding:16px 24px; border-top:1px solid #EBF5FB; display:flex; gap:10px; justify-content:flex-end; }
  .fg { display:flex; flex-direction:column; gap:7px; }
  .fl { font-size:12px; font-weight:700; color:#1A5276; letter-spacing:0.5px; text-transform:uppercase; }
  .fi { padding:11px 14px; border:1.5px solid #D6EAF8; border-radius:9px; font-size:14px; color:#1A252F; font-family:'Plus Jakarta Sans',sans-serif; background:#F8FCFF; outline:none; transition:all 0.2s; }
  .fi:focus { border-color:#1A5276; background:#fff; box-shadow:0 0 0 3px rgba(31,97,141,0.09); }
  textarea.fi { resize:vertical; min-height:80px; }
  .btn-cancel-modal { padding:10px 18px; background:#EBF5FB; border:1.5px solid #D6EAF8; border-radius:9px; color:#1F618D; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; }
  .btn-cancel-modal:hover { background:#D6EAF8; }
  .btn-primary { display:flex; align-items:center; gap:7px; padding:10px 18px; background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; }
  .btn-primary:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1A5276); }
  .btn-primary:disabled { opacity:0.7; cursor:not-allowed; }
  .err-msg { background:#FDF2F2; border:1px solid #FADBD8; color:#C0392B; padding:10px 14px; border-radius:8px; font-size:13px; }
  .spin { width:14px; height:14px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* UĞUR EKRANI */
  .success-screen { text-align:center; padding:10px 0; }
  .success-icon { font-size:56px; margin-bottom:14px; }
  .success-title { font-size:20px; font-weight:800; color:#154360; margin-bottom:8px; }
  .success-sub { font-size:14px; color:#5D8AA8; line-height:1.6; }

  /* RANDEVU XÜLASƏ KARTI */
  .booking-summary { background:linear-gradient(135deg,#EAF2F8,#F0FFF8); border:1.5px solid #AED6F1; border-radius:12px; padding:16px; }
  .booking-summary-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #D6EAF8; font-size:13px; }
  .booking-summary-row:last-child { border-bottom:none; }
  .booking-summary-row .lbl { color:#5D8AA8; font-weight:600; }
  .booking-summary-row .val { color:#154360; font-weight:700; }

  .count-badge { display:inline-flex; align-items:center; background:#EAF2F8; border:1px solid #AED6F1; color:#1A5276; font-size:12px; font-weight:700; padding:2px 10px; border-radius:20px; margin-left:10px; }
  .empty-state { text-align:center; padding:60px; background:#fff; border-radius:14px; border:1.5px dashed #D6EAF8; }
  .empty-state .ei { font-size:48px; margin-bottom:12px; }
  .empty-state h3 { font-size:16px; font-weight:700; color:#154360; margin-bottom:6px; }
  .empty-state p { font-size:13px; color:#5D8AA8; }

  /* CALENDAR */
  .cal-wrap { }
  .cal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .cal-month { font-size:14px; font-weight:800; color:#154360; }
  .cal-nav { width:28px; height:28px; border-radius:8px; background:#EBF5FB; border:none; cursor:pointer; font-size:14px; color:#1F618D; display:flex; align-items:center; justify-content:center; }
  .cal-nav:hover { background:#D6EAF8; }
  .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
  .cal-day-name { text-align:center; font-size:10px; font-weight:800; color:#8DAFC4; padding:4px 0; letter-spacing:0.5px; }
  .cal-day { text-align:center; padding:6px 2px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s; position:relative; }
  .cal-day:hover:not(.empty):not(.past) { background:#EAF2F8; color:#1A5276; }
  .cal-day.empty { cursor:default; }
  .cal-day.past { color:#C5D8E8; cursor:not-allowed; }
  .cal-day.today { background:#EBF5FB; color:#1F618D; }
  .cal-day.selected { background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; }
  .cal-day .has-slots { position:absolute; bottom:1px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:#1F618D; }
  .cal-day.selected .has-slots { background:#fff; }
`;

function SkeletonGrid() {
  return (
    <div className="skel-grid">
      {[...Array(4)].map((_, i) => (
        <div className="skel-card" key={i}>
          <div className="skel-top">
            <div className="skel-avatar" />
            <div className="skel-lines">
              <div className="skel-line" style={{ width: "70%" }} />
              <div className="skel-line" style={{ width: "45%" }} />
              <div className="skel-line" style={{ width: "55%" }} />
            </div>
          </div>
          <div className="skel-slots">
            {[...Array(4)].map((_, j) => <div className="skel-slot" key={j} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniCalendar({ selectedDate, onSelect }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthNames = ["Yanvar","Fevral","Mart","Aprel","May","İyun","İyul","Avqust","Sentyabr","Oktyabr","Noyabr","Dekabr"];
  const dayNames = ["B","Be","Ça","Çe","Ca","Cü","Ş"];

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Monday first

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal-wrap">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <span className="cal-month">{monthNames[viewMonth]} {viewYear}</span>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {dayNames.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="cal-day empty" />;
          const cellDate = new Date(viewYear, viewMonth, day);
          const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday = cellDate.toDateString() === today.toDateString();
          const selStr = selectedDate ? new Date(selectedDate).toDateString() : "";
          const isSelected = cellDate.toDateString() === selStr;
          const hasSlots = !isPast && day % 2 !== 0; // simulated

          return (
            <div key={day}
              className={`cal-day ${isPast ? "past" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => {
                if (!isPast) {
                  const d2 = new Date(viewYear, viewMonth, day);
                  onSelect(d2.toISOString().split("T")[0]);
                }
              }}
            >
              {day}
              {hasSlots && <div className="has-slots" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("");
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState({}); // { doctorId: [slots] }
  const [selectedSlot, setSelectedSlot] = useState({}); // { doctorId: "09:00" }
  const [bookingDoc, setBookingDoc] = useState(null);
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookNote, setBookNote] = useState("");
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState("");
  const [bookSuccess, setBookSuccess] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dRes, sRes] = await Promise.all([
          axios.get(`${API}/api/Doctor`, { headers: authHeader() }),
          axios.get(`${API}/api/Specialty`, { headers: authHeader() }),
        ]);
        const docs = Array.isArray(dRes.data) ? dRes.data : dRes.data?.data || [];
        setDoctors(docs);
        setSpecialties(Array.isArray(sRes.data) ? sRes.data : sRes.data?.data || []);
        // Hər həkim üçün bu günün slotlarını yüklə
        loadSlotsForDoctors(docs, new Date().toISOString().split("T")[0]);
      } catch {
        setDoctors(mockDoctors);
        setSpecialties(mockSpecialties);
        const initSlots = {};
        mockDoctors.forEach(d => { initSlots[d.id] = mockSlots.slice(0, 4 + Math.floor(Math.random() * 4)); });
        setSlots(initSlots);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const loadSlotsForDoctors = async (docs, date) => {
    for (const doc of docs) {
      try {
        setSlotsLoading(s => ({ ...s, [doc.id]: true }));
        const res = await axios.get(`${API}/api/Consultation/AvailableTimeSlots?doctorId=${doc.id}&date=${date}`, { headers: authHeader() });
        const slotData = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setSlots(s => ({ ...s, [doc.id]: slotData }));
      } catch {
        setSlots(s => ({ ...s, [doc.id]: mockSlots.slice(0, 3 + (doc.id % 3)) }));
      } finally {
        setSlotsLoading(s => ({ ...s, [doc.id]: false }));
      }
    }
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(doctors.filter(d => {
      const matchQ = (d.appUserName || "").toLowerCase().includes(q) || (d.specialtyName || "").toLowerCase().includes(q);
      const matchSpec = activeSpec ? String(d.specialtyId) === activeSpec : true;
      return matchQ && matchSpec;
    }));
  }, [search, activeSpec, doctors]);

  const openBooking = (doc) => {
    setBookingDoc(doc);
    setBookDate(new Date().toISOString().split("T")[0]);
    setBookTime(selectedSlot[doc.id] || "");
    setBookNote("");
    setBookError("");
    setBookSuccess(false);
  };

  const handleDateChange = async (date) => {
    setBookDate(date);
    setBookTime("");
    if (!bookingDoc) return;
    try {
      const res = await axios.get(`${API}/api/Consultation/AvailableTimeSlots?doctorId=${bookingDoc.id}&date=${date}`, { headers: authHeader() });
      const slotData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setSlots(s => ({ ...s, [bookingDoc.id]: slotData }));
    } catch {
      setSlots(s => ({ ...s, [bookingDoc.id]: mockSlots }));
    }
  };

  const handleBook = async () => {
    if (!bookDate) { setBookError("Tarix seçilməlidir."); return; }
    if (!bookTime) { setBookError("Saat seçilməlidir."); return; }
    setBookLoading(true); setBookError("");
    try {
      const dt = new Date(`${bookDate}T${bookTime}:00`).toISOString();
      await axios.post(`${API}/api/Consultation`, {
        doctorId: bookingDoc.id,
        scheduledTime: dt,
        notes: bookNote,
      }, { headers: jsonHeader() });
      setBookSuccess(true);
    } catch (e) {
      setBookError(e.response?.data?.message || "Xəta baş verdi.");
    } finally {
      setBookLoading(false);
    }
  };

  const initial = (name) => (name || "H").replace("Dr. ", "")[0]?.toUpperCase() || "H";

  return (
    <>
      <style>{styles}</style>
      <div className="pg-header">
        <div>
          <h1>Həkimlər <span className="count-badge">{filtered.length}</span></h1>
          <p>Mütəxəssis seçin, uygun saatı sıxın, randevu alın</p>
        </div>
      </div>

      {/* İXTİSAS FİLTRLƏRİ */}
      <div className="spec-filters">
        <div className={`spec-chip ${activeSpec === "" ? "active" : ""}`} onClick={() => setActiveSpec("")}>
          🏥 Hamısı
        </div>
        {specialties.map(s => (
          <div key={s.id} className={`spec-chip ${activeSpec === String(s.id) ? "active" : ""}`}
            onClick={() => setActiveSpec(activeSpec === String(s.id) ? "" : String(s.id))}>
            {SPEC_ICONS[s.name] || "🩺"} {s.name}
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <span style={{ color: "#B0C4D8", fontSize: 14 }}>🔍</span>
          <input placeholder="Həkim axtar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <SkeletonGrid /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">👨‍⚕️</div>
          <h3>Həkim tapılmadı</h3>
          <p>Başqa ixtisas seçin və ya axtarışı dəyişin</p>
        </div>
      ) : (
        <div className="doc-grid">
          {filtered.map(doc => {
            const docSlots = slots[doc.id] || [];
            const chosen = selectedSlot[doc.id];
            return (
              <div className="doc-card" key={doc.id}>
                <div className="doc-card-top">
                  <div className="doc-avatar">{initial(doc.appUserName)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="doc-name">{doc.appUserName || `Həkim #${doc.id}`}</div>
                    <div className="doc-spec">
                      {SPEC_ICONS[doc.specialtyName] || "🩺"} {doc.specialtyName}
                    </div>
                    {doc.experience && <div className="doc-exp">🎓 {doc.experience} il təcrübə</div>}
                    <div className="doc-fee-big">{doc.consultationFee} ₼</div>
                  </div>
                </div>

                {/* BOŞ SAATLAR */}
                <div className="doc-slots-wrap">
                  <div className="slots-label">
                    <span className="dot" />
                    Bu gün boş saatlar
                  </div>
                  {slotsLoading[doc.id] ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} style={{ height: 28, width: 56, borderRadius: 20, background: "linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                      ))}
                    </div>
                  ) : docSlots.length === 0 ? (
                    <div className="no-slots">Bu gün boş saat yoxdur</div>
                  ) : (
                    <div className="slots-row">
                      {docSlots.slice(0, 6).map(slot => (
                        <div key={slot}
                          className={`slot-pill ${chosen === slot ? "selected" : ""}`}
                          onClick={() => setSelectedSlot(s => ({ ...s, [doc.id]: slot }))}>
                          {slot}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="doc-card-footer">
                  <button className="btn-book"
                    disabled={!chosen}
                    onClick={() => openBooking(doc)}>
                    {chosen ? `📅 ${chosen} — Randevu Al` : "⬆️ Saat seçin"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RANDEVU MODALI */}
      {bookingDoc && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setBookingDoc(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">📅 Randevu Təsdiqi</div>
              <button className="modal-x" onClick={() => setBookingDoc(null)}>✕</button>
            </div>
            <div className="modal-body">
              {bookSuccess ? (
                <div className="success-screen">
                  <div className="success-icon">🎉</div>
                  <div className="success-title">Randevu alındı!</div>
                  <div className="success-sub">
                    <strong>{bookingDoc.appUserName}</strong> ilə<br />
                    {bookDate} tarixinə {bookTime} saatına<br />
                    randevunuz uğurla qeydə alındı.
                  </div>
                </div>
              ) : (
                <>
                  {bookError && <div className="err-msg">⚠️ {bookError}</div>}

                  <div className="booking-summary">
                    <div className="booking-summary-row">
                      <span className="lbl">Həkim</span>
                      <span className="val">{bookingDoc.appUserName}</span>
                    </div>
                    <div className="booking-summary-row">
                      <span className="lbl">İxtisas</span>
                      <span className="val">{bookingDoc.specialtyName}</span>
                    </div>
                    <div className="booking-summary-row">
                      <span className="lbl">Qiymət</span>
                      <span className="val" style={{ color: "#1A5276" }}>{bookingDoc.consultationFee} ₼</span>
                    </div>
                  </div>

                  <div className="fg">
                    <label className="fl">Tarix seçin</label>
                    <MiniCalendar selectedDate={bookDate} onSelect={handleDateChange} />
                  </div>

                  {bookDate && (
                    <div className="fg">
                      <label className="fl">Saat seçin — {bookDate}</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(slots[bookingDoc.id] || mockSlots).map(slot => (
                          <div key={slot}
                            className={`slot-pill ${bookTime === slot ? "selected" : ""}`}
                            style={{ fontSize: 13, padding: "7px 14px" }}
                            onClick={() => setBookTime(slot)}>
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="fg">
                    <label className="fl">Şikayət / Qeyd</label>
                    <textarea className="fi" rows={2} placeholder="Nə şikayətiniz var?" value={bookNote} onChange={e => setBookNote(e.target.value)} />
                  </div>
                </>
              )}
            </div>
            <div className="modal-foot">
              {bookSuccess ? (
                <button className="btn-primary" onClick={() => setBookingDoc(null)}>✓ Bağla</button>
              ) : (
                <>
                  <button className="btn-cancel-modal" onClick={() => setBookingDoc(null)}>Ləğv et</button>
                  <button className="btn-primary" onClick={handleBook} disabled={bookLoading || !bookTime}>
                    {bookLoading ? <><span className="spin" /> Göndərilir...</> : "📅 Randevunu təsdiqlə"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}