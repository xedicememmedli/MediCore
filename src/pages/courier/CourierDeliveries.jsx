import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useChatSignalR } from "../../hooks/useChatSignalR";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockDeliveries = [
  { id: 1, shippingAddress: "Bakı, Nizami küç. 15",    phoneNumber: "+994501234567", totalAmount: 25.40, status: 2, createdAt: "2026-03-06T09:00:00" },
  { id: 2, shippingAddress: "Sumqayıt, Azadlıq pr. 8", phoneNumber: "+994551234567", totalAmount: 48.20, status: 3, createdAt: "2026-03-06T10:00:00" },
  { id: 3, shippingAddress: "Gəncə, İstiqlal küç. 3",  phoneNumber: "+994701234567", totalAmount: 12.00, status: 4, createdAt: "2026-03-05T14:00:00" },
];

const ORDER_STATUS = {
  1: { label: "Gözləyir",    cls: "s-pending",   icon: "⏳" },
  2: { label: "Təsdiqləndi", cls: "s-confirmed",  icon: "✅" },
  3: { label: "Yoldadır",    cls: "s-shipped",    icon: "🚚" },
  4: { label: "Çatdırıldı",  cls: "s-delivered",  icon: "📦" },
  5: { label: "Ləğv edildi", cls: "s-cancelled",  icon: "❌" },
};

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:16px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }
  .count-badge { display:inline-flex; align-items:center; background:#EAF2F8; border:1px solid #F9E79F; color:#D4AC0D; font-size:12px; font-weight:700; padding:2px 10px; border-radius:20px; margin-left:10px; }
  .status-tabs { display:flex; gap:8px; margin-bottom:18px; flex-wrap:wrap; }
  .tab-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:9px; border:1.5px solid #D6EAF8; background:#fff; font-size:12px; font-weight:700; color:#5D8AA8; cursor:pointer; transition:all 0.18s; font-family:'Plus Jakarta Sans',sans-serif; }
  .tab-btn.active { border-color:#1F618D; background:#EAF2F8; color:#1F618D; }
  .tab-count { background:#D6EAF8; color:#1F618D; font-size:10px; font-weight:800; padding:1px 6px; border-radius:20px; }
  .tab-btn.active .tab-count { background:#1F618D; color:#fff; }
  .orders-list { display:flex; flex-direction:column; gap:12px; }
  .order-card { background:#fff; border-radius:14px; border:1.5px solid #D6EAF8; overflow:hidden; transition:all 0.2s; }
  .order-card:hover { border-color:#AED6F1; box-shadow:0 6px 18px rgba(31,97,141,0.08); }
  .order-head { padding:14px 18px; display:flex; align-items:center; gap:14px; border-bottom:1px solid #EBF5FB; background:linear-gradient(135deg,#FFFDF7,#EAF2F8); }
  .order-num { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#1F618D,#154360); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:800; flex-shrink:0; }
  .order-id-text { font-size:14px; font-weight:800; color:#154360; }
  .order-date-text { font-size:11px; color:#8DAFC4; }
  .order-amount { font-size:16px; font-weight:800; color:#1F618D; margin-left:auto; }
  .order-body { padding:12px 18px; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
  .order-address { display:flex; align-items:center; gap:8px; font-size:13px; color:#5D8AA8; flex:1; }
  .btn-action { display:flex; align-items:center; gap:6px; padding:9px 16px; border:none; border-radius:9px; font-size:12px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
  .btn-start  { background:linear-gradient(135deg,#1F618D,#2E86C1); color:#fff; }
  .btn-start:hover  { background:linear-gradient(135deg,#154360,#1F618D); }
  .btn-finish { background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; }
  .btn-finish:hover { background:linear-gradient(135deg,#154360,#1A5276); }
  .btn-action:disabled { opacity:0.5; cursor:not-allowed; }
  .s-pill { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .s-pending   { background:#EAF2F8; color:#D4AC0D; }
  .s-confirmed { background:#EAF2F8; color:#1A5276; }
  .s-shipped   { background:#EBF5FB; color:#2E86C1; }
  .s-delivered { background:#EAF2F8; color:#1E8449; }
  .s-cancelled { background:#FDEDEC; color:#E74C3C; }
  .empty-state { text-align:center; padding:60px; background:#fff; border-radius:14px; border:1.5px dashed #AED6F1; }
  .empty-state .ei { font-size:48px; margin-bottom:12px; }
  .empty-state h3 { font-size:16px; font-weight:700; color:#154360; margin-bottom:6px; }
  .empty-state p { font-size:13px; color:#5D8AA8; }

  .gps-banner { display:flex; align-items:center; gap:10px; background:linear-gradient(135deg,#EAF2F8,#D6EAF8); border:1.5px solid #AED6F1; border-radius:12px; padding:12px 16px; margin-bottom:18px; }
  .gps-dot { width:10px; height:10px; border-radius:50%; background:#1A5276; animation:gpsPulse 1.5s infinite; flex-shrink:0; }
  .gps-dot.off { background:#B0C4D8; animation:none; }
  @keyframes gpsPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
  .gps-text { font-size:13px; font-weight:700; color:#1A5276; }
  .gps-text.off { color:#8DAFC4; }
  .gps-coords { font-size:11px; color:#5D8AA8; margin-left:auto; font-family:monospace; }

  .spin { width:14px; height:14px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

// Kuryer sifariş götürsün
async function takeOrder(orderId) {
  try {
    await axios.put(`${process.env.REACT_APP_API_URL}/api/Order/TakeOrder/${orderId}`,
      {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    return true;
  } catch { return false; }
}

export default function CourierDeliveries() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // GPS state
  const [gpsActive, setGpsActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const gpsWatchRef = useRef(null);
  const gpsIntervalRef = useRef(null);

  // SignalR — location göndərmək üçün
  const { sendMessage: signalRSend } = useChatSignalR(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // Kuryer üçün: öz sifarişləri + gözləyən sifarişlər
        const [myRes, pendingRes] = await Promise.all([
          axios.get(`${API}/api/Order`, { headers: authHeader() }),
          axios.get(`${API}/api/Order/PendingOrders`, { headers: authHeader() }),
        ]);
        const myOrders = Array.isArray(myRes.data) ? myRes.data : myRes.data?.data || [];
        const pending  = Array.isArray(pendingRes.data) ? pendingRes.data : pendingRes.data?.data || [];
        // Pending-i myOrders-ə birləşdir (təkrar olmayanları)
        const myIds = new Set(myOrders.map(o => o.id));
        const allOrders = [...myOrders, ...pending.filter(p => !myIds.has(p.id))];
        const res = { data: allOrders };
        setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch { setData(mockDeliveries); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // GPS izləməni başlat
  const startGPS = (orderId) => {
    if (!navigator.geolocation) {
      alert("Brauzeriniz GPS-i dəstəkləmir");
      return;
    }
    setActiveOrderId(orderId);
    setGpsActive(true);

    // Hər 5 saniyədə bir koordinat göndər
    gpsIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentCoords({ lat: latitude, lng: longitude });

          // SignalR ilə backend-ə göndər
          signalRSend(`location:${orderId}`, JSON.stringify({ orderId, latitude, longitude }));

          // REST fallback
          axios.post(
            `${API}/api/Courier/UpdateLocation`,
            { orderId, latitude, longitude },
            { headers: { ...authHeader(), "Content-Type": "application/json" } }
          ).catch(() => {});
        },
        (err) => console.warn("GPS xətası:", err),
        { enableHighAccuracy: true, timeout: 4000 }
      );
    }, 5000);

    // İlk dəfə dərhal al
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
      },
      () => {}
    );
  };

  // GPS izləməni dayandır
  const stopGPS = () => {
    clearInterval(gpsIntervalRef.current);
    if (gpsWatchRef.current) navigator.geolocation.clearWatch(gpsWatchRef.current);
    setGpsActive(false);
    setCurrentCoords(null);
    setActiveOrderId(null);
  };

  useEffect(() => {
    return () => {
      clearInterval(gpsIntervalRef.current);
      if (gpsWatchRef.current) navigator.geolocation.clearWatch(gpsWatchRef.current);
    };
  }, []);

  const filtered = activeTab === 0 ? data : data.filter(d => d.status === activeTab);
  const tabCount = (s) => s === 0 ? data.length : data.filter(d => d.status === s).length;

  const updateStatus = async (order, newStatus) => {
    setUpdating(order.id);
    // Status 3-ə keçəndə GPS başlat
    if (newStatus === 3) startGPS(order.id);
    // Status 4-ə keçəndə GPS dayandır
    if (newStatus === 4) stopGPS();
    try {
      await axios.put(
        `${API}/api/Order/UpdateStatus`,
        { id: order.id, status: newStatus },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
    } catch { }
    setData(d => d.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    setUpdating(null);
  };

  const formatDate = (dt) =>
    dt ? new Date(dt).toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  return (
    <>
      <style>{styles}</style>
      <div className="pg-header">
        <div>
          <h1>Çatdırılmalar <span className="count-badge">{filtered.length}</span></h1>
          <p>Sifarişləri çatdırın və statusları yeniləyin</p>
        </div>
      </div>

      {/* GPS Status Banner */}
      <div className="gps-banner">
        <div className={`gps-dot ${gpsActive ? "" : "off"}`} />
        <div className={`gps-text ${gpsActive ? "" : "off"}`}>
          {gpsActive ? `📍 GPS aktiv — Sifariş #${activeOrderId} izlənilir` : "📍 GPS qeyri-aktiv"}
        </div>
        {currentCoords && (
          <div className="gps-coords">
            {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
          </div>
        )}
      </div>

      <div className="status-tabs">
        {[
          { key: 0, label: "Hamısı",     icon: "📋" },
          { key: 2, label: "Gözləyir",   icon: "⏳" },
          { key: 3, label: "Yoldadır",   icon: "🚚" },
          { key: 4, label: "Çatdırıldı", icon: "📦" },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label} <span className="tab-count">{tabCount(t.key)}</span>
          </button>
        ))}
      </div>

      {loading
        ? <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8" }}>⏳ Yüklənir...</div>
        : filtered.length === 0
          ? <div className="empty-state"><div className="ei">🚚</div><h3>Sifariş tapılmadı</h3><p>Bu kateqoriyada sifariş yoxdur</p></div>
          : <div className="orders-list">
              {filtered.map(order => {
                const st = ORDER_STATUS[order.status] || ORDER_STATUS[1];
                const isActive = activeOrderId === order.id;
                return (
                  <div className="order-card" key={order.id}>
                    <div className="order-head">
                      <div className="order-num">#{order.id}</div>
                      <div>
                        <div className="order-id-text">Sifariş #{order.id}</div>
                        <div className="order-date-text">{formatDate(order.createdAt)}</div>
                      </div>
                      <div className="order-amount">{order.totalAmount?.toFixed(2)} ₼</div>
                      <span className={`s-pill ${st.cls}`}>{st.icon} {st.label}</span>
                    </div>
                    <div className="order-body">
                      <div className="order-address">
                        <span>📍</span>{order.shippingAddress || "Ünvan yoxdur"}
                        {order.phoneNumber && (
                          <><span style={{ margin: "0 6px", color: "#D6EAF8" }}>|</span><span>📞</span>{order.phoneNumber}</>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {order.status === 2 && (
                          <button className="btn-action btn-start" onClick={() => updateStatus(order, 3)} disabled={updating === order.id}>
                            {updating === order.id ? <span className="spin" /> : "🚚 Çıxış et"}
                          </button>
                        )}
                        {order.status === 3 && (
                          <>
                            {isActive && (
                              <span style={{ fontSize: 11, color: "#1A5276", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A5276", display: "inline-block", animation: "gpsPulse 1.5s infinite" }} />
                                Canlı izlənilir
                              </span>
                            )}
                            <button className="btn-action btn-finish" onClick={() => updateStatus(order, 4)} disabled={updating === order.id}>
                              {updating === order.id ? <span className="spin" /> : "📦 Çatdırıldı"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
      }
    </>
  );
}