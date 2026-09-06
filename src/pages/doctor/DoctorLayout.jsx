import { useState } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import DoctorDashboard from "./DoctorDashboard";
import MyAppointments from "./MyAppointments";
import MyPrescriptions from "./MyPrescriptions";
import DoctorChat from "./DoctorChat";
import DoctorProfile from "./DoctorProfile";
import NotificationBell from "../../components/NotificationBell";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F0F7FF; }

  .dl-root { display: flex; min-height: 100vh; }

  /* SIDEBAR */
  .dl-sidebar {
    width: 240px; flex-shrink: 0;
    background: linear-gradient(180deg, #154360 0%, #1F618D 60%, #2E86C1 100%);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 100; transition: all 0.3s;
  }

  .dl-logo {
    padding: 22px 20px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; gap: 10px;
  }
  .dl-logo-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .dl-logo-text { font-size: 17px; font-weight: 800; color: #fff; }
  .dl-logo-sub { font-size: 10px; color: rgba(255,255,255,0.5); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }

  /* HƏKİM PROFİL KARTI */
  .dl-doctor-card {
    margin: 14px 12px;
    padding: 12px;
    background: rgba(255,255,255,0.1);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; gap: 10px;
  }
  .dl-doc-avatar {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, #1F618D, #1A5276);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0;
  }
  .dl-doc-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dl-doc-spec { font-size: 10px; color: rgba(255,255,255,0.55); font-weight: 600; }

  .dl-nav { flex: 1; padding: 8px 10px; overflow-y: auto; }
  .dl-nav::-webkit-scrollbar { width: 0; }

  .dl-section-label {
    font-size: 9px; font-weight: 800; color: rgba(255,255,255,0.35);
    letter-spacing: 1.2px; text-transform: uppercase;
    padding: 10px 10px 6px;
  }

  .dl-nav a {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    text-decoration: none; color: rgba(255,255,255,0.65);
    font-size: 13px; font-weight: 600;
    transition: all 0.18s; margin-bottom: 2px; position: relative;
  }
  .dl-nav a:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .dl-nav a.active {
    background: rgba(255,255,255,0.18);
    color: #fff; font-weight: 700;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .dl-nav a.active::before {
    content: ''; position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: #1F618D;
  }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .nav-badge {
    margin-left: auto; background: #E74C3C; color: #fff;
    font-size: 10px; font-weight: 800;
    min-width: 18px; height: 18px; padding: 0 4px;
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
  }

  .dl-logout-wrap {
    padding: 12px 10px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .dl-logout {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.18s; background: none; border: none;
    width: 100%; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .dl-logout:hover { background: rgba(231,76,60,0.2); color: #E74C3C; }

  /* ANA MƏZMUN */
  .dl-main {
    margin-left: 240px; flex: 1;
    display: flex; flex-direction: column; min-height: 100vh;
  }

  /* TOPBAR */
  .dl-topbar {
    height: 60px; background: #fff;
    border-bottom: 1px solid #EBF5FB;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; position: sticky; top: 0; z-index: 99;
    box-shadow: 0 1px 8px rgba(31,97,141,0.06);
  }
  .dl-topbar-left { display: flex; align-items: center; gap: 8px; }
  .dl-breadcrumb { font-size: 13px; color: #5D8AA8; font-weight: 600; }
  .dl-breadcrumb strong { color: #154360; }

  .dl-topbar-right { display: flex; align-items: center; gap: 12px; }
  .dl-today {
    font-size: 12px; color: #5D8AA8; font-weight: 600;
    background: #EBF5FB; padding: 5px 12px; border-radius: 20px;
    border: 1px solid #D6EAF8;
  }
  .dl-notif-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; cursor: pointer; transition: all 0.18s; position: relative;
  }
  .dl-notif-btn:hover { background: #D6EAF8; }
  .notif-dot {
    position: absolute; top: 6px; right: 6px;
    width: 8px; height: 8px; border-radius: 50%;
    background: #E74C3C; border: 2px solid #fff;
  }
  .dl-user-pill {
    display: flex; align-items: center; gap: 8px;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    border-radius: 20px; padding: 4px 12px 4px 4px;
    cursor: pointer; transition: all 0.18s;
  }
  .dl-user-pill:hover { background: #D6EAF8; }
  .dl-user-ava {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: #fff;
  }
  .dl-user-name { font-size: 12px; font-weight: 700; color: #154360; }

  /* PAGE */
  .dl-page { flex: 1; padding: 24px; }
`;

const NAV_ITEMS = [
  { section: "Əsas", items: [
    { to: "/doctor/dashboard", icon: "📊", label: "İdarə Paneli" },
  ]},
  { section: "Tibbi", items: [
    { to: "/doctor/appointments", icon: "📅", label: "Randevularım" },
    { to: "/doctor/prescriptions", icon: "📋", label: "Reseptlərim" },
  ]},
  { section: "Kommunikasiya", items: [
    { to: "/doctor/chat", icon: "💬", label: "Mesajlar", badge: 3 },
  ]},
  { section: "Hesab", items: [
    { to: "/doctor/profile", icon: "👤", label: "Profilim" },
  ]},
];

export default function DoctorLayout() {
  const navigate = useNavigate();
  const doctorName = localStorage.getItem("doctorName") || "Dr. İstifadəçi";
  const doctorSpec = localStorage.getItem("doctorSpec") || "Həkim";
  const initial = doctorName.replace("Dr. ", "")[0]?.toUpperCase() || "D";

  const today = new Date().toLocaleDateString("az-AZ", { day: "2-digit", month: "long", year: "numeric" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("doctorName");
    navigate("/login");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dl-root">
        {/* SIDEBAR */}
        <aside className="dl-sidebar">
          <div className="dl-logo">
            <div className="dl-logo-icon">🏥</div>
            <div>
              <div className="dl-logo-text">MediCore</div>
              <div className="dl-logo-sub">Həkim Paneli</div>
            </div>
          </div>

          <div className="dl-doctor-card">
            <div className="dl-doc-avatar">{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div className="dl-doc-name">{doctorName}</div>
              <div className="dl-doc-spec">{doctorSpec}</div>
            </div>
          </div>

          <nav className="dl-nav">
            {NAV_ITEMS.map(section => (
              <div key={section.section}>
                <div className="dl-section-label">{section.section}</div>
                {section.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => isActive ? "active" : ""}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="dl-logout-wrap">
            <button className="dl-logout" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              Çıxış
            </button>
          </div>
        </aside>

        {/* ANA MƏZMUN */}
        <div className="dl-main">
          <header className="dl-topbar">
            <div className="dl-topbar-left">
              <span className="dl-breadcrumb">MediCore / <strong>Həkim Paneli</strong></span>
            </div>
            <div className="dl-topbar-right">
              <span className="dl-today">📅 {today}</span>
              <div className="dl-notif-btn">
                <NotificationBell />
              </div>
              <div className="dl-user-pill">
                <div className="dl-user-ava">{initial}</div>
                <span className="dl-user-name">{doctorName}</span>
              </div>
            </div>
          </header>

          <main className="dl-page">
            <Routes>
              <Route index element={<Navigate to="/doctor/dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="prescriptions" element={<MyPrescriptions />} />
              <Route path="chat" element={<DoctorChat />} />
              <Route path="profile" element={<DoctorProfile />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}