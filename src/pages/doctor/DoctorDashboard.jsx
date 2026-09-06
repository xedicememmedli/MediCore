import { useState, useEffect } from "react";
import axios from "axios";
import { SkeletonStats, SkeletonList } from "../../components/SkeletonLoader";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockStats = { totalConsultations: 124, todayConsultations: 5, totalPrescriptions: 89, pendingConsultations: 3 };
const mockToday = [
  { id: 1, patientName: "Nigar Məmmədova", scheduledTime: "2026-03-06T09:00:00", status: "Confirmed", notes: "Ürək ağrısı" },
  { id: 2, patientName: "Rauf Əliyev", scheduledTime: "2026-03-06T10:30:00", status: "Pending", notes: "Baş ağrısı" },
  { id: 3, patientName: "Sevinc Hüseynova", scheduledTime: "2026-03-06T13:00:00", status: "Confirmed", notes: "" },
  { id: 4, patientName: "Kamran Babayev", scheduledTime: "2026-03-06T15:00:00", status: "Pending", notes: "İlk müayinə" },
  { id: 5, patientName: "Aytən Nəcəfova", scheduledTime: "2026-03-06T16:30:00", status: "Completed", notes: "Yoxlama" },
];

const STATUS_CONFIG = {
  Pending:   { label: "Gözləyir",    cls: "s-pending",   icon: "⏳" },
  Confirmed: { label: "Təsdiqləndi", cls: "s-confirmed", icon: "✅" },
  Completed: { label: "Tamamlandı",  cls: "s-completed", icon: "🏁" },
  Cancelled: { label: "Ləğv edildi", cls: "s-cancelled", icon: "❌" },
};

const styles = `
  .dash-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px; margin-bottom: 24px;
  }
  .stat-card {
    background: #fff; border-radius: 14px;
    border: 1.5px solid #D6EAF8; padding: 20px;
    display: flex; align-items: center; gap: 16px;
    transition: all 0.2s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(31,97,141,0.1); border-color: #AED6F1; }
  .stat-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; flex-shrink: 0;
  }
  .si-blue  { background: linear-gradient(135deg, #EBF5FB, #D6EAF8); }
  .si-teal  { background: linear-gradient(135deg, #EAF2F8, #D6EAF8); }
  .si-yellow{ background: linear-gradient(135deg, #EAF2F8, #FCF3CF); }
  .si-red   { background: linear-gradient(135deg, #FDEDEC, #FADBD8); }
  .stat-val { font-size: 26px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .stat-label { font-size: 12px; color: #5D8AA8; font-weight: 600; }

  .section-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .section-title { font-size: 15px; font-weight: 800; color: #154360; }
  .section-sub { font-size: 12px; color: #5D8AA8; }

  .today-list { display: flex; flex-direction: column; gap: 10px; }
  .appt-card {
    background: #fff; border-radius: 12px;
    border: 1.5px solid #D6EAF8; padding: 14px 16px;
    display: flex; align-items: center; gap: 14px;
    transition: all 0.18s;
  }
  .appt-card:hover { border-color: #AED6F1; box-shadow: 0 4px 14px rgba(31,97,141,0.07); }
  .appt-time {
    min-width: 56px; text-align: center;
    background: linear-gradient(135deg, #EBF5FB, #D6EAF8);
    border-radius: 10px; padding: 8px 6px;
    border: 1px solid #D6EAF8;
  }
  .appt-time-val { font-size: 14px; font-weight: 800; color: #1F618D; }
  .appt-time-label { font-size: 9px; color: #5D8AA8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .appt-info { flex: 1; }
  .appt-name { font-size: 14px; font-weight: 700; color: #154360; margin-bottom: 3px; }
  .appt-note { font-size: 12px; color: #5D8AA8; }

  .s-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
    white-space: nowrap;
  }
  .s-pending   { background: #EAF2F8; color: #D4AC0D; }
  .s-confirmed { background: #EAF2F8; color: #1A5276; }
  .s-completed { background: #EBF5FB; color: #1F618D; }
  .s-cancelled { background: #FDEDEC; color: #E74C3C; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }

  .info-card {
    background: #fff; border-radius: 14px;
    border: 1.5px solid #D6EAF8; padding: 20px;
  }
  .quick-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
  .qa-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px; border-radius: 10px;
    border: 1.5px solid #D6EAF8; background: #F8FCFF;
    color: #1F618D; font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
    text-decoration: none;
  }
  .qa-btn:hover { background: #EBF5FB; border-color: #AED6F1; transform: translateX(3px); }
  .qa-icon { font-size: 18px; }

  .welcome-banner {
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    border-radius: 14px; padding: 20px 24px;
    margin-bottom: 22px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
  }
  .wb-title { font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 5px; }
  .wb-sub { font-size: 13px; color: rgba(255,255,255,0.7); }
  .wb-icon { font-size: 52px; opacity: 0.8; }
`;

function formatTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
}

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const doctorName = localStorage.getItem("doctorName") || "Həkim";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Sabahınız xeyir" : hour < 18 ? "Günortanız xeyir" : "Axşamınız xeyir";

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [conRes] = await Promise.all([
          axios.get(`${API}/api/Consultation`, { headers: authHeader() }),
        ]);
        const all = Array.isArray(conRes.data) ? conRes.data : conRes.data?.data || [];
        const todayStr = new Date().toDateString();
        const todayItems = all.filter(c => new Date(c.scheduledTime || c.scheduledDate).toDateString() === todayStr);
        setStats({
          totalConsultations: all.length,
          todayConsultations: todayItems.length,
          totalPrescriptions: 0,
          pendingConsultations: all.filter(c => c.status === "Pending").length,
        });
        setToday(todayItems.slice(0, 6));
      } catch {
        setStats(mockStats);
        setToday(mockToday);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const STAT_CARDS = [
    { icon: "📅", iconCls: "si-blue",   val: stats?.totalConsultations || 0,  label: "Ümumi Konsultasiya" },
    { icon: "🕐", iconCls: "si-teal",   val: stats?.todayConsultations || 0,  label: "Bugünkü Randevu" },
    { icon: "📋", iconCls: "si-yellow", val: stats?.totalPrescriptions || 0,  label: "Yazılmış Resept" },
    { icon: "⏳", iconCls: "si-red",    val: stats?.pendingConsultations || 0, label: "Gözləyən Randevu" },
  ];

  return (
    <>
      <style>{styles}</style>

      <div className="welcome-banner">
        <div>
          <div className="wb-title">{greeting}, {doctorName}! 👋</div>
          <div className="wb-sub">
            Bugün {new Date().toLocaleDateString("az-AZ", { weekday: "long", day: "numeric", month: "long" })} — {stats?.todayConsultations || 0} randevunuz var
          </div>
        </div>
        <div className="wb-icon">🩺</div>
      </div>

      {/* STATİSTİKA */}
      {loading ? <SkeletonStats count={4} /> : (
        <div className="dash-grid">
          {STAT_CARDS.map((c, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${c.iconCls}`}>{c.icon}</div>
              <div>
                <div className="stat-val">{c.val}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="two-col">
        {/* BUGÜNKÜ RANDEVULAR */}
        <div>
          <div className="section-head">
            <div className="section-title">📅 Bugünkü Randevular</div>
            <div className="section-sub">{today.length} randevu</div>
          </div>
          <div className="today-list">
            {loading ? (
              <SkeletonList count={4} />
            ) : today.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "#B0C4D8", fontSize: 13 }}>
                Bugün randevu yoxdur 🎉
              </div>
            ) : (
              today.map(item => {
                const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
                return (
                  <div className="appt-card" key={item.id}>
                    <div className="appt-time">
                      <div className="appt-time-val">{formatTime(item.scheduledTime || item.scheduledDate)}</div>
                      <div className="appt-time-label">saat</div>
                    </div>
                    <div className="appt-info">
                      <div className="appt-name">{item.patientName || `Xəstə #${item.patientId}`}</div>
                      {item.notes && <div className="appt-note">{item.notes}</div>}
                    </div>
                    <span className={`s-pill ${st.cls}`}>{st.icon} {st.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SÜRƏTLI ƏMƏLIYYATLAR */}
        <div>
          <div className="section-head">
            <div className="section-title">⚡ Sürətli Əməliyyatlar</div>
          </div>
          <div className="info-card">
            <div className="quick-actions">
              {[
                { icon: "📅", label: "Bütün randevularıma bax", to: "../appointments" },
                { icon: "📋", label: "Yeni resept yaz", to: "../prescriptions" },
                { icon: "💬", label: "Mesajlarıma bax", to: "../chat" },
                { icon: "👤", label: "Profilimi redaktə et", to: "../profile" },
              ].map((qa, i) => (
                <a key={i} className="qa-btn" href={qa.to}>
                  <span className="qa-icon">{qa.icon}</span>
                  {qa.label}
                  <span style={{ marginLeft: "auto", color: "#AED6F1" }}>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}