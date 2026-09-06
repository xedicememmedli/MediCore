import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

const mockData = [
  { id: 1, patientName: "Nigar Məmmədova", patientId: "p1", scheduledTime: "2026-03-06T09:00:00", status: "Confirmed", notes: "Ürək ağrısı şikayəti" },
  { id: 2, patientName: "Rauf Əliyev", patientId: "p2", scheduledTime: "2026-03-06T10:30:00", status: "Pending", notes: "Baş ağrısı" },
  { id: 3, patientName: "Sevinc Hüseynova", patientId: "p3", scheduledTime: "2026-03-07T13:00:00", status: "Pending", notes: "" },
  { id: 4, patientName: "Kamran Babayev", patientId: "p4", scheduledTime: "2026-03-05T15:00:00", status: "Completed", notes: "İlk müayinə" },
  { id: 5, patientName: "Aytən Nəcəfova", patientId: "p5", scheduledTime: "2026-03-04T16:30:00", status: "Cancelled", notes: "Yoxlama" },
];

const STATUS_CONFIG = {
  Pending:   { label: "Gözləyir",    cls: "s-pending",   icon: "⏳" },
  Confirmed: { label: "Təsdiqləndi", cls: "s-confirmed", icon: "✅" },
  Completed: { label: "Tamamlandı",  cls: "s-completed", icon: "🏁" },
  Cancelled: { label: "Ləğv edildi", cls: "s-cancelled", icon: "❌" },
};

const styles = `
  .pg-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; gap: 16px; }
  .pg-header h1 { font-size: 21px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pg-header p { font-size: 13px; color: #5D8AA8; }

  .status-tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
  .tab-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 9px;
    border: 1.5px solid #D6EAF8; background: #fff;
    font-size: 12px; font-weight: 700; color: #5D8AA8;
    cursor: pointer; transition: all 0.18s; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .tab-btn:hover { border-color: #AED6F1; color: #1F618D; }
  .tab-btn.active { border-color: #1F618D; background: #EBF5FB; color: #1F618D; }
  .tab-count {
    background: #D6EAF8; color: #1F618D; font-size: 10px; font-weight: 800;
    padding: 1px 6px; border-radius: 20px;
  }
  .tab-btn.active .tab-count { background: #1F618D; color: #fff; }

  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #D6EAF8;
    border-radius: 9px; padding: 9px 14px; margin-bottom: 18px; max-width: 320px; transition: all 0.2s;
  }
  .search-bar:focus-within { border-color: #1F618D; box-shadow: 0 0 0 3px rgba(31,97,141,0.08); }
  .search-bar input { border: none; background: none; outline: none; font-size: 13px; color: #1A252F; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }
  .search-bar input::placeholder { color: #B0C4D8; }

  .appt-list { display: flex; flex-direction: column; gap: 12px; }
  .appt-card {
    background: #fff; border-radius: 14px; border: 1.5px solid #D6EAF8;
    padding: 16px 20px; display: flex; align-items: center; gap: 16px;
    transition: all 0.2s;
  }
  .appt-card:hover { border-color: #AED6F1; box-shadow: 0 6px 18px rgba(31,97,141,0.08); transform: translateY(-1px); }

  .appt-time-block {
    min-width: 70px; text-align: center;
    background: linear-gradient(135deg, #EBF5FB, #D6EAF8);
    border-radius: 12px; padding: 10px 8px; border: 1px solid #D6EAF8; flex-shrink: 0;
  }
  .atb-date { font-size: 10px; color: #5D8AA8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .atb-time { font-size: 15px; font-weight: 800; color: #1F618D; margin: 3px 0; }
  .atb-day { font-size: 10px; color: #8DAFC4; font-weight: 600; }

  .appt-patient { flex: 1; }
  .ap-name { font-size: 15px; font-weight: 800; color: #154360; margin-bottom: 4px; }
  .ap-note { font-size: 12px; color: #5D8AA8; display: flex; align-items: center; gap: 5px; }

  .appt-actions { display: flex; gap: 8px; align-items: center; }
  .btn-confirm {
    padding: 7px 14px; background: #EAF2F8; border: 1.5px solid #AED6F1;
    border-radius: 8px; color: #1A5276; font-size: 12px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-confirm:hover { background: #D6EAF8; }
  .btn-complete {
    padding: 7px 14px; background: #EBF5FB; border: 1.5px solid #D6EAF8;
    border-radius: 8px; color: #1F618D; font-size: 12px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-complete:hover { background: #D6EAF8; }
  .btn-cancel-appt {
    padding: 7px 10px; background: #FDF2F2; border: 1.5px solid #FADBD8;
    border-radius: 8px; color: #E74C3C; font-size: 12px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-cancel-appt:hover { background: #FADBD8; }

  .s-pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .s-pending   { background: #EAF2F8; color: #D4AC0D; }
  .s-confirmed { background: #EAF2F8; color: #1A5276; }
  .s-completed { background: #EBF5FB; color: #1F618D; }
  .s-cancelled { background: #FDEDEC; color: #E74C3C; }

  .count-badge { display: inline-flex; align-items: center; background: #EBF5FB; border: 1px solid #D6EAF8; color: #1F618D; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 20px; margin-left: 10px; }
  .empty-state { text-align: center; padding: 60px; background: #fff; border-radius: 14px; border: 1.5px dashed #D6EAF8; }
  .empty-state .ei { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 16px; font-weight: 700; color: #154360; margin-bottom: 6px; }
  .empty-state p { font-size: 13px; color: #5D8AA8; }

  .overlay { position: fixed; inset: 0; background: rgba(21,67,96,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; animation: fadeIn 0.18s ease; }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal { background: #fff; border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 24px 64px rgba(21,67,96,0.2); animation: slideUp 0.2s ease; }
  @keyframes slideUp { from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }
  .modal-head { padding: 22px 24px 18px; border-bottom: 1px solid #EBF5FB; display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-size: 17px; font-weight: 800; color: #154360; }
  .modal-x { width: 30px; height: 30px; border-radius: 8px; background: #EBF5FB; border: none; cursor: pointer; font-size: 14px; color: #5D8AA8; display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
  .modal-x:hover { background: #D6EAF8; color: #154360; }
  .modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; }
  .modal-foot { padding: 16px 24px; border-top: 1px solid #EBF5FB; display: flex; gap: 10px; justify-content: flex-end; }
  .fg { display: flex; flex-direction: column; gap: 7px; }
  .fl { font-size: 12px; font-weight: 700; color: #1F618D; letter-spacing: 0.5px; text-transform: uppercase; }
  .fi { padding: 11px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px; font-size: 14px; color: #1A252F; font-family: 'Plus Jakarta Sans', sans-serif; background: #F8FCFF; outline: none; transition: all 0.2s; }
  .fi:focus { border-color: #1F618D; background: #fff; box-shadow: 0 0 0 3px rgba(31,97,141,0.09); }
  .fi::placeholder { color: #B0C4D8; }
  textarea.fi { resize: vertical; min-height: 80px; line-height: 1.5; }
  select.fi { cursor: pointer; }
  .btn-cancel-modal { padding: 10px 18px; background: #EBF5FB; border: 1.5px solid #D6EAF8; border-radius: 9px; color: #1F618D; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s; }
  .btn-cancel-modal:hover { background: #D6EAF8; }
  .btn-primary { display: flex; align-items: center; gap: 7px; padding: 10px 18px; background: linear-gradient(135deg, #1F618D, #2E86C1); color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
  .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #154360, #1F618D); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
  .spin { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

function formatDate(dt) {
  if (!dt) return { date: "—", time: "—", day: "" };
  const d = new Date(dt);
  return {
    date: d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" }),
    time: d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" }),
    day: d.toLocaleDateString("az-AZ", { weekday: "short" }),
  };
}

export default function MyAppointments() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notesModal, setNotesModal] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/Consultation`, { headers: authHeader() });
      setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { setData(mockData); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(data.filter(d => {
      const matchQ = (d.patientName || "").toLowerCase().includes(q) || (d.notes || "").toLowerCase().includes(q);
      const matchTab = activeTab === "all" ? true : (d.status || "").toLowerCase() === activeTab.toLowerCase();
      return matchQ && matchTab;
    }));
  }, [search, activeTab, data]);

  const tabCount = (s) => s === "all" ? data.length : data.filter(d => (d.status || "").toLowerCase() === s.toLowerCase()).length;

  const updateStatus = async (item, newStatus) => {
    try {
      await axios.put(`${API}/api/Consultation`, {
        id: item.id, doctorId: item.doctorId,
        patientId: item.patientId, scheduledDate: item.scheduledTime,
        status: newStatus,
      }, { headers: jsonHeader() });
    } catch { }
    setData(d => d.map(c => c.id === item.id ? { ...c, status: newStatus } : c));
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;
    setSaving(true);
    try {
      await axios.put(`${API}/api/Consultation`, {
        id: notesModal.id, doctorId: notesModal.doctorId,
        patientId: notesModal.patientId, scheduledDate: notesModal.scheduledTime,
        notes,
      }, { headers: jsonHeader() });
    } catch { }
    setData(d => d.map(c => c.id === notesModal.id ? { ...c, notes } : c));
    setSaving(false);
    setNotesModal(null);
  };

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>Randevularım <span className="count-badge">{filtered.length}</span></h1>
          <p>Xəstələrlə bütün görüşləriniz</p>
        </div>
      </div>

      <div className="status-tabs">
        {[
          { key: "all", label: "Hamısı", icon: "📋" },
          { key: "Pending", label: "Gözləyir", icon: "⏳" },
          { key: "Confirmed", label: "Təsdiqləndi", icon: "✅" },
          { key: "Completed", label: "Tamamlandı", icon: "🏁" },
          { key: "Cancelled", label: "Ləğv edildi", icon: "❌" },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label} <span className="tab-count">{tabCount(t.key)}</span>
          </button>
        ))}
      </div>

      <div className="search-bar">
        <span style={{ color: "#B0C4D8", fontSize: 14 }}>🔍</span>
        <input placeholder="Xəstə adı axtar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8" }}>⏳ Yüklənir...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">📅</div>
          <h3>Randevu tapılmadı</h3>
          <p>Bu kateqoriyada randevu yoxdur</p>
        </div>
      ) : (
        <div className="appt-list">
          {filtered.map(item => {
            const dt = formatDate(item.scheduledTime || item.scheduledDate);
            const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
            return (
              <div className="appt-card" key={item.id}>
                <div className="appt-time-block">
                  <div className="atb-date">{dt.date}</div>
                  <div className="atb-time">{dt.time}</div>
                  <div className="atb-day">{dt.day}</div>
                </div>
                <div className="appt-patient">
                  <div className="ap-name">{item.patientName || `Xəstə #${item.patientId}`}</div>
                  <div className="ap-note">
                    {item.notes ? <><span>💬</span>{item.notes}</> : <span style={{ color: "#C5D8E8" }}>Qeyd yoxdur</span>}
                  </div>
                </div>
                <span className={`s-pill ${st.cls}`}>{st.icon} {st.label}</span>
                <div className="appt-actions">
                  {item.status === "Pending" && (
                    <button className="btn-confirm" onClick={() => updateStatus(item, "Confirmed")}>✅ Təsdiqlə</button>
                  )}
                  {item.status === "Confirmed" && (
                    <button className="btn-complete" onClick={() => updateStatus(item, "Completed")}>🏁 Tamamla</button>
                  )}
                  {(item.status === "Pending" || item.status === "Confirmed") && (
                    <button className="btn-cancel-appt" onClick={() => updateStatus(item, "Cancelled")}>✕</button>
                  )}
                  <button className="btn-complete" onClick={() => { setNotesModal(item); setNotes(item.notes || ""); }}>📝</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notesModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setNotesModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">📝 Qeydlər — {notesModal.patientName}</div>
              <button className="modal-x" onClick={() => setNotesModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg">
                <label className="fl">Qeydlər</label>
                <textarea className="fi" rows={4} placeholder="Xəstə haqqında qeydlər..." value={notes} onChange={e => setNotes(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel-modal" onClick={() => setNotesModal(null)}>Ləğv et</button>
              <button className="btn-primary" onClick={handleSaveNotes} disabled={saving}>
                {saving ? <><span className="spin" /> Saxlanır...</> : "Saxla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}