import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

const mockOrders = [
  { id: 1, shippingAddress: "Bakı, Nizami 15", totalAmount: 25.40, status: 1, createdAt: "2026-03-08T08:30:00", patientName: "Əli Həsənov" },
  { id: 2, shippingAddress: "Bakı, Hüsü Hacıyev 8", totalAmount: 48.20, status: 2, createdAt: "2026-03-08T09:10:00", patientName: "Günel Quliyeva" },
  { id: 3, shippingAddress: "Bakı, İstiqlal 3", totalAmount: 12.00, status: 3, createdAt: "2026-03-08T09:45:00", patientName: "Tural İsmayılov" },
  { id: 4, shippingAddress: "Bakı, Neftçilər 22", totalAmount: 36.80, status: 4, createdAt: "2026-03-07T14:00:00", patientName: "Nigar Abbasova" },
  { id: 5, shippingAddress: "Bakı, Tbilisi 7", totalAmount: 19.50, status: 1, createdAt: "2026-03-08T10:00:00", patientName: "Rauf Babayev" },
  { id: 6, shippingAddress: "Bakı, Zərdabi 11", totalAmount: 55.00, status: 2, createdAt: "2026-03-08T10:20:00", patientName: "Leyla Əliyeva" },
];

const COLUMNS = [
  { status: 1, label: "Gözləyir",          icon: "📦", color: "#17A589", bg: "#E8FAF8", border: "#A9DFBF" },
  { status: 2, label: "Aptekdə Hazırlanır", icon: "⚗️",  color: "#D4AC0D", bg: "#FEF9E7", border: "#F9E79F" },
  { status: 3, label: "Kuryer Yoldadır",    icon: "🚚", color: "#2E86C1", bg: "#EBF5FB", border: "#AED6F1" },
  { status: 4, label: "Çatdırıldı",         icon: "✅", color: "#1E8449", bg: "#E8F8F5", border: "#A9DFBF" },
];

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:16px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }

  .kanban-board { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; align-items:start; }
  @media (max-width:1100px) { .kanban-board { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:650px) { .kanban-board { grid-template-columns:1fr; } }

  .kanban-col { border-radius:14px; border:1.5px solid #D6EAF8; background:#F8FCFF; min-height:200px; transition:all 0.2s; }
  .kanban-col.drag-over { border-color:#17A589; background:#E8FAF8; box-shadow:0 0 0 3px rgba(26,188,156,0.12); }

  .col-header { padding:12px 14px; display:flex; align-items:center; gap:8px; border-bottom:1.5px solid #D6EAF8; border-radius:12px 12px 0 0; }
  .col-icon { font-size:18px; }
  .col-label { font-size:13px; font-weight:800; flex:1; }
  .col-count { min-width:22px; height:22px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; }

  .col-cards { padding:10px; display:flex; flex-direction:column; gap:8px; min-height:120px; }

  .order-kanban-card { background:#fff; border-radius:11px; border:1.5px solid #D6EAF8; padding:12px; cursor:grab; transition:all 0.18s; user-select:none; }
  .order-kanban-card:hover { border-color:#A9DFBF; box-shadow:0 4px 12px rgba(26,188,156,0.1); transform:translateY(-1px); }
  .order-kanban-card.dragging { opacity:0.5; transform:rotate(2deg) scale(0.97); cursor:grabbing; }
  .order-kanban-card.drag-ghost { opacity:0.3; }

  .card-id { font-size:10px; font-weight:800; color:#8DAFC4; letter-spacing:0.5px; margin-bottom:5px; }
  .card-patient { font-size:13px; font-weight:800; color:#154360; margin-bottom:3px; }
  .card-address { font-size:11px; color:#8DAFC4; margin-bottom:8px; display:flex; align-items:center; gap:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .card-footer { display:flex; align-items:center; justify-content:space-between; }
  .card-amount { font-size:13px; font-weight:800; color:#17A589; }
  .card-time { font-size:10px; color:#B0C4D8; }

  /* STATUS DƏYİŞ DÜYMƏSİ */
  .quick-status { display:flex; gap:5px; margin-top:8px; }
  .qs-btn { flex:1; padding:4px 6px; border-radius:6px; border:1.5px solid #D6EAF8; background:#F8FCFF; font-size:10px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.15s; color:#5D8AA8; text-align:center; }
  .qs-btn:hover { border-color:#17A589; color:#17A589; background:#E8FAF8; }

  /* TOAST */
  .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(80px); background:#154360; color:#fff; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:700; z-index:9998; transition:transform 0.3s ease; box-shadow:0 8px 24px rgba(21,67,96,0.3); display:flex; align-items:center; gap:8px; white-space:nowrap; }
  .toast.show { transform:translateX(-50%) translateY(0); }

  .spin { width:13px; height:13px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .skel-line { height:12px; border-radius:6px; background:linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; margin-bottom:8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

export default function AdminKanban() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [toast, setToast] = useState({ show: false, text: "" });
  const [dragId, setDragId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/Order`, { headers: authHeader() });
        setOrders(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch { setOrders(mockOrders); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const showToast = (text) => {
    setToast({ show: true, text });
    setTimeout(() => setToast({ show: false, text: "" }), 2500);
  };

  const changeStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === newStatus) return;
    setUpdating(u => ({ ...u, [orderId]: true }));
    const prevOrders = orders;
    // Optimistic update
    setOrders(os => os.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await axios.put(`${API}/api/Order/UpdateStatus`, {
        orderId, status: newStatus
      }, { headers: jsonHeader() });
      const col = COLUMNS.find(c => c.status === newStatus);
      showToast(`${col?.icon} Sifariş #${orderId} — ${col?.label} statusuna keçirildi`);
    } catch {
      setOrders(prevOrders);
      showToast("⚠️ Status dəyişdirilə bilmədi");
    } finally {
      setUpdating(u => ({ ...u, [orderId]: false }));
    }
  };

  // DRAG & DROP
  const onDragStart = (e, orderId) => {
    setDragId(orderId);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e, colStatus) => {
    e.preventDefault();
    setDragOverCol(colStatus);
  };
  const onDrop = (e, colStatus) => {
    e.preventDefault();
    if (dragId) changeStatus(dragId, colStatus);
    setDragId(null);
    setDragOverCol(null);
  };
  const onDragEnd = () => { setDragId(null); setDragOverCol(null); };

  const formatTime = (dt) => {
    if (!dt) return "";
    return new Date(dt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <style>{styles}</style>
      <div className={`toast ${toast.show ? "show" : ""}`}>{toast.text}</div>

      <div className="pg-header">
        <div>
          <h1>Sifariş Kanban Board</h1>
          <p>Sifarişi sürükləyib kölgəyə atın — status avtomatik yenilənər</p>
        </div>
      </div>

      {loading ? (
        <div className="kanban-board">
          {COLUMNS.map(col => (
            <div className="kanban-col" key={col.status}>
              <div className="col-header" style={{ background: col.bg, borderColor: col.border }}>
                <span className="col-icon">{col.icon}</span>
                <span className="col-label" style={{ color: col.color }}>{col.label}</span>
              </div>
              <div className="col-cards">
                {[1, 2].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: 11, border: "1.5px solid #D6EAF8", padding: 12 }}>
                    <div className="skel-line" style={{ width: "40%" }} />
                    <div className="skel-line" style={{ width: "70%" }} />
                    <div className="skel-line" style={{ width: "55%" }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colOrders = orders.filter(o => o.status === col.status);
            return (
              <div
                key={col.status}
                className={`kanban-col ${dragOverCol === col.status ? "drag-over" : ""}`}
                onDragOver={e => onDragOver(e, col.status)}
                onDrop={e => onDrop(e, col.status)}
              >
                <div className="col-header" style={{ background: col.bg, borderColor: col.border }}>
                  <span className="col-icon">{col.icon}</span>
                  <span className="col-label" style={{ color: col.color }}>{col.label}</span>
                  <span className="col-count" style={{ background: col.color, color: "#fff" }}>{colOrders.length}</span>
                </div>
                <div className="col-cards">
                  {colOrders.length === 0 && (
                    <div style={{ textAlign: "center", padding: "24px 10px", color: "#B0C4D8", fontSize: 12, fontWeight: 600 }}>
                      📭 Sifariş yoxdur
                    </div>
                  )}
                  {colOrders.map(order => (
                    <div
                      key={order.id}
                      className={`order-kanban-card ${dragId === order.id ? "dragging" : ""}`}
                      draggable
                      onDragStart={e => onDragStart(e, order.id)}
                      onDragEnd={onDragEnd}
                    >
                      <div className="card-id">SİFARİŞ #{order.id}</div>
                      <div className="card-patient">{order.patientName || "Müştəri"}</div>
                      <div className="card-address"><span>📍</span>{order.shippingAddress}</div>
                      <div className="card-footer">
                        <span className="card-amount">{order.totalAmount} ₼</span>
                        <span className="card-time">{formatTime(order.createdAt)}</span>
                      </div>
                      {/* Sürətli status düymələri */}
                      <div className="quick-status">
                        {COLUMNS.filter(c => c.status !== col.status).map(c => (
                          <button key={c.status} className="qs-btn"
                            onClick={() => changeStatus(order.id, c.status)}
                            disabled={updating[order.id]}>
                            {updating[order.id] ? <span className="spin" /> : c.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
