import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockData = [
  { id: 1, appUserId: "u1", appUserName: "Vüsal Məmmədov", vehicleType: "Motosiklet", vehiclePlateNumber: "10-AB-001" },
  { id: 2, appUserId: "u2", appUserName: "Elnur Hüseynov", vehicleType: "Avtomobil", vehiclePlateNumber: "77-CD-234" },
  { id: 3, appUserId: "u3", appUserName: "Rəşad Quliyev", vehicleType: "Velosiped", vehiclePlateNumber: "—" },
];

const VEHICLE_TYPES = ["Motosiklet", "Avtomobil", "Velosiped", "Yük maşını", "Digər"];
const VEHICLE_ICONS = { "Motosiklet": "🏍️", "Avtomobil": "🚗", "Velosiped": "🚲", "Yük maşını": "🚛", "Digər": "🚚" };

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

  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #D6EAF8;
    border-radius: 9px; padding: 9px 14px;
    margin-bottom: 18px; max-width: 320px; transition: all 0.2s;
  }
  .search-bar:focus-within { border-color: #1F618D; box-shadow: 0 0 0 3px rgba(31,97,141,0.08); }
  .search-bar input {
    border: none; background: none; outline: none;
    font-size: 13px; color: #1A252F; width: 100%;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .search-bar input::placeholder { color: #B0C4D8; }

  .courier-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 14px;
  }
  .courier-card {
    background: #fff; border-radius: 14px;
    border: 1.5px solid #D6EAF8; overflow: hidden;
    transition: all 0.2s;
  }
  .courier-card:hover {
    border-color: #AED6F1; transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(31,97,141,0.08);
  }
  .courier-card-top {
    padding: 18px 20px 14px;
    background: linear-gradient(135deg, #F8FCFF, #EBF5FB);
    border-bottom: 1px solid #D6EAF8;
    display: flex; align-items: center; gap: 14px;
  }
  .courier-avatar {
    width: 48px; height: 48px; border-radius: 14px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; color: #fff; font-weight: 800; flex-shrink: 0;
  }
  .courier-name { font-size: 15px; font-weight: 800; color: #154360; margin-bottom: 4px; }
  .courier-id { font-size: 11px; color: #8DAFC4; }
  .courier-card-body { padding: 14px 20px; display: flex; flex-direction: column; gap: 10px; }
  .courier-info-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; background: #F8FCFF;
    border-radius: 9px; border: 1px solid #EBF5FB;
  }
  .ci-icon { font-size: 18px; flex-shrink: 0; }
  .ci-label { font-size: 11px; color: #5D8AA8; font-weight: 600; margin-bottom: 1px; }
  .ci-val { font-size: 13px; font-weight: 700; color: #1A252F; }
  .courier-actions {
    padding: 12px 20px; border-top: 1px solid #EBF5FB;
    display: flex; gap: 8px;
  }
  .btn-edit {
    flex: 1; padding: 8px;
    background: #EBF5FB; border: 1.5px solid #D6EAF8;
    border-radius: 8px; color: #1F618D; font-size: 12px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .btn-edit:hover { background: #D6EAF8; }
  .btn-del {
    padding: 8px 13px;
    background: #FDF2F2; border: 1.5px solid #FADBD8;
    border-radius: 8px; color: #E74C3C; font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
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

  .overlay {
    position: fixed; inset: 0;
    background: rgba(21,67,96,0.45); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 999; padding: 20px; animation: fadeIn 0.18s ease;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal {
    background: #fff; border-radius: 16px; width: 100%; max-width: 460px;
    box-shadow: 0 24px 64px rgba(21,67,96,0.2); animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }
  .modal-head {
    padding: 22px 24px 18px; border-bottom: 1px solid #EBF5FB;
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-title { font-size: 17px; font-weight: 800; color: #154360; }
  .modal-x {
    width: 30px; height: 30px; border-radius: 8px; background: #EBF5FB;
    border: none; cursor: pointer; font-size: 14px; color: #5D8AA8;
    display: flex; align-items: center; justify-content: center; transition: all 0.18s;
  }
  .modal-x:hover { background: #D6EAF8; color: #154360; }
  .modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; }
  .modal-foot { padding: 16px 24px; border-top: 1px solid #EBF5FB; display: flex; gap: 10px; justify-content: flex-end; }
  .fg { display: flex; flex-direction: column; gap: 7px; }
  .fl { font-size: 12px; font-weight: 700; color: #1F618D; letter-spacing: 0.5px; text-transform: uppercase; }
  .fi {
    padding: 11px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px;
    font-size: 14px; color: #1A252F; font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F8FCFF; outline: none; transition: all 0.2s;
  }
  .fi:focus { border-color: #1F618D; background: #fff; box-shadow: 0 0 0 3px rgba(31,97,141,0.09); }
  .fi::placeholder { color: #B0C4D8; }
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
    color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .btn-del-confirm:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .btn-del-confirm:disabled { opacity: 0.7; cursor: not-allowed; }
  .spin {
    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const emptyForm = { appUserId: "", vehicleType: "Motosiklet", vehiclePlateNumber: "" };

export default function CourierPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/Courier`, { headers: authHeader() });
      setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { setData(mockData); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(data.filter(d =>
      (d.appUserName || "").toLowerCase().includes(q) ||
      (d.vehicleType || "").toLowerCase().includes(q) ||
      (d.vehiclePlateNumber || "").toLowerCase().includes(q)
    ));
  }, [search, data]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setError(""); setModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ appUserId: item.appUserId || "", vehicleType: item.vehicleType || "Motosiklet", vehiclePlateNumber: item.vehiclePlateNumber || "" });
    setError(""); setModal(true);
  };
  const closeModal = () => { setModal(false); setError(""); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.vehicleType) { setError("Nəqliyyat növü seçin."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      fd.append("AppUserId", form.appUserId);
      fd.append("VehicleType", form.vehicleType);
      fd.append("VehiclePlateNumber", form.vehiclePlateNumber);
      if (editItem) {
        fd.append("Id", editItem.id);
        await axios.put(`${API}/api/Courier`, fd, { headers: authHeader() });
      } else {
        await axios.post(`${API}/api/Courier`, fd, { headers: authHeader() });
      }
      await fetchData(); closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Xəta baş verdi.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/Courier/${deleteTarget.id}`, { headers: authHeader() });
      await fetchData(); setDeleteTarget(null);
    } catch { setDeleteTarget(null); }
    finally { setDeleting(false); }
  };

  const getInitial = (item) => (item.appUserName || "K")[0]?.toUpperCase();

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>Kuryerlər <span className="count-badge">{filtered.length}</span></h1>
          <p>Çatdırılma kuryer heyətini idarə edin</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>＋ Yeni Kuryer</button>
      </div>

      <div className="search-bar">
        <span style={{ color: "#B0C4D8", fontSize: 14 }}>🔍</span>
        <input placeholder="Kuryer axtar..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8" }}>⏳ Yüklənir...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">🚚</div>
          <h3>Kuryer tapılmadı</h3>
          <p>Yeni kuryer əlavə etmək üçün yuxarıdakı düyməyə klikləyin</p>
        </div>
      ) : (
        <div className="courier-grid">
          {filtered.map(item => (
            <div className="courier-card" key={item.id}>
              <div className="courier-card-top">
                <div className="courier-avatar">{getInitial(item)}</div>
                <div>
                  <div className="courier-name">{item.appUserName || `Kuryer #${item.id}`}</div>
                  <div className="courier-id">ID: {item.appUserId || "—"}</div>
                </div>
              </div>
              <div className="courier-card-body">
                <div className="courier-info-row">
                  <span className="ci-icon">{VEHICLE_ICONS[item.vehicleType] || "🚚"}</span>
                  <div>
                    <div className="ci-label">Nəqliyyat növü</div>
                    <div className="ci-val">{item.vehicleType || "—"}</div>
                  </div>
                </div>
                <div className="courier-info-row">
                  <span className="ci-icon">🔢</span>
                  <div>
                    <div className="ci-label">Nömrə nişanı</div>
                    <div className="ci-val">{item.vehiclePlateNumber || "—"}</div>
                  </div>
                </div>
              </div>
              <div className="courier-actions">
                <button className="btn-edit" onClick={() => openEdit(item)}>✏️ Redaktə et</button>
                <button className="btn-del" onClick={() => setDeleteTarget(item)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">{editItem ? "✏️ Kuryeri Redaktə Et" : "＋ Yeni Kuryer"}</div>
              <button className="modal-x" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="err-msg">⚠️ {error}</div>}
              <div className="fg">
                <label className="fl">İstifadəçi ID (AppUserId)</label>
                <input className="fi" placeholder="İstifadəçi ID-si" value={form.appUserId}
                  onChange={e => set("appUserId", e.target.value)} autoFocus />
              </div>
              <div className="fg">
                <label className="fl">Nəqliyyat növü *</label>
                <select className="fi" value={form.vehicleType} onChange={e => set("vehicleType", e.target.value)}>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{VEHICLE_ICONS[t]} {t}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Nömrə nişanı</label>
                <input className="fi" placeholder="Məs: 10-AB-001" value={form.vehiclePlateNumber}
                  onChange={e => set("vehiclePlateNumber", e.target.value)} />
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

      {deleteTarget && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="confirm-box">
            <div className="ci">🗑️</div>
            <h3>Silinsin?</h3>
            <p><strong>"{deleteTarget.appUserName || `Kuryer #${deleteTarget.id}`}"</strong> silinəcək.</p>
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
