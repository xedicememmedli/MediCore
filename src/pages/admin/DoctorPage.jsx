import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockDoctors = [
  { id: 1, appUserId: "u1", specialtyId: 1, specialtyName: "Kardioloqiya", consultationFee: 50, experience: "10 il", education: "Bakı Dövlət Universiteti", workingHours: "09:00 - 18:00", biography: "Ürək xəstəlikləri üzrə mütəxəssis." },
  { id: 2, appUserId: "u2", specialtyId: 2, specialtyName: "Nevrologiya", consultationFee: 60, experience: "8 il", education: "Tibb Universiteti", workingHours: "10:00 - 17:00", biography: "Sinir sistemi üzrə həkim." },
  { id: 3, appUserId: "u3", specialtyId: 3, specialtyName: "Ortopediya", consultationFee: 70, experience: "15 il", education: "ADU Tibb fakültəsi", workingHours: "08:00 - 16:00", biography: "Sümük və oynaq xəstəlikləri." },
];

const mockSpecialties = [
  { id: 1, name: "Kardioloqiya" },
  { id: 2, name: "Nevrologiya" },
  { id: 3, name: "Ortopediya" },
  { id: 4, name: "Dərmatologiya" },
  { id: 5, name: "Pediatriya" },
];

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

  .toolbar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;
  }
  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #D6EAF8;
    border-radius: 9px; padding: 9px 14px; flex: 1; max-width: 320px; transition: all 0.2s;
  }
  .search-bar:focus-within { border-color: #1F618D; box-shadow: 0 0 0 3px rgba(31,97,141,0.08); }
  .search-bar input {
    border: none; background: none; outline: none;
    font-size: 13px; color: #1A252F; width: 100%;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .search-bar input::placeholder { color: #B0C4D8; }

  .filter-select {
    padding: 9px 14px;
    border: 1.5px solid #D6EAF8; border-radius: 9px;
    background: #fff; font-size: 13px; color: #1A252F;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; cursor: pointer; transition: all 0.2s;
  }
  .filter-select:focus { border-color: #1F618D; }

  .doc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .doc-card {
    background: #fff; border-radius: 14px;
    border: 1.5px solid #D6EAF8; overflow: hidden;
    transition: all 0.2s;
  }
  .doc-card:hover {
    border-color: #AED6F1; transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(31,97,141,0.1);
  }
  .doc-card-top {
    padding: 20px 20px 16px;
    background: linear-gradient(135deg, #EBF5FB, #F8FCFF);
    border-bottom: 1px solid #D6EAF8;
    display: flex; align-items: flex-start; gap: 14px;
  }
  .doc-avatar {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: #fff; flex-shrink: 0;
    font-weight: 800;
  }
  .doc-name { font-size: 15px; font-weight: 800; color: #154360; margin-bottom: 4px; }
  .doc-specialty {
    display: inline-flex; align-items: center; gap: 5px;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    color: #1F618D; font-size: 11px; font-weight: 700;
    padding: 2px 9px; border-radius: 20px;
  }
  .doc-card-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
  .doc-info-row {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: #5D8AA8;
  }
  .doc-info-row span:first-child { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
  .doc-info-row strong { color: #1A252F; font-weight: 600; }
  .doc-fee {
    display: flex; align-items: center; justify-content: space-between;
    background: #EBF5FB; border-radius: 8px; padding: 9px 12px;
  }
  .doc-fee-label { font-size: 11px; color: #5D8AA8; font-weight: 600; }
  .doc-fee-val { font-size: 16px; font-weight: 800; color: #1F618D; }
  .doc-actions {
    padding: 14px 20px; border-top: 1px solid #EBF5FB;
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
  .btn-edit:hover { background: #D6EAF8; border-color: #AED6F1; }
  .btn-del {
    padding: 8px 13px;
    background: #FDF2F2; border: 1.5px solid #FADBD8;
    border-radius: 8px; color: #E74C3C; font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.18s;
  }
  .btn-del:hover { background: #FADBD8; }

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
    z-index: 999; padding: 20px; animation: fadeIn 0.18s ease;
    overflow-y: auto;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal {
    background: #fff; border-radius: 16px;
    width: 100%; max-width: 540px;
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
  .modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; max-height: 65vh; overflow-y: auto; }
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
    padding: 10px 18px;
    background: #EBF5FB; border: 1.5px solid #D6EAF8; border-radius: 9px;
    color: #1F618D; font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-cancel:hover { background: #D6EAF8; }
  .err-msg {
    background: #FDF2F2; border: 1px solid #FADBD8; color: #C0392B;
    padding: 10px 14px; border-radius: 8px; font-size: 13px;
  }

  /* SİLMƏ */
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

const emptyForm = {
  appUserId: "", specialtyId: "", consultationFee: "",
  experience: "", education: "", workingHours: "", biography: ""
};

export default function DoctorPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [search, setSearch] = useState("");
  const [filterSpec, setFilterSpec] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // ── VERİ ÇƏK ─────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [docRes, specRes] = await Promise.all([
        axios.get(`${API}/api/Doctor`, { headers: authHeader() }),
        axios.get(`${API}/api/Specialty`, { headers: authHeader() }),
      ]);
      const docs = Array.isArray(docRes.data) ? docRes.data : docRes.data?.data || [];
      const specs = Array.isArray(specRes.data) ? specRes.data : specRes.data?.data || [];
      setData(docs);
      setSpecialties(specs);
    } catch {
      setData(mockDoctors);
      setSpecialties(mockSpecialties);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── FİLTER ───────────────────────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(data.filter(d => {
      const matchSearch =
        (d.appUserName || d.name || "").toLowerCase().includes(q) ||
        (d.specialtyName || "").toLowerCase().includes(q) ||
        (d.experience || "").toLowerCase().includes(q);
      const matchSpec = filterSpec ? String(d.specialtyId) === filterSpec : true;
      return matchSearch && matchSpec;
    }));
  }, [search, filterSpec, data]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setError(""); setModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      appUserId: item.appUserId || "",
      specialtyId: String(item.specialtyId || ""),
      consultationFee: String(item.consultationFee || ""),
      experience: item.experience || "",
      education: item.education || "",
      workingHours: item.workingHours || "",
      biography: item.biography || "",
    });
    setError(""); setModal(true);
  };
  const closeModal = () => { setModal(false); setError(""); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── SAXLA ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.specialtyId) { setError("İxtisas seçilməlidir."); return; }
    if (!form.consultationFee) { setError("Konsultasiya haqqı daxil edilməlidir."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      fd.append("AppUserId", form.appUserId);
      fd.append("SpecialtyId", form.specialtyId);
      fd.append("ConsultationFee", form.consultationFee);
      fd.append("Experience", form.experience);
      fd.append("Education", form.education);
      fd.append("WorkingHours", form.workingHours);
      fd.append("Biography", form.biography);
      if (editItem) {
        fd.append("Id", editItem.id);
        await axios.put(`${API}/api/Doctor`, fd, { headers: authHeader() });
      } else {
        await axios.post(`${API}/api/Doctor`, fd, { headers: authHeader() });
      }
      await fetchAll();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  };

  // ── SİL ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/Doctor/${deleteTarget.id}`, { headers: authHeader() });
      await fetchAll();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Həkimin adının baş hərfini al
  const getInitial = (item) => {
    const name = item.appUserName || item.name || "H";
    return name[0]?.toUpperCase();
  };

  const getSpecName = (item) =>
    item.specialtyName ||
    specialties.find(s => s.id === item.specialtyId)?.name ||
    "—";

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>Həkimlər <span className="count-badge">{filtered.length}</span></h1>
          <p>Bütün həkimləri idarə edin</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>＋ Yeni Həkim</button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <span style={{ color: "#B0C4D8", fontSize: 14 }}>🔍</span>
          <input
            placeholder="Həkim axtar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterSpec}
          onChange={e => setFilterSpec(e.target.value)}
        >
          <option value="">Bütün ixtisaslar</option>
          {specialties.map(s => (
            <option key={s.id} value={String(s.id)}>{s.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8", fontSize: 14 }}>⏳ Yüklənir...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">👨‍⚕️</div>
          <h3>Həkim tapılmadı</h3>
          <p>Yeni həkim əlavə etmək üçün yuxarıdakı düyməyə klikləyin</p>
        </div>
      ) : (
        <div className="doc-grid">
          {filtered.map(item => (
            <div className="doc-card" key={item.id}>
              <div className="doc-card-top">
                <div className="doc-avatar">{getInitial(item)}</div>
                <div>
                  <div className="doc-name">{item.appUserName || item.name || `Həkim #${item.id}`}</div>
                  <div className="doc-specialty">⚕️ {getSpecName(item)}</div>
                </div>
              </div>
              <div className="doc-card-body">
                <div className="doc-fee">
                  <span className="doc-fee-label">Konsultasiya haqqı</span>
                  <span className="doc-fee-val">{item.consultationFee} ₼</span>
                </div>
                {item.experience && (
                  <div className="doc-info-row">
                    <span>🏅</span>
                    <span>Təcrübə: <strong>{item.experience}</strong></span>
                  </div>
                )}
                {item.workingHours && (
                  <div className="doc-info-row">
                    <span>🕐</span>
                    <span>İş saatları: <strong>{item.workingHours}</strong></span>
                  </div>
                )}
                {item.education && (
                  <div className="doc-info-row">
                    <span>🎓</span>
                    <span>{item.education}</span>
                  </div>
                )}
              </div>
              <div className="doc-actions">
                <button className="btn-edit" onClick={() => openEdit(item)}>✏️ Redaktə et</button>
                <button className="btn-del" onClick={() => setDeleteTarget(item)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">{editItem ? "✏️ Həkimi Redaktə Et" : "＋ Yeni Həkim"}</div>
              <button className="modal-x" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="err-msg">⚠️ {error}</div>}

              <div className="fg">
                <label className="fl">İstifadəçi ID (AppUserId)</label>
                <input
                  className="fi" placeholder="İstifadəçinin ID-si"
                  value={form.appUserId}
                  onChange={e => set("appUserId", e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="fg">
                  <label className="fl">İxtisas *</label>
                  <select className="fi" value={form.specialtyId} onChange={e => set("specialtyId", e.target.value)}>
                    <option value="">Seçin...</option>
                    {specialties.map(s => (
                      <option key={s.id} value={String(s.id)}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">Konsultasiya Haqqı (₼) *</label>
                  <input
                    className="fi" type="number" placeholder="50"
                    value={form.consultationFee}
                    onChange={e => set("consultationFee", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="fg">
                  <label className="fl">Təcrübə</label>
                  <input
                    className="fi" placeholder="Məs: 10 il"
                    value={form.experience}
                    onChange={e => set("experience", e.target.value)}
                  />
                </div>
                <div className="fg">
                  <label className="fl">İş Saatları</label>
                  <input
                    className="fi" placeholder="09:00 - 18:00"
                    value={form.workingHours}
                    onChange={e => set("workingHours", e.target.value)}
                  />
                </div>
              </div>

              <div className="fg">
                <label className="fl">Təhsil</label>
                <input
                  className="fi" placeholder="Universitet adı"
                  value={form.education}
                  onChange={e => set("education", e.target.value)}
                />
              </div>

              <div className="fg">
                <label className="fl">Bioqrafiya</label>
                <textarea
                  className="fi" rows={3}
                  placeholder="Həkim haqqında qısa məlumat..."
                  value={form.biography}
                  onChange={e => set("biography", e.target.value)}
                />
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
              <strong>"{deleteTarget.appUserName || deleteTarget.name || `Həkim #${deleteTarget.id}`}"</strong> silinəcək.<br />
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
