import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const styles = `
  .pd-root {}
  /* SALAMLAMA */
  .pd-greeting {
    background: linear-gradient(135deg, #154360 0%, #1A5276 60%, #1F618D 100%);
    border-radius: 16px; padding: 24px 28px; margin-bottom: 22px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    position: relative; overflow: hidden;
  }
  .pd-greeting::before {
    content: '🏥'; position: absolute; right: -10px; top: -10px;
    font-size: 100px; opacity: 0.08; transform: rotate(-15deg);
  }
  .pd-greet-title { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 6px; }
  .pd-greet-sub { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.5; }
  .pd-quick-btns { display: flex; gap: 9px; flex-wrap: wrap; }
  .pd-qbtn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 10px;
    background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.25);
    color: #fff; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.18s; white-space: nowrap;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .pd-qbtn:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }

  /* ALERT KARTI (randevu var) */
  .pd-alert {
    background: linear-gradient(135deg, #EAF2F8, #FDFAE0);
    border: 1.5px solid #F9E79F; border-radius: 14px;
    padding: 16px 20px; margin-bottom: 20px;
    display: flex; align-items: center; gap: 14px;
  }
  .pd-alert-icon { font-size: 28px; flex-shrink: 0; }
  .pd-alert-text { flex: 1; }
  .pd-alert-title { font-size: 14px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pd-alert-sub { font-size: 12px; color: #7D6608; }
  .pd-alert-btn {
    padding: 8px 16px; background: linear-gradient(135deg, #D4AC0D, #F1C40F);
    border: none; border-radius: 9px; color: #fff; font-size: 12px; font-weight: 800;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; white-space: nowrap;
    flex-shrink: 0;
  }

  /* STAT KARTLARI */
  .pd-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 22px; }
  @media (max-width: 900px) { .pd-stats { grid-template-columns: repeat(2,1fr); } }
  .pd-stat {
    background: #fff; border-radius: 13px; border: 1.5px solid #D6EAF8;
    padding: 16px 18px; transition: all 0.2s; cursor: pointer;
  }
  .pd-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(31,97,141,0.1); border-color: #AED6F1; }
  .pd-stat-icon { font-size: 24px; margin-bottom: 10px; }
  .pd-stat-val { font-size: 24px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pd-stat-label { font-size: 11px; color: #5D8AA8; font-weight: 600; }

  /* ANA MƏZMUN LAYOUT */
  .pd-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 900px) { .pd-main-grid { grid-template-columns: 1fr; } }

  .pd-card { background: #fff; border-radius: 14px; border: 1.5px solid #D6EAF8; overflow: hidden; }
  .pd-card-head { padding: 14px 18px; border-bottom: 1px solid #EBF5FB; display: flex; align-items: center; justify-content: space-between; }
  .pd-card-title { font-size: 14px; font-weight: 800; color: #154360; display: flex; align-items: center; gap: 8px; }
  .pd-card-link { font-size: 12px; font-weight: 700; color: #1A5276; cursor: pointer; background: none; border: none; font-family: 'Plus Jakarta Sans', sans-serif; }
  .pd-card-link:hover { text-decoration: underline; }
  .pd-card-body { padding: 14px 18px; }

  /* RANDEVU SIYAHISI */
  .pd-apt-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F4FAFD; }
  .pd-apt-row:last-child { border-bottom: none; }
  .pd-apt-ava { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #1A5276, #1F618D); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 800; flex-shrink: 0; }
  .pd-apt-name { font-size: 13px; font-weight: 700; color: #154360; }
  .pd-apt-time { font-size: 11px; color: #8DAFC4; margin-top: 2px; }
  .pd-apt-status { margin-left: auto; flex-shrink: 0; }
  .s-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .s-pending   { background: #EAF2F8; color: #D4AC0D; }
  .s-confirmed { background: #EAF2F8; color: #1A5276; }
  .s-completed { background: #EBF5FB; color: #1F618D; }

  /* RESEPTLƏRİM */
  .pd-presc-row { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F4FAFD; }
  .pd-presc-row:last-child { border-bottom: none; }
  .pd-presc-icon { width: 36px; height: 36px; border-radius: 10px; background: #EAF2F8; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .pd-presc-info { flex: 1; min-width: 0; }
  .pd-presc-doc { font-size: 13px; font-weight: 700; color: #154360; }
  .pd-presc-meds { font-size: 11px; color: #8DAFC4; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pd-cart-btn { padding: 6px 12px; background: linear-gradient(135deg,#1A5276,#1F618D); border: none; border-radius: 8px; color: #fff; font-size: 11px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; flex-shrink: 0; transition: all 0.18s; }
  .pd-cart-btn:hover { opacity: 0.9; }

  /* SKELETON */
  .skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .pd-empty { text-align: center; padding: 30px 20px; color: #B0C4D8; font-size: 13px; }
  .pd-empty span { font-size: 30px; display: block; margin-bottom: 8px; }
`;

const STATUS_MAP = {
  Pending:   { label: "Gözləyir",    cls: "s-pending" },
  Confirmed: { label: "Təsdiqləndi", cls: "s-confirmed" },
  Completed: { label: "Tamamlandı",  cls: "s-completed" },
};

export default function PatientDashboard() {
  const navigate = useNavigate();
  const patientName = localStorage.getItem("patientName") || "Xəstə";
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [cRes, pRes, oRes] = await Promise.allSettled([
          axios.get(`${API}/api/Consultation`, { headers: authHeader() }),
          axios.get(`${API}/api/Prescription`, { headers: authHeader() }),
          axios.get(`${API}/api/Order`,        { headers: authHeader() }),
        ]);
        const get = r => r.status === "fulfilled"
          ? (Array.isArray(r.value.data) ? r.value.data : r.value.data?.data || []) : [];
        setConsultations(get(cRes));
        setPrescriptions(get(pRes));
        setOrders(get(oRes));
      } catch { } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // Bu günün randevusu
  const todayApt = consultations.find(c => {
    const d = new Date(c.scheduledTime || c.scheduledDate);
    return d.toDateString() === new Date().toDateString() && c.status !== "Cancelled";
  });

  // Yaxın randevular (bu gündən sonrakı)
  const upcomingApts = consultations
    .filter(c => new Date(c.scheduledTime || c.scheduledDate) >= new Date() && c.status !== "Cancelled")
    .slice(0, 4);

  const recentPrescs = prescriptions.slice(-3).reverse();
  const activeOrders = orders.filter(o => o.status < 4).slice(0, 2);

  const today = new Date().toLocaleDateString("az-AZ", { weekday: "long", day: "2-digit", month: "long" });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Sabahınız xeyir";
    if (h < 18) return "Günortanız xeyir";
    return "Axşamınız xeyir";
  };

  const formatDT = (dt) => {
    if (!dt) return "—";
    const d = new Date(dt);
    return d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" }) + " " +
      d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
  };

  const initial = (name) => (name || "X").replace("Dr. ", "")[0]?.toUpperCase() || "X";

  return (
    <>
      <style>{styles}</style>

      {/* SALAMLAMA */}
      <div className="pd-greeting">
        <div>
          <div className="pd-greet-title">{greeting()}, {patientName}! 👋</div>
          <div className="pd-greet-sub">
            {todayApt
              ? `Bu gün ${todayApt.doctorName || "həkiminiz"} ilə görüşünüz var`
              : "Sağlıqlı qalmaq üçün müntəzəm yoxlama əsasdır"
            }
            <br />📅 {today}
          </div>
        </div>
        <div className="pd-quick-btns">
          <button className="pd-qbtn" onClick={() => navigate("doctors")}>🩺 Randevu Al</button>
          <button className="pd-qbtn" onClick={() => navigate("medicines")}>💊 Dərman Sifariş Et</button>
          <button className="pd-qbtn" onClick={() => navigate("prescriptions")}>📋 Reseptlər</button>
        </div>
      </div>

      {/* BU GÜN RANDEVU XƏBƏRDARLIQ */}
      {todayApt && !loading && (
        <div className="pd-alert">
          <div className="pd-alert-icon">⏰</div>
          <div className="pd-alert-text">
            <div className="pd-alert-title">Bu gün görüşünüz var!</div>
            <div className="pd-alert-sub">
              {todayApt.doctorName} — {formatDT(todayApt.scheduledTime || todayApt.scheduledDate)}
            </div>
          </div>
          <button className="pd-alert-btn" onClick={() => navigate("consultations")}>Bax →</button>
        </div>
      )}

      {/* STAT KARTLARI */}
      <div className="pd-stats">
        <div className="pd-stat" onClick={() => navigate("consultations")}>
          <div className="pd-stat-icon">🩺</div>
          <div className="pd-stat-val">{loading ? "—" : consultations.length}</div>
          <div className="pd-stat-label">Konsultasiyalar</div>
        </div>
        <div className="pd-stat" onClick={() => navigate("prescriptions")}>
          <div className="pd-stat-icon">📋</div>
          <div className="pd-stat-val">{loading ? "—" : prescriptions.length}</div>
          <div className="pd-stat-label">Reseptlər</div>
        </div>
        <div className="pd-stat" onClick={() => navigate("orders")}>
          <div className="pd-stat-icon">📦</div>
          <div className="pd-stat-val">{loading ? "—" : orders.length}</div>
          <div className="pd-stat-label">Sifarişlər</div>
        </div>
        <div className="pd-stat" onClick={() => navigate("orders")}>
          <div className="pd-stat-icon">🚚</div>
          <div className="pd-stat-val">{loading ? "—" : activeOrders.length}</div>
          <div className="pd-stat-label">Aktiv sifariş</div>
        </div>
      </div>

      {/* ANA MƏZMUN */}
      <div className="pd-main-grid">
        {/* YAXIN RANDEVULAR */}
        <div className="pd-card">
          <div className="pd-card-head">
            <div className="pd-card-title">📅 Yaxın Randevular</div>
            <button className="pd-card-link" onClick={() => navigate("consultations")}>Hamısına bax →</button>
          </div>
          <div className="pd-card-body">
            {loading ? (
              <><div className="skel-line" /><div className="skel-line" /><div className="skel-line" /></>
            ) : upcomingApts.length === 0 ? (
              <div className="pd-empty"><span>📅</span>Yaxın randevu yoxdur</div>
            ) : upcomingApts.map(apt => {
              const st = STATUS_MAP[apt.status] || STATUS_MAP.Pending;
              return (
                <div className="pd-apt-row" key={apt.id}>
                  <div className="pd-apt-ava">{initial(apt.doctorName)}</div>
                  <div>
                    <div className="pd-apt-name">{apt.doctorName || `Həkim #${apt.doctorId}`}</div>
                    <div className="pd-apt-time">📅 {formatDT(apt.scheduledTime || apt.scheduledDate)}</div>
                  </div>
                  <div className="pd-apt-status">
                    <span className={`s-pill ${st.cls}`}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SON RESEPTLƏRİM */}
        <div className="pd-card">
          <div className="pd-card-head">
            <div className="pd-card-title">📋 Son Reseptlər</div>
            <button className="pd-card-link" onClick={() => navigate("prescriptions")}>Hamısına bax →</button>
          </div>
          <div className="pd-card-body">
            {loading ? (
              <><div className="skel-line" /><div className="skel-line" /></>
            ) : recentPrescs.length === 0 ? (
              <div className="pd-empty"><span>📋</span>Resept yoxdur</div>
            ) : recentPrescs.map(presc => (
              <div className="pd-presc-row" key={presc.id}>
                <div className="pd-presc-icon">💊</div>
                <div className="pd-presc-info">
                  <div className="pd-presc-doc">{presc.consultationInfo || `Resept #${presc.id}`}</div>
                  <div className="pd-presc-meds">
                    {(presc.items || []).map(i => i.medicineName).join(", ") || "Dərmanlar..."}
                  </div>
                </div>
                <button className="pd-cart-btn" onClick={() => navigate("prescriptions")}>🛒</button>
              </div>
            ))}
          </div>
        </div>

        {/* AKTİV SİFARİŞLƏR */}
        {activeOrders.length > 0 && (
          <div className="pd-card" style={{ gridColumn: "1 / -1" }}>
            <div className="pd-card-head">
              <div className="pd-card-title">🚚 Aktiv Sifarişlər</div>
              <button className="pd-card-link" onClick={() => navigate("orders")}>Hamısına bax →</button>
            </div>
            <div className="pd-card-body">
              {activeOrders.map(o => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid #F4FAFD" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1F618D,#1A5276)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    #{o.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#154360" }}>{o.shippingAddress}</div>
                    <div style={{ fontSize: 11, color: "#8DAFC4" }}>{o.totalAmount} ₼</div>
                  </div>
                  <span style={{ fontSize: 18 }}>{o.status === 3 ? "🚚" : o.status === 2 ? "⚗️" : "📦"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}