import { useState } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import ErrorBoundary from "../../components/ErrorBoundary";
import PatientDashboard from "./PatientDashboard";
import PatientConsultations from "./PatientConsultations";
import PatientPrescriptions from "./PatientPrescriptions";
import PatientBasket from "./PatientBasket";
import PatientOrders from "./PatientOrders";
import PatientChat from "./PatientChat";
import PatientProfile from "./PatientProfile";
import PatientDoctors from "./PatientDoctors";
import PatientMedicines from "./PatientMedicines";
import PatientLabResults from "./PatientLabResults";
import NotificationBell from "../../components/NotificationBell";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F0F7FF; }

  .pl-root { display: flex; min-height: 100vh; }

  .pl-sidebar {
    width: 240px; flex-shrink: 0;
    background: linear-gradient(180deg, #154360 0%, #1A5276 60%, #1F618D 100%);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
  }
  .pl-logo {
    padding: 22px 20px 18px; border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; gap: 10px;
  }
  .pl-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .pl-logo-text { font-size: 17px; font-weight: 800; color: #fff; }
  .pl-logo-sub { font-size: 10px; color: rgba(255,255,255,0.5); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }

  .pl-patient-card {
    margin: 14px 12px; padding: 12px;
    background: rgba(255,255,255,0.1); border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; gap: 10px;
  }
  .pl-pat-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #1F618D, #2E86C1); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .pl-pat-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pl-pat-label { font-size: 10px; color: rgba(255,255,255,0.55); font-weight: 600; }

  .pl-nav { flex: 1; padding: 8px 10px; overflow-y: auto; }
  .pl-nav::-webkit-scrollbar { width: 0; }
  .pl-section-label { font-size: 9px; font-weight: 800; color: rgba(255,255,255,0.35); letter-spacing: 1.2px; text-transform: uppercase; padding: 10px 10px 6px; }
  .pl-nav a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: rgba(255,255,255,0.65); font-size: 13px; font-weight: 600; transition: all 0.18s; margin-bottom: 2px; position: relative; }
  .pl-nav a:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .pl-nav a.active { background: rgba(255,255,255,0.18); color: #fff; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .pl-nav a.active::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px; border-radius: 0 3px 3px 0; background: #fff; }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-badge { margin-left: auto; background: #E74C3C; color: #fff; font-size: 10px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }

  .pl-logout-wrap { padding: 12px 10px; border-top: 1px solid rgba(255,255,255,0.1); }
  .pl-logout { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; background: none; border: none; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }
  .pl-logout:hover { background: rgba(231,76,60,0.2); color: #E74C3C; }

  .pl-main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
  .pl-topbar { height: 60px; background: #fff; border-bottom: 1px solid #EBF5FB; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 99; box-shadow: 0 1px 8px rgba(31,97,141,0.06); }
  .pl-breadcrumb { font-size: 13px; color: #5D8AA8; font-weight: 600; }
  .pl-breadcrumb strong { color: #154360; }
  .pl-topbar-right { display: flex; align-items: center; gap: 12px; }
  .pl-today { font-size: 12px; color: #5D8AA8; font-weight: 600; background: #EAF2F8; padding: 5px 12px; border-radius: 20px; border: 1px solid #AED6F1; }
  .pl-notif-btn { width: 36px; height: 36px; border-radius: 10px; background: #EAF2F8; border: 1px solid #AED6F1; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; transition: all 0.18s; position: relative; }
  .pl-notif-btn:hover { background: #D6EAF8; }
  .notif-dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: #E74C3C; border: 2px solid #fff; }
  .pl-user-pill { display: flex; align-items: center; gap: 8px; background: #EAF2F8; border: 1px solid #AED6F1; border-radius: 20px; padding: 4px 12px 4px 4px; cursor: pointer; transition: all 0.18s; }
  .pl-user-pill:hover { background: #D6EAF8; }
  .pl-user-ava { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #1A5276, #1F618D); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff; }
  .pl-user-name { font-size: 12px; font-weight: 700; color: #154360; }
  .pl-page { flex: 1; padding: 24px; }
`;

const NAV_ITEMS = [
  { section: "Əsas", items: [{ to: "/patient/dashboard", icon: "📊", label: "İdarə Paneli" }] },
  { section: "Tibbi", items: [
    { to: "/patient/consultations", icon: "🩺", label: "Konsultasiyalarım" },
    { to: "/patient/prescriptions", icon: "📋", label: "Reseptlərim" },
    { to: "/patient/lab-results",   icon: "🔬", label: "Analiz Nəticələri" },
  ]},
  { section: "Mağaza", items: [
    { to: "/patient/medicines", icon: "💊", label: "Dərmanlar" },
    { to: "/patient/basket", icon: "🛒", label: "Səbətim" },
    { to: "/patient/orders", icon: "📦", label: "Sifarişlərim" },
  ]},
  { section: "Həkimlər", items: [
    { to: "/patient/doctors", icon: "👨‍⚕️", label: "Həkimlər" },
  ]},
  { section: "Kommunikasiya", items: [
    { to: "/patient/chat", icon: "💬", label: "Mesajlar", badge: 2 },
  ]},
  { section: "Hesab", items: [
    { to: "/patient/profile", icon: "👤", label: "Profilim" },
  ]},
];

export default function PatientLayout() {
  const navigate = useNavigate();
  const patientName = localStorage.getItem("patientName") || "Pasient";
  const initial = patientName[0]?.toUpperCase() || "X";
  const today = new Date().toLocaleDateString("az-AZ", { day: "2-digit", month: "long", year: "numeric" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("patientName");
    navigate("/login");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pl-root">
        <aside className="pl-sidebar">
          <div className="pl-logo">
            <div className="pl-logo-icon">🏥</div>
            <div>
              <div className="pl-logo-text">MediCore</div>
              <div className="pl-logo-sub">Pasient Paneli</div>
            </div>
          </div>
          <div className="pl-patient-card">
            <div className="pl-pat-avatar">{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div className="pl-pat-name">{patientName}</div>
              <div className="pl-pat-label">Pasient</div>
            </div>
          </div>
          <nav className="pl-nav">
            {NAV_ITEMS.map(section => (
              <div key={section.section}>
                <div className="pl-section-label">{section.section}</div>
                {section.items.map(item => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "active" : ""}>
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="pl-logout-wrap">
            <button className="pl-logout" onClick={handleLogout}>
              <span className="nav-icon">🚪</span> Çıxış
            </button>
          </div>
        </aside>

        <div className="pl-main">
          <header className="pl-topbar">
            <span className="pl-breadcrumb">MediCore / <strong>Pasient Paneli</strong></span>
            <div className="pl-topbar-right">
              <span className="pl-today">📅 {today}</span>
              <div className="pl-notif-btn"><NotificationBell /></div>
              <div className="pl-user-pill">
                <div className="pl-user-ava">{initial}</div>
                <span className="pl-user-name">{patientName}</span>
              </div>
            </div>
          </header>
          <main className="pl-page">
            <ErrorBoundary>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="consultations" element={<PatientConsultations />} />
                <Route path="prescriptions" element={<PatientPrescriptions />} />
                <Route path="medicines" element={<PatientMedicines />} />
                <Route path="basket" element={<PatientBasket />} />
                <Route path="orders" element={<PatientOrders />} />
                <Route path="doctors" element={<PatientDoctors />} />
                <Route path="lab-results" element={<PatientLabResults />} />
                <Route path="chat" element={<PatientChat />} />
                <Route path="profile" element={<PatientProfile />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </>
  );
}