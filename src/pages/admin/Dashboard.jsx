import { useState, useEffect } from "react";
import axios from "axios";
import { SkeletonStats, SkeletonTable } from "../../components/SkeletonLoader";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const COLORS = ["#1F618D", "#1A5276", "#1F618D", "#2E86C1", "#148F77", "#5DADE2"];

const styles = `
  .dash-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
  @media (max-width: 1100px) { .dash-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px)  { .dash-grid { grid-template-columns: 1fr 1fr; } }

  .stat-card {
    background: #fff; border-radius: 14px; border: 1.5px solid #D6EAF8;
    padding: 18px 20px; transition: all 0.2s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(21,67,96,0.08); }
  .stat-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .stat-trend { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
  .trend-up   { background: #EAF2F8; color: #1A5276; }
  .trend-down { background: #FDF2F2; color: #E74C3C; }
  .stat-val { font-size: 28px; font-weight: 800; color: #154360; margin-bottom: 4px; }
  .stat-label { font-size: 12px; color: #5D8AA8; font-weight: 600; }

  .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
  @media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } }
  .charts-row2 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 22px; }
  @media (max-width: 900px) { .charts-row2 { grid-template-columns: 1fr; } }

  .chart-card { background: #fff; border-radius: 14px; border: 1.5px solid #D6EAF8; padding: 20px; }
  .chart-title { font-size: 14px; font-weight: 800; color: #154360; margin-bottom: 4px; }
  .chart-sub { font-size: 12px; color: #5D8AA8; margin-bottom: 18px; }

  .recent-table { width: 100%; border-collapse: collapse; }
  .recent-table th { text-align: left; font-size: 10px; font-weight: 800; color: #8DAFC4; letter-spacing: 0.5px; text-transform: uppercase; padding: 8px 12px; background: #F8FCFF; border-bottom: 1px solid #EBF5FB; }
  .recent-table td { padding: 11px 12px; font-size: 13px; border-bottom: 1px solid #F4FAFD; color: #1A252F; }
  .recent-table tr:last-child td { border-bottom: none; }
  .recent-table tr:hover td { background: #FAFFFD; }

  .s-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .s-pending   { background: #EAF2F8; color: #D4AC0D; }
  .s-confirmed { background: #EAF2F8; color: #1A5276; }
  .s-completed { background: #EBF5FB; color: #1F618D; }
  .s-cancelled { background: #FDEDEC; color: #E74C3C; }

  .pg-header { margin-bottom: 22px; }
  .pg-header h1 { font-size: 21px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pg-header p { font-size: 13px; color: #5D8AA8; }

  .skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 10px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .top-docs-list { display: flex; flex-direction: column; gap: 10px; }
  .top-doc-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #F8FCFF; border-radius: 10px; border: 1px solid #EBF5FB; transition: all 0.15s; }
  .top-doc-row:hover { border-color: #AED6F1; background: #EAF2F8; }
  .top-doc-rank { width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(135deg, #1F618D, #2E86C1); color: #fff; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .top-doc-rank.gold { background: linear-gradient(135deg, #D4AC0D, #F1C40F); }
  .top-doc-rank.silver { background: linear-gradient(135deg, #7F8C8D, #95A5A6); }
  .top-doc-rank.bronze { background: linear-gradient(135deg, #A04000, #CA6F1E); }
  .top-doc-name { flex: 1; font-size: 13px; font-weight: 700; color: #154360; }
  .top-doc-count { font-size: 12px; font-weight: 800; color: #1A5276; }
`;

const MONTHS = ["Yan","Fev","Mar","Apr","May","İyun","İyul","Avq","Sen","Okt","Noy","Dek"];

function buildMonthlyData(consultations) {
  const counts = {};
  consultations.forEach(c => {
    const d = new Date(c.scheduledTime || c.scheduledDate || c.createdAt);
    if (!isNaN(d)) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      counts[key] = (counts[key] || 0) + 1;
    }
  });
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    return { name: MONTHS[d.getMonth()], Konsultasiya: counts[key] || 0 };
  });
}

function buildTopDoctors(consultations, doctors) {
  const counts = {};
  consultations.forEach(c => {
    if (c.doctorId) counts[c.doctorId] = (counts[c.doctorId] || 0) + 1;
  });
  return doctors
    .map(d => ({ name: d.appUserName || d.name || `Həkim #${d.id}`, count: counts[d.id] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function buildStatusPie(consultations) {
  const counts = { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
  consultations.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++; });
  return [
    { name: "Gözləyir",    value: counts.Pending },
    { name: "Təsdiqləndi", value: counts.Confirmed },
    { name: "Tamamlandı",  value: counts.Completed },
    { name: "Ləğv edildi", value: counts.Cancelled },
  ].filter(x => x.value > 0);
}

function buildOrderMonthly(orders) {
  const revenue = {};
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    if (!isNaN(d)) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      revenue[key] = (revenue[key] || 0) + (o.totalAmount || 0);
    }
  });
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    return { name: MONTHS[d.getMonth()], Gəlir: Math.round(revenue[key] || 0) };
  });
}

const STATUS_CONFIG = {
  Pending:   { label: "Gözləyir",    cls: "s-pending" },
  Confirmed: { label: "Təsdiqləndi", cls: "s-confirmed" },
  Completed: { label: "Tamamlandı",  cls: "s-completed" },
  Cancelled: { label: "Ləğv edildi", cls: "s-cancelled" },
};

function StatCard({ icon, iconBg, label, value, trend, loading }) {
  return (
    <div className="stat-card">
      {loading ? (
        <>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EBF5FB", marginBottom: 12 }} />
          <div className="skel-line" style={{ width: "60%" }} />
          <div className="skel-line" style={{ width: "40%" }} />
        </>
      ) : (
        <>
          <div className="stat-top">
            <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
            {trend && <span className={`stat-trend ${trend.startsWith("+") ? "trend-up" : "trend-down"}`}>{trend}</span>}
          </div>
          <div className="stat-val">{value}</div>
          <div className="stat-label">{label}</div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors]             = useState([]);
  const [patients, setPatients]           = useState([]);
  const [orders, setOrders]               = useState([]);
  const [medicines, setMedicines]         = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [cRes, dRes, pRes, oRes, mRes] = await Promise.allSettled([
          axios.get(`${API}/api/Consultation`, { headers: authHeader() }),
          axios.get(`${API}/api/Doctor`,       { headers: authHeader() }),
          axios.get(`${API}/api/User/GetAllPatients`, { headers: authHeader() }),
          axios.get(`${API}/api/Order`,        { headers: authHeader() }),
          axios.get(`${API}/api/Medicine`,     { headers: authHeader() }),
        ]);
        const get = (r) => r.status === "fulfilled"
          ? (Array.isArray(r.value.data) ? r.value.data : r.value.data?.data || []) : [];
        setConsultations(get(cRes));
        setDoctors(get(dRes));
        setPatients(get(pRes));
        setOrders(get(oRes));
        setMedicines(get(mRes));
      } catch { /* mock fallback */ } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const today = new Date().toLocaleDateString("az-AZ", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const adminName = localStorage.getItem("userName") || "Admin";

  const todayConsults = consultations.filter(c => {
    const d = new Date(c.scheduledTime || c.scheduledDate);
    return d.toDateString() === new Date().toDateString();
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const lowStock = medicines.filter(m => m.stockCount !== undefined && m.stockCount < 10);

  const monthlyConsults = buildMonthlyData(consultations);
  const monthlyRevenue  = buildOrderMonthly(orders);
  const statusPie       = buildStatusPie(consultations);
  const topDoctors      = buildTopDoctors(consultations, doctors);
  const recentConsults  = [...consultations].reverse().slice(0, 6);

  const rankClass = (i) => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <h1>Salam, {adminName} 👋</h1>
        <p>📅 {today}</p>
      </div>

      {/* STAT KARTLARI */}
      <div className="dash-grid">
        <StatCard loading={loading} icon="🩺" iconBg="#EAF2F8" label="Ümumi Konsultasiya" value={consultations.length} trend={`+${todayConsults.length} bu gün`} />
        <StatCard loading={loading} icon="👨‍⚕️" iconBg="#EBF5FB" label="Həkimlər" value={doctors.length} />
        <StatCard loading={loading} icon="👥" iconBg="#F0F4FF" label="Xəstələr" value={patients.length} />
        <StatCard loading={loading} icon="💰" iconBg="#EAF2F8" label="Ümumi Gəlir" value={`${Math.round(totalRevenue)} ₼`} trend="+12%" />
      </div>
      <div className="dash-grid">
        <StatCard loading={loading} icon="📦" iconBg="#EAF2F8" label="Sifarişlər" value={orders.length} />
        <StatCard loading={loading} icon="💊" iconBg="#FDF2F8" label="Dərmanlar" value={medicines.length} />
        <StatCard loading={loading} icon="⚠️" iconBg="#EAF2F8" label="Az stokda dərman" value={lowStock.length} trend={lowStock.length > 0 ? `${lowStock.length} kritik` : undefined} />
        <StatCard loading={loading} icon="📅" iconBg="#EAF2F8" label="Bu gün görüş" value={todayConsults.length} />
      </div>

      {/* QRAFİKLƏR — cərgə 1 */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-title">Aylıq Konsultasiyalar</div>
          <div className="chart-sub">Son 6 ay üzrə konsultasiya sayı</div>
          {loading ? <div style={{ height: 180 }}><div className="skel-line" /><div className="skel-line" /></div> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyConsults}>
                <defs>
                  <linearGradient id="cgConsult" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1A5276" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1A5276" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBF5FB" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8DAFC4" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8DAFC4" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1.5px solid #D6EAF8", fontSize: 12 }} />
                <Area type="monotone" dataKey="Konsultasiya" stroke="#1A5276" strokeWidth={2.5} fill="url(#cgConsult)" dot={{ r: 4, fill: "#1A5276" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-title">Konsultasiya Statusları</div>
          <div className="chart-sub">Ümumi bölgü</div>
          {loading ? <div style={{ height: 180 }}><div className="skel-line" /></div> : statusPie.length === 0 ? (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#B0C4D8", fontSize: 13 }}>Data yoxdur</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1.5px solid #D6EAF8", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* QRAFİKLƏR — cərgə 2 */}
      <div className="charts-row2">
        <div className="chart-card">
          <div className="chart-title">Aylıq Gəlir (₼)</div>
          <div className="chart-sub">Sifarişlərdən gələn gəlir</div>
          {loading ? <div style={{ height: 180 }}><div className="skel-line" /></div> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyRevenue} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBF5FB" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8DAFC4" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8DAFC4" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1.5px solid #D6EAF8", fontSize: 12 }} formatter={(v) => [`${v} ₼`, "Gəlir"]} />
                <Bar dataKey="Gəlir" fill="url(#barGrad)" radius={[6,6,0,0]}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1F618D" /><stop offset="100%" stopColor="#2E86C1" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-title">🏆 Top Həkimlər</div>
          <div className="chart-sub">Ən çox konsultasiya aparan</div>
          {loading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skel-line" />)}</div>
          ) : topDoctors.length === 0 ? (
            <div style={{ color: "#B0C4D8", fontSize: 13, padding: "20px 0" }}>Data yoxdur</div>
          ) : (
            <div className="top-docs-list">
              {topDoctors.map((d, i) => (
                <div className="top-doc-row" key={i}>
                  <div className={`top-doc-rank ${rankClass(i)}`}>{i + 1}</div>
                  <div className="top-doc-name">{d.name}</div>
                  <div className="top-doc-count">{d.count} qəbul</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SON KONSULTASİYALAR */}
      <div className="chart-card">
        <div className="chart-title">Son Konsultasiyalar</div>
        <div className="chart-sub">Ən son 6 konsultasiya</div>
        {loading ? (
          <div>{[1,2,3].map(i => <div key={i} className="skel-line" />)}</div>
        ) : recentConsults.length === 0 ? (
          <div style={{ color: "#B0C4D8", fontSize: 13, padding: "20px 0", textAlign: "center" }}>Konsultasiya yoxdur</div>
        ) : (
          <table className="recent-table">
            <thead>
              <tr>
                <th>#</th><th>Həkim</th><th>Tarix</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentConsults.map(c => {
                const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.Pending;
                const dt = new Date(c.scheduledTime || c.scheduledDate);
                return (
                  <tr key={c.id}>
                    <td style={{ color: "#8DAFC4", fontWeight: 700 }}>#{c.id}</td>
                    <td style={{ fontWeight: 700 }}>{c.doctorName || `Həkim #${c.doctorId}`}</td>
                    <td>{isNaN(dt) ? "—" : dt.toLocaleDateString("az-AZ", { day:"2-digit", month:"2-digit", year:"numeric" }) + " " + dt.toLocaleTimeString("az-AZ", { hour:"2-digit", minute:"2-digit" })}</td>
                    <td><span className={`s-pill ${st.cls}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}