import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockData = [
  { id: 1, doctorId: 1, doctorName: "Dr. Əli Həsənov", patientId: "p1", patientName: "Nigar Məmmədova", scheduledTime: "2026-03-10T10:00:00", notes: "Ürək ağrısı şikayəti", status: "Pending" },
  { id: 2, doctorId: 2, doctorName: "Dr. Günel Quliyeva", patientId: "p2", patientName: "Rauf Əliyev", scheduledTime: "2026-03-11T14:30:00", notes: "Baş ağrısı", status: "Confirmed" },
  { id: 3, doctorId: 3, doctorName: "Dr. Tural İsmayılov", patientId: "p3", patientName: "Sevinc Hüseynova", scheduledTime: "2026-03-08T09:00:00", notes: "", status: "Completed" },
  { id: 4, doctorId: 1, doctorName: "Dr. Əli Həsənov", patientId: "p4", patientName: "Kamran Babayev", scheduledTime: "2026-03-07T16:00:00", notes: "Yoxlama", status: "Cancelled" },
  { id: 5, doctorId: 2, doctorName: "Dr. Günel Quliyeva", patientId: "p5", patientName: "Aytən Nəcəfova", scheduledTime: "2026-03-12T11:00:00", notes: "İlk müayinə", status: "Pending" },
];

const mockDoctors = [
  { id: 1, name: "Dr. Əli Həsənov" },
  { id: 2, name: "Dr. Günel Quliyeva" },
  { id: 3, name: "Dr. Tural İsmayılov" },
];

const STATUS_CONFIG = {
  Pending:   { label: "Gözləyir",     cls: "s-pending",   icon: "⏳" },
  Confirmed: { label: "Təsdiqləndi",  cls: "s-confirmed", icon: "✅" },
  Completed: { label: "Tamamlandı",   cls: "s-completed", icon: "🏁" },
  Cancelled: { label: "Ləğv edildi",  cls: "s-cancelled", icon: "❌" },
};

const styles = `
  .pg-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 22px; gap: 16px;
  }
  .pg-header h1 { font-size: 21px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pg-header p { font-size: 13px; color: #5D8AA8; }

  .btn-primary {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 18px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    color: #fff; border: none; border-radius: 9px;
    font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #154360, #1F618D);
    transform: translateY(-1px); box-shadow: 0 6px 16px rgba(31,97,141,0.25);
  }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  /* STATUS TABS */
  .status-tabs {
    display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap;
  }
  .tab-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 9px;
    border: 1.5px solid #D6EAF8; background: #fff;
    font-size: 12px; font-weight: 700; color: #5D8AA8;
    cursor: pointer; transition: all 0.18s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .tab-btn:hover { border-color: #AED6F1; color: #1F618D; }
  .tab-btn.active { border-color: #1F618D; background: #EBF5FB; color: #1F618D; }
  .tab-count {
    background: #D6EAF8; color: #1F618D;
    font-size: 10px; font-weight: 800;
    padding: 1px 6px; border-radius: 20px;
  }
  .tab-btn.active .tab-count { background: #1F618D; color: #fff; }

  .toolbar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;
  }
  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #D6EAF8;
    border-radius: 9px; padding: 9px 14px; flex: 1; max-width: 300px; transition: all 0.2s;
  }
  .search-bar:focus-within { border-color: #1F618D; box-shadow: 0 0 0 3px rgba(31,97,141,0.08); }
  .search-bar input {
    border: none; background: none; outline: none;
    font-size: 13px; color: #1A252F; width: 100%;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .search-bar input::placeholder { color: #B0C4D8; }
  .filter-select {
    padding: 9px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px;
    background: #fff; font-size: 13px; color: #1A252F;
    font-family: 'Plus Jakarta Sans', sans-serif; outline: none; cursor: pointer;
  }
  .filter-select:focus { border-color: #1F618D; }

  /* KART GRİD */
  .con-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 14px;
  }
  .con-card {
    background: #fff; border-radius: 14px;
    border: 1.5px solid #D6EAF8; overflow: hidden;
    transition: all 0.2s;
  }
  .con-card:hover {
    border-color: #AED6F1; transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(31,97,141,0.08);
  }
  .con-card-head {
    padding: 16px 18px 14px;
    background: linear-gradient(135deg, #F8FCFF, #EBF5FB);
    border-bottom: 1px solid #D6EAF8;
    display: flex; align-items: center; justify-content: space-between;
  }
  .con-id { font-size: 11px; color: #8DAFC4; font-weight: 700; }
  .con-card-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
  .con-row { display: flex; align-items: flex-start; gap: 9px; font-size: 13px; }
  .con-row-icon { font-size: 15px; width: 20px; flex-shrink: 0; margin-top: 1px; }
  .con-row-label { color: #5D8AA8; font-size: 11px; font-weight: 600; margin-bottom: 1px; }
  .con-row-val { color: #1A252F; font-weight: 600; }
  .con-notes {
    background: #F8FCFF; border-radius: 8px; padding: 9px 12px;
    font-size: 12px; color: #5D8AA8; line-height: 1.5;
    border: 1px solid #EBF5FB;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .con-actions {
    padding: 12px 18px; border-top: 1px solid #EBF5FB;
    display: flex; gap: 8px;
  }
  .btn-edit {
    flex: 1; padding: 8px;
    background: #EBF5FB; border: 1.5px solid #D6EAF8;
    border-radius: 8px; color: #1F618D;
    font-size: 12px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .btn-edit:hover { background: #D6EAF8; }
  .btn-del {
    padding: 8px 13px;
    background: #FDF2F2; border: 1.5px solid #FADBD8;
    border-radius: 8px; color: #E74C3C; font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.18s;
  }
  .btn-del:hover { background: #FADBD8; }

  /* STATUS PİLL */
  .s-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
  }
  .s-pending   { background: #FEF9E7; color: #D4AC0D; }
  .s-confirmed { background: #E8FAF8; color: #17A589; }
  .s-completed { background: #EBF5FB; color: #1F618D; }
  .s-cancelled { background: #FDEDEC; color: #E74C3C; }

  .count-badge {
    display: inline-flex; align-items: center;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    color: #1F618D; font-size: 12px; font-weight: 700;
    padding: 2px 10px; border-radius: 20px; margin-left: 10px;
  }
  .empty-state {
    text-align: center; padding: 60px;
    background: #fff; border-radius: 14px; border: 1.5px dashed #D6EAF8;
  }
  .empty-state .ei { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 16px; font-weight: 700; color: #154360; margin-bottom: 6px; }
  .empty-state p { font-size: 13px; color: #5D8AA8; }

  /* MODAL */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(21,67,96,0.45); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 999; padding: 20px; animation: fadeIn 0.18s ease; overflow-y: auto;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal {
    background: #fff; border-radius: 16px;
    width: 100%; max-width: 500px;
    box-shadow: 0 24px 64px rgba(21,67,96,0.2);
    animation: slideUp 0.2s ease; margin: auto;
  }
  @keyframes slideUp { from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }
  .modal-head {
    padding: 22px 24px 18px; border-bottom: 1px solid #EBF5FB;
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-title { font-size: 17px; font-weight: 800; color: #154360; }
  .modal-x {
    width: 30px; height: 30px; border-radius: 8px;
    background: #EBF5FB; border: none; cursor: pointer;
    font-size: 14px; color: #5D8AA8;
    display: flex; align-items: center; justify-content: center; transition: all 0.18s;
  }
  .modal-x:hover { background: #D6EAF8; color: #154360; }
  .modal-body {
    padding: 22px 24px; display: flex; flex-direction: column; gap: 14px;
    max-height: 60vh; overflow-y: auto;
  }
  .modal-foot {
    padding: 16px 24px; border-top: 1px solid #EBF5FB;
    display: flex; gap: 10px; justify-content: flex-end;
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .fg { display: flex; flex-direction: column; gap: 7px; }
  .fl { font-size: 12px; font-weight: 700; color: #1F618D; letter-spacing: 0.5px; text-transform: uppercase; }
  .fi {
    padding: 11px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px;
    font-size: 14px; color: #1A252F;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F8FCFF; outline: none; transition: all 0.2s;
  }
  .fi:focus { border-color: #1F618D; background: #fff; box-shadow: 0 0 0 3px rgba(31,97,141,0.09); }
  .fi::placeholder { color: #B0C4D8; }
  textarea.fi { resize: vertical; min-height: 80px; line-height: 1.5; }
  select.fi { cursor: pointer; }
  .btn-cancel {
    padding: 10px 18px; background: #EBF5FB; border: 1.5px solid #D6EAF8; border-radius: 9px;
    color: #1F618D; font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-cancel:hover { background: #D6EAF8; }
  .err-msg {
    background: #FDF2F2; border: 1px solid #FADBD8; color: #C0392B;
    padding: 10px 14px; border-radius: 8px; font-size: 13px;
  }

  .confirm-box {
    background: #fff; border-radius: 14px; padding: 28px;
    max-width: 360px; width: 100%; text-align: center;
    box-shadow: 0 24px 64px rgba(21,67,96,0.2); animation: slideUp 0.2s ease;
  }
  .confirm-box .ci { font-size: 40px; margin-bottom: 12px; }
  .confirm-box h3 { font-size: 17px; font-weight: 800; color: #154360; margin-bottom: 8px; }
  .confirm-box p { font-size: 13px; color: #5D8AA8; margin-bottom: 22px; line-height: 1.6; }
  .confirm-btns { display: flex; gap: 10px; }
  .btn-del-confirm {
    flex: 1; padding: 11px;
    background: linear-gradient(135deg, #E74C3C, #C0392B);
    color: #fff; border: none; border-radius: 9px;
    font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .btn-del-confirm:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .btn-del-confirm:disabled { opacity: 0.7; cursor: not-allowed; }
  .spin {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const emptyForm = { doctorId: "", scheduledTime: "", notes: "" };

export default function ConsultationPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [conRes, docRes] = await Promise.all([
        axios.get(`${API}/api/Consultation`, { headers: authHeader() }),
        axios.get(`${API}/api/Doctor`, { headers: authHeader() }),
      ]);
      setData(Array.isArray(conRes.data) ? conRes.data : conRes.data?.data || []);
      setDoctors(Array.isArray(docRes.data) ? docRes.data : docRes.data?.data || []);
    } catch {
      setData(mockData);
      setDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(data.filter(d => {
      const matchQ =
        (d.doctorName || "").toLowerCase().includes(q) ||
        (d.patientName || "").toLowerCase().includes(q) ||
        (d.notes || "").toLowerCase().includes(q);
      const matchTab = activeTab === "all" ? true : (d.status || "").toLowerCase() === activeTab.toLowerCase();
      return matchQ && matchTab;
    }));
  }, [search, activeTab, data]);

  const tabCounts = (status) =>
    status === "all" ? data.length : data.filter(d => (d.status || "").toLowerCase() === status.toLowerCase()).length;

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setError(""); setModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      doctorId: String(item.doctorId || ""),
      scheduledTime: item.scheduledTime ? item.scheduledTime.substring(0, 16) : "",
      notes: item.notes || "",
    });
    setError(""); setModal(true);
  };
  const closeModal = () => { setModal(false); setError(""); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.doctorId) { setError("Həkim seçilməlidir."); return; }
    if (!form.scheduledTime) { setError("Tarix və saat seçilməlidir."); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        doctorId: Number(form.doctorId),
        scheduledTime: new Date(form.scheduledTime).toISOString(),
        notes: form.notes,
      };
      if (editItem) {
        await axios.put(`${API}/api/Consultation`, {
          id: editItem.id,
          doctorId: Number(form.doctorId),
          patientId: editItem.patientId || "",
          scheduledDate: new Date(form.scheduledTime).toISOString(),
        }, { headers: { ...authHeader(), "Content-Type": "application/json" } });
      } else {
        await axios.post(`${API}/api/Consultation`, payload,
          { headers: { ...authHeader(), "Content-Type": "application/json" } });
      }
      await fetchAll();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/Consultation/SoftDelete/${deleteTarget.id}`, { headers: authHeader() });
      await fetchAll();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    const d = new Date(dt);
    return d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" })
      + " " + d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
  };

  const getDoctorName = (item) =>
    item.doctorName ||
    doctors.find(d => d.id === item.doctorId)?.name ||
    `Həkim #${item.doctorId}`;

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>Konsultasiyalar <span className="count-badge">{filtered.length}</span></h1>
          <p>Bütün konsultasiyaları idarə edin</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>＋ Yeni Konsultasiya</button>
      </div>

      {/* STATUS TABLAR */}
      <div className="status-tabs">
        {[
          { key: "all", label: "Hamısı", icon: "📋" },
          { key: "Pending", label: "Gözləyir", icon: "⏳" },
          { key: "Confirmed", label: "Təsdiqləndi", icon: "✅" },
          { key: "Completed", label: "Tamamlandı", icon: "🏁" },
          { key: "Cancelled", label: "Ləğv edildi", icon: "❌" },
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
            <span className="tab-count">{tabCounts(t.key)}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <span style={{ color: "#B0C4D8", fontSize: 14 }}>🔍</span>
          <input
            placeholder="Həkim, xəstə axtar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value="" onChange={e => { }}>
          <option value="">Bütün həkimlər</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name || `Həkim #${d.id}`}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8", fontSize: 14 }}>⏳ Yüklənir...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">🩺</div>
          <h3>Konsultasiya tapılmadı</h3>
          <p>Yeni konsultasiya əlavə etmək üçün yuxarıdakı düyməyə klikləyin</p>
        </div>
      ) : (
        <div className="con-grid">
          {filtered.map(item => {
            const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
            return (
              <div className="con-card" key={item.id}>
                <div className="con-card-head">
                  <span className="con-id">#{item.id}</span>
                  <span className={`s-pill ${st.cls}`}>{st.icon} {st.label}</span>
                </div>
                <div className="con-card-body">
                  <div className="con-row">
                    <span className="con-row-icon">👨‍⚕️</span>
                    <div>
                      <div className="con-row-label">Həkim</div>
                      <div className="con-row-val">{getDoctorName(item)}</div>
                    </div>
                  </div>
                  <div className="con-row">
                    <span className="con-row-icon">🧑</span>
                    <div>
                      <div className="con-row-label">Xəstə</div>
                      <div className="con-row-val">{item.patientName || item.patientId || "—"}</div>
                    </div>
                  </div>
                  <div className="con-row">
                    <span className="con-row-icon">📅</span>
                    <div>
                      <div className="con-row-label">Tarix & Saat</div>
                      <div className="con-row-val">{formatDate(item.scheduledTime || item.scheduledDate)}</div>
                    </div>
                  </div>
                  {item.notes && (
                    <div className="con-notes">💬 {item.notes}</div>
                  )}
                </div>
                <div className="con-actions">
                  <button className="btn-edit" onClick={() => openEdit(item)}>✏️ Redaktə et</button>
                  <button className="btn-del" onClick={() => setDeleteTarget(item)}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">{editItem ? "✏️ Konsultasiyanı Redaktə Et" : "＋ Yeni Konsultasiya"}</div>
              <button className="modal-x" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="err-msg">⚠️ {error}</div>}

              <div className="fg">
                <label className="fl">Həkim *</label>
                <select className="fi" value={form.doctorId} onChange={e => set("doctorId", e.target.value)}>
                  <option value="">Həkim seçin...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={String(d.id)}>{d.name || d.appUserName || `Həkim #${d.id}`}</option>
                  ))}
                </select>
              </div>

              <div className="fg">
                <label className="fl">Tarix və Saat *</label>
                <input className="fi" type="datetime-local"
                  value={form.scheduledTime}
                  onChange={e => set("scheduledTime", e.target.value)} />
              </div>

              <div className="fg">
                <label className="fl">Qeydlər</label>
                <textarea className="fi" rows={3}
                  placeholder="Xəstənin şikayəti və ya qeydlər..."
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel" onClick={closeModal}>Ləğv et</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spin" /> Saxlanır...</> : (editItem ? "Yenilə" : "Əlavə et")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SİLMƏ TƏSDİQİ */}
      {deleteTarget && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="confirm-box">
            <div className="ci">🗑️</div>
            <h3>Silinsin?</h3>
            <p>
              <strong>#{deleteTarget.id}</strong> nömrəli konsultasiya silinəcək.<br />
              Bu əməliyyat geri alına bilər.
            </p>
            <div className="confirm-btns">
              <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>Ləğv et</button>
              <button className="btn-del-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spin" /> : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
