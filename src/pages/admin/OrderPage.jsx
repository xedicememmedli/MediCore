import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

// OrderStatus enum: 1=Pending, 2=Confirmed, 3=Shipped, 4=Delivered, 5=Cancelled
const STATUS_CONFIG = {
  1: { label: "Gözləyir",      cls: "s-pending",   icon: "⏳", next: 2 },
  2: { label: "Təsdiqləndi",   cls: "s-confirmed",  icon: "✅", next: 3 },
  3: { label: "Yoldadır",      cls: "s-shipped",    icon: "🚚", next: 4 },
  4: { label: "Çatdırıldı",    cls: "s-delivered",  icon: "📦", next: null },
  5: { label: "Ləğv edildi",   cls: "s-cancelled",  icon: "❌", next: null },
};

const mockOrders = [
  { id: 1, shippingAddress: "Bakı, Nizami küç. 15", phoneNumber: "+994501234567", status: 1, totalAmount: 25.40, createdAt: "2026-03-05T10:00:00" },
  { id: 2, shippingAddress: "Sumqayıt, Azadlıq pr. 8", phoneNumber: "+994551234567", status: 2, totalAmount: 48.20, createdAt: "2026-03-04T14:30:00" },
  { id: 3, shippingAddress: "Gəncə, İstiqlal küç. 3", phoneNumber: "+994701234567", status: 3, totalAmount: 12.00, createdAt: "2026-03-03T09:15:00" },
  { id: 4, shippingAddress: "Bakı, Hüsü Hacıyev küç. 22", phoneNumber: "+994601234567", status: 4, totalAmount: 67.80, createdAt: "2026-03-02T16:45:00" },
  { id: 5, shippingAddress: "Bakı, Əliağa Vahid küç. 5", phoneNumber: "+994501112233", status: 5, totalAmount: 33.50, createdAt: "2026-03-01T11:00:00" },
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

  /* STATUS STATS */
  .status-stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px; margin-bottom: 20px;
  }
  @media (max-width: 1000px) { .status-stats { grid-template-columns: repeat(3, 1fr); } }
  .stat-chip {
    background: #fff; border-radius: 11px;
    border: 1.5px solid #D6EAF8; padding: 14px 16px;
    cursor: pointer; transition: all 0.18s; text-align: center;
  }
  .stat-chip:hover { border-color: #AED6F1; transform: translateY(-1px); }
  .stat-chip.active { border-color: #1F618D; background: #EBF5FB; }
  .stat-chip-icon { font-size: 20px; margin-bottom: 6px; }
  .stat-chip-val { font-size: 20px; font-weight: 800; color: #154360; margin-bottom: 2px; }
  .stat-chip-label { font-size: 11px; color: #5D8AA8; font-weight: 600; }

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

  /* CƏDVƏL */
  .table-card { background: #fff; border-radius: 14px; border: 1px solid #D6EAF8; overflow: hidden; }
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    font-size: 10px; font-weight: 800; color: #5D8AA8;
    text-align: left; padding: 11px 18px;
    letter-spacing: 0.8px; text-transform: uppercase;
    background: #F8FCFF; border-bottom: 1px solid #EBF5FB; white-space: nowrap;
  }
  .data-table td {
    font-size: 13px; color: #1A252F;
    padding: 13px 18px; border-bottom: 1px solid #F4FAFD; vertical-align: middle;
  }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: #F8FCFF; }

  .s-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
    white-space: nowrap;
  }
  .s-pending   { background: #FEF9E7; color: #D4AC0D; }
  .s-confirmed { background: #E8FAF8; color: #17A589; }
  .s-shipped   { background: #EBF5FB; color: #2E86C1; }
  .s-delivered { background: #E8F8F5; color: #1E8449; }
  .s-cancelled { background: #FDEDEC; color: #E74C3C; }

  .amount-val { font-weight: 800; color: #1F618D; font-size: 14px; }
  .address-text { font-size: 12px; color: #5D8AA8; margin-top: 2px; }

  .action-btns { display: flex; gap: 6px; align-items: center; }
  .btn-next-status {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 10px;
    background: #E8FAF8; border: 1.5px solid #A9DFBF;
    border-radius: 7px; color: #17A589; font-size: 11px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
    white-space: nowrap;
  }
  .btn-next-status:hover { background: #D5F5E3; }
  .btn-view {
    padding: 6px 10px;
    background: #EBF5FB; border: 1.5px solid #D6EAF8;
    border-radius: 7px; color: #1F618D; font-size: 11px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-view:hover { background: #D6EAF8; }
  .btn-sm-del {
    padding: 6px 10px;
    background: #FDF2F2; border: 1.5px solid #FADBD8;
    border-radius: 7px; color: #E74C3C; font-size: 11px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-sm-del:hover { background: #FADBD8; }

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
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal {
    background: #fff; border-radius: 16px;
    width: 100%; max-width: 460px;
    box-shadow: 0 24px 64px rgba(21,67,96,0.2);
    animation: slideUp 0.2s ease;
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
  .modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; }
  .modal-foot { padding: 16px 24px; border-top: 1px solid #EBF5FB; display: flex; gap: 10px; justify-content: flex-end; }
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

  /* SİFARİŞ DETALİ */
  .order-detail { display: flex; flex-direction: column; gap: 12px; }
  .detail-row {
    display: flex; gap: 10px; align-items: flex-start;
    padding: 10px 14px; background: #F8FCFF; border-radius: 9px;
    border: 1px solid #EBF5FB;
  }
  .detail-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .detail-label { font-size: 11px; color: #5D8AA8; font-weight: 600; margin-bottom: 2px; }
  .detail-val { font-size: 13px; font-weight: 700; color: #1A252F; }

  /* STATUS DEĞİŞTİRMƏ */
  .status-select-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .status-opt {
    padding: 10px 12px; border-radius: 9px;
    border: 1.5px solid #D6EAF8; background: #F8FCFF;
    cursor: pointer; transition: all 0.18s; text-align: center;
    font-size: 12px; font-weight: 700; color: #5D8AA8;
  }
  .status-opt:hover { border-color: #AED6F1; }
  .status-opt.selected { border-color: #1F618D; background: #EBF5FB; color: #1F618D; }

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
  .btn-del-confirm:hover:not(:disabled) { opacity: 0.9; }
  .btn-del-confirm:disabled { opacity: 0.7; cursor: not-allowed; }
  .spin {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const emptyOrderForm = { shippingAddress: "", phoneNumber: "" };

export default function OrderPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/Order`, { headers: authHeader() });
      setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      setData(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(data.filter(d => {
      const matchQ =
        String(d.id).includes(q) ||
        (d.shippingAddress || "").toLowerCase().includes(q) ||
        (d.phoneNumber || "").toLowerCase().includes(q);
      const matchStatus = activeStatus === 0 ? true : d.status === activeStatus;
      return matchQ && matchStatus;
    }));
  }, [search, activeStatus, data]);

  const statusCount = (s) => s === 0 ? data.length : data.filter(d => d.status === s).length;

  const handleCreate = async () => {
    if (!orderForm.shippingAddress) { setError("Çatdırılma ünvanı daxil edin."); return; }
    setSaving(true); setError("");
    try {
      await axios.post(`${API}/api/Order`, orderForm, { headers: jsonHeader() });
      await fetchData();
      setCreateModal(false);
      setOrderForm(emptyOrderForm);
    } catch (err) {
      setError(err.response?.data?.message || "Xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    setUpdatingStatus(true);
    try {
      await axios.put(`${API}/api/Order/UpdateStatus`,
        { id: statusModal.id, status: newStatus },
        { headers: jsonHeader() }
      );
      setData(d => d.map(o => o.id === statusModal.id ? { ...o, status: newStatus } : o));
      setStatusModal(null);
    } catch {
      setData(d => d.map(o => o.id === statusModal.id ? { ...o, status: newStatus } : o));
      setStatusModal(null);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/Order/SoftDelete/${deleteTarget.id}`, { headers: authHeader() });
      await fetchData();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>Sifarişlər <span className="count-badge">{filtered.length}</span></h1>
          <p>Bütün sifarişləri izləyin və idarə edin</p>
        </div>
        <button className="btn-primary" onClick={() => { setCreateModal(true); setError(""); }}>
          ＋ Yeni Sifariş
        </button>
      </div>

      {/* STATUS STATİSTİKA */}
      <div className="status-stats">
        {[
          { val: 0, label: "Hamısı", icon: "📋" },
          { val: 1, label: "Gözləyir", icon: "⏳" },
          { val: 2, label: "Təsdiqləndi", icon: "✅" },
          { val: 3, label: "Yoldadır", icon: "🚚" },
          { val: 4, label: "Çatdırıldı", icon: "📦" },
        ].map(s => (
          <div
            key={s.val}
            className={`stat-chip ${activeStatus === s.val ? "active" : ""}`}
            onClick={() => setActiveStatus(s.val)}
          >
            <div className="stat-chip-icon">{s.icon}</div>
            <div className="stat-chip-val">{statusCount(s.val)}</div>
            <div className="stat-chip-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <span style={{ color: "#B0C4D8", fontSize: 14 }}>🔍</span>
          <input placeholder="Sifariş axtar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8" }}>⏳ Yüklənir...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">📦</div>
          <h3>Sifariş tapılmadı</h3>
          <p>Hələlik heç bir sifariş yoxdur</p>
        </div>
      ) : (
        <div className="table-card">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ünvan</th>
                  <th>Telefon</th>
                  <th>Məbləğ</th>
                  <th>Status</th>
                  <th>Tarix</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG[1];
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: "#8DAFC4" }}>#{order.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.shippingAddress || "—"}</div>
                      </td>
                      <td style={{ color: "#5D8AA8" }}>{order.phoneNumber || "—"}</td>
                      <td><span className="amount-val">{order.totalAmount?.toFixed(2) || "0.00"} ₼</span></td>
                      <td><span className={`s-pill ${st.cls}`}>{st.icon} {st.label}</span></td>
                      <td style={{ color: "#5D8AA8", fontSize: 12 }}>{formatDate(order.createdAt)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-view" onClick={() => setDetailItem(order)}>👁</button>
                          {order.status !== 4 && order.status !== 5 && (
                            <button className="btn-next-status" onClick={() => {
                              setStatusModal(order);
                              setNewStatus(order.status);
                            }}>
                              🔄 Status
                            </button>
                          )}
                          <button className="btn-sm-del" onClick={() => setDeleteTarget(order)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* YENİ SİFARİŞ MODALI */}
      {createModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setCreateModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">＋ Yeni Sifariş</div>
              <button className="modal-x" onClick={() => setCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="err-msg">⚠️ {error}</div>}
              <div className="fg">
                <label className="fl">Çatdırılma Ünvanı *</label>
                <input className="fi" placeholder="Şəhər, küçə, ev nömrəsi..."
                  value={orderForm.shippingAddress}
                  onChange={e => setOrderForm(f => ({ ...f, shippingAddress: e.target.value }))} />
              </div>
              <div className="fg">
                <label className="fl">Telefon Nömrəsi</label>
                <input className="fi" placeholder="+994501234567"
                  value={orderForm.phoneNumber}
                  onChange={e => setOrderForm(f => ({ ...f, phoneNumber: e.target.value }))} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel" onClick={() => setCreateModal(false)}>Ləğv et</button>
              <button className="btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? <><span className="spin" /> Yaradılır...</> : "Sifariş yarat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SİFARİŞ DETALİ */}
      {detailItem && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setDetailItem(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">📦 Sifariş #{detailItem.id}</div>
              <button className="modal-x" onClick={() => setDetailItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="order-detail">
                <div className="detail-row">
                  <span className="detail-icon">📍</span>
                  <div>
                    <div className="detail-label">Çatdırılma ünvanı</div>
                    <div className="detail-val">{detailItem.shippingAddress || "—"}</div>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">📞</span>
                  <div>
                    <div className="detail-label">Telefon</div>
                    <div className="detail-val">{detailItem.phoneNumber || "—"}</div>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">💰</span>
                  <div>
                    <div className="detail-label">Ümumi məbləğ</div>
                    <div className="detail-val">{detailItem.totalAmount?.toFixed(2) || "0.00"} ₼</div>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <div>
                    <div className="detail-label">Sifariş tarixi</div>
                    <div className="detail-val">{formatDate(detailItem.createdAt)}</div>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">{STATUS_CONFIG[detailItem.status]?.icon}</span>
                  <div>
                    <div className="detail-label">Status</div>
                    <div className="detail-val">{STATUS_CONFIG[detailItem.status]?.label}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel" onClick={() => setDetailItem(null)}>Bağla</button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS DEĞİŞTİR */}
      {statusModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setStatusModal(null)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">🔄 Sifariş #{statusModal.id} — Status dəyiş</div>
              <button className="modal-x" onClick={() => setStatusModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="status-select-grid">
                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                  <div
                    key={val}
                    className={`status-opt ${newStatus === Number(val) ? "selected" : ""}`}
                    onClick={() => setNewStatus(Number(val))}
                  >
                    {cfg.icon} {cfg.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel" onClick={() => setStatusModal(null)}>Ləğv et</button>
              <button className="btn-primary" onClick={handleUpdateStatus} disabled={updatingStatus}>
                {updatingStatus ? <><span className="spin" /> Yenilənir...</> : "Statusu yenilə"}
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
            <p>Sifariş <strong>#{deleteTarget.id}</strong> silinəcək.<br />Bu əməliyyat geri alına bilər.</p>
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
