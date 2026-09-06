import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockStats = { todayDeliveries: 4, totalDeliveries: 52, pending: 2, completed: 50 };
const mockOrders = [
  { id: 1, shippingAddress: "Bakı, Nizami küç. 15",        totalAmount: 25.40, status: 3 },
  { id: 2, shippingAddress: "Sumqayıt, Azadlıq pr. 8",     totalAmount: 48.20, status: 2 },
  { id: 3, shippingAddress: "Bakı, Hüsü Hacıyev küç. 22",  totalAmount: 12.00, status: 3 },
];
const ORDER_STATUS = {
  1: { label: "Gözləyir",    cls: "s-pending",   icon: "⏳" },
  2: { label: "Təsdiqləndi", cls: "s-confirmed",  icon: "✅" },
  3: { label: "Yoldadır",    cls: "s-shipped",    icon: "🚚" },
  4: { label: "Çatdırıldı",  cls: "s-delivered",  icon: "📦" },
  5: { label: "Ləğv edildi", cls: "s-cancelled",  icon: "❌" },
};

const styles = `
  .welcome-banner { background: linear-gradient(135deg, #1A252F, #2C3E50); border-radius: 14px; padding: 20px 24px; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .wb-title { font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 5px; }
  .wb-sub { font-size: 13px; color: rgba(255,255,255,0.65); }
  .wb-icon { font-size: 52px; opacity: 0.85; }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 22px; }
  .stat-card { background: #fff; border-radius: 13px; border: 1.5px solid #D6EAF8; padding: 18px; display: flex; align-items: center; gap: 14px; transition: all 0.2s; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .stat-icon { width: 48px; height: 48px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .si-orange { background: linear-gradient(135deg, #EAF2F8, #D6EAF8); }
  .si-blue   { background: linear-gradient(135deg, #EBF5FB, #D6EAF8); }
  .si-teal   { background: linear-gradient(135deg, #EAF2F8, #D6EAF8); }
  .si-red    { background: linear-gradient(135deg, #FDEDEC, #FADBD8); }
  .stat-val { font-size: 24px; font-weight: 800; color: #154360; margin-bottom: 2px; }
  .stat-label { font-size: 12px; color: #5D8AA8; font-weight: 600; }
  .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .section-title { font-size: 14px; font-weight: 800; color: #154360; }
  .card { background: #fff; border-radius: 13px; border: 1.5px solid #D6EAF8; overflow: hidden; }
  .delivery-item { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-bottom: 1px solid #F4FAFD; transition: background 0.15s; }
  .delivery-item:last-child { border-bottom: none; }
  .delivery-item:hover { background: #F8FCFF; }
  .del-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #EAF2F8, #D6EAF8); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .del-info { flex: 1; }
  .del-id { font-size: 13px; font-weight: 700; color: #154360; margin-bottom: 2px; }
  .del-addr { font-size: 11px; color: #5D8AA8; }
  .del-amount { font-size: 14px; font-weight: 800; color: #1F618D; }
  .s-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .s-pending   { background: #EAF2F8; color: #D4AC0D; }
  .s-confirmed { background: #EAF2F8; color: #1A5276; }
  .s-shipped   { background: #EBF5FB; color: #2E86C1; }
  .s-delivered { background: #EAF2F8; color: #1E8449; }
  .s-cancelled { background: #FDEDEC; color: #E74C3C; }
  .pg-header { margin-bottom: 22px; }
  .pg-header h1 { font-size: 21px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pg-header p { font-size: 13px; color: #5D8AA8; }
`;

export default function CourierDashboard() {
  const [stats, setStats] = useState(mockStats);
  const [orders, setOrders] = useState(mockOrders);
  const courierName = localStorage.getItem("courierName") || "Kuryer";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Sabahınız xeyir" : hour < 18 ? "Günortanız xeyir" : "Axşamınız xeyir";

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/api/Order`, { headers: authHeader() });
        const all = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setOrders(all.filter(o => o.status === 2 || o.status === 3).slice(0, 5));
        setStats({
          todayDeliveries: all.filter(o => o.status === 3).length,
          totalDeliveries: all.length,
          pending:   all.filter(o => o.status === 2).length,
          completed: all.filter(o => o.status === 4).length,
        });
      } catch { }
    };
    fetch();
  }, []);

  const STATS = [
    { icon: "🚚", cls: "si-orange", val: stats.todayDeliveries, label: "Aktiv Çatdırılma" },
    { icon: "📦", cls: "si-blue",   val: stats.totalDeliveries, label: "Ümumi Sifariş"    },
    { icon: "⏳", cls: "si-red",    val: stats.pending,          label: "Gözləyən"         },
    { icon: "✅", cls: "si-teal",   val: stats.completed,        label: "Tamamlanan"       },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="welcome-banner">
        <div>
          <div className="wb-title">{greeting}, {courierName}! 🚚</div>
          <div className="wb-sub">Aktiv çatdırılmalarınızı izləyin</div>
        </div>
        <div className="wb-icon">🚚</div>
      </div>

      <div className="stat-grid">
        {STATS.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div><div className="stat-val">{s.val}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="section-head"><div className="section-title">🚚 Aktiv Sifarişlər</div></div>
      <div className="card">
        {orders.length === 0
          ? <div style={{ textAlign: "center", padding: 30, color: "#B0C4D8", fontSize: 13 }}>Aktiv sifariş yoxdur 🎉</div>
          : orders.map(o => {
              const st = ORDER_STATUS[o.status] || ORDER_STATUS[1];
              return (
                <div className="delivery-item" key={o.id}>
                  <div className="del-icon">📦</div>
                  <div className="del-info">
                    <div className="del-id">Sifariş #{o.id}</div>
                    <div className="del-addr">{o.shippingAddress || "Ünvan yoxdur"}</div>
                  </div>
                  <div className="del-amount">{o.totalAmount?.toFixed(2)} ₼</div>
                  <span className={`s-pill ${st.cls}`}>{st.icon} {st.label}</span>
                </div>
              );
            })
        }
      </div>
    </>
  );
}