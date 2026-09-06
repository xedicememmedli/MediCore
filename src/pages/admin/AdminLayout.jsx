import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";

import Dashboard from "./Dashboard";
import SpecialtyPage from "./SpecialtyPage";
import DoctorPage from "./DoctorPage";
import MedicinePage from "./MedicinePage";
import CategoryPage from "./CategoryPage";
import ConsultationPage from "./ConsultationPage";
import PrescriptionPage from "./PrescriptionPage";
import CourierPage from "./CourierPage";
import ChatPage from "./ChatPage";
import OrderPage from "./OrderPage";
import SettingPage from "./SettingPage";
import AdminKanban from "./AdminKanban";
import AdminAutomation from "./AdminAutomation";
import AdminLiveMap from "./AdminLiveMap";
import NotificationBell from "../../components/NotificationBell";
import { UndoToastContainer } from "../../components/UndoToast";

const menu = [
  {
    section: "Əsas",
    items: [{ path: "", icon: "📊", label: "Dashboard" }],
  },
  {
    section: "Tibbi",
    items: [
      { path: "specialty", icon: "⚕️", label: "İxtisaslar" },
      { path: "doctor", icon: "👨‍⚕️", label: "Həkimlər" },
      { path: "medicine", icon: "💊", label: "Dərmanlar" },
      { path: "category", icon: "🏷️", label: "Kateqoriyalar" },
      { path: "consultation", icon: "🩺", label: "Konsultasiyalar" },
      { path: "prescription", icon: "📋", label: "Reseptlər" },
    ],
  },
  {
    section: "İdarəetmə",
    items: [
      { path: "courier", icon: "🚚", label: "Kuryerlər" },
      { path: "order", icon: "📦", label: "Sifarişlər" },
      { path: "kanban", icon: "🗂️", label: "Kanban Board" },
      { path: "automation", icon: "🤖", label: "AI Botlar" },
      { path: "live-map", icon: "🗺️", label: "Canlı Xəritə" },
      { path: "chat", icon: "💬", label: "Mesajlar" },
    ],
  },
  {
    section: "Sistem",
    items: [{ path: "setting", icon: "⚙️", label: "Ayarlar" }],
  },
];

const pageTitles = {
  "": "Dashboard",
  specialty: "İxtisaslar",
  doctor: "Həkimlər",
  medicine: "Dərmanlar",
  category: "Kateqoriyalar",
  consultation: "Konsultasiyalar",
  prescription: "Reseptlər",
  courier: "Kuryerlər",
  order: "Sifarişlər",
  kanban: "Kanban Board",
  automation: "AI Botlar",
  "live-map": "Canlı Xəritə",
  chat: "Mesajlar",
  setting: "Ayarlar",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #EBF5FB; color: #1A252F; }

  .admin-layout {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 256px;
    background: linear-gradient(180deg, #154360 0%, #1F618D 100%);
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    z-index: 100;
    box-shadow: 4px 0 24px rgba(21,67,96,0.2);
  }

  .sidebar-logo {
    padding: 24px 20px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .logo-icon {
    width: 38px;
    height: 38px;
    background: rgba(255,255,255,0.12);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 1px solid rgba(255,255,255,0.15);
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 19px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.3px;
  }

  .logo-text span {
    color: #AED6F1;
  }

  .logo-badge {
    margin-left: auto;
    background: rgba(26,188,156,0.2);
    border: 1px solid rgba(26,188,156,0.35);
    color: #1ABC9C;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0 12px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }

  .sidebar-nav::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-nav::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }

  .nav-section {
    padding: 16px 14px 4px;
  }

  .nav-section-label {
    font-size: 9px;
    font-weight: 800;
    color: rgba(174,214,241,0.4);
    letter-spacing: 1.8px;
    text-transform: uppercase;
    padding: 0 6px;
    margin-bottom: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 9px;
    cursor: pointer;
    transition: all 0.18s;
    color: rgba(255,255,255,0.6);
    font-size: 13.5px;
    font-weight: 500;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    margin-bottom: 1px;
    position: relative;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .nav-item:hover {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.9);
  }

  .nav-item.active {
    background: rgba(255,255,255,0.13);
    color: #fff;
    font-weight: 700;
  }

  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 3px;
    background: #1ABC9C;
    border-radius: 0 3px 3px 0;
  }

  .nav-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .sidebar-footer {
    padding: 12px 14px 16px;
    border-top: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
  }

  .user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.18s;
  }

  .user-card:hover {
    background: rgba(255,255,255,0.07);
  }

  .user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1ABC9C, #2E86C1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-role {
    font-size: 11px;
    color: rgba(174,214,241,0.55);
  }

  .logout-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.35);
    font-size: 15px;
    padding: 5px;
    border-radius: 6px;
    transition: all 0.18s;
    flex-shrink: 0;
  }

  .logout-btn:hover {
    color: #fff;
    background: rgba(255,255,255,0.1);
  }

  .main-wrap {
    margin-left: 256px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .topbar {
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #D6EAF8;
    display: flex;
    align-items: center;
    padding: 0 24px;
    gap: 14px;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .topbar-title {
    font-size: 16px;
    font-weight: 800;
    color: #154360;
    flex: 1;
  }

  .topbar-divider {
    width: 1px;
    height: 24px;
    background: #D6EAF8;
  }

  .topbar-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1.5px solid #D6EAF8;
    background: #EBF5FB;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 15px;
    color: #1F618D;
    transition: all 0.18s;
  }

  .topbar-btn:hover {
    background: #D6EAF8;
    border-color: #AED6F1;
  }

  .page-body {
    flex: 1;
    padding: 26px;
  }
`;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.replace("/admin/", "").replace("/admin", "");
  const pageTitle = pageTitles[currentPath] || "Admin Panel";
  const userName = localStorage.getItem("userName") || "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <style>{styles}</style>
      <UndoToastContainer />

      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">🏥</div>
            <div className="logo-text">
              Medi<span>Core</span>
            </div>
            <div className="logo-badge">Admin</div>
          </div>

          <nav className="sidebar-nav">
            {menu.map((section) => (
              <div className="nav-section" key={section.section}>
                <div className="nav-section-label">{section.section}</div>
                {section.items.map((item) => (
                  <button
                    key={item.path}
                    className={`nav-item ${currentPath === item.path ? "active" : ""}`}
                    onClick={() => navigate(item.path ? `/admin/${item.path}` : "/admin")}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">{userName[0]?.toUpperCase()}</div>
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-role">Administrator</div>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Çıxış">
                ⏻
              </button>
            </div>
          </div>
        </aside>

        <div className="main-wrap">
          <header className="topbar">
            <div className="topbar-title">{pageTitle}</div>
            <div className="topbar-divider" />
            <NotificationBell />
            <div className="topbar-btn">👤</div>
          </header>

          <main className="page-body">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="specialty" element={<SpecialtyPage />} />
              <Route path="doctor" element={<DoctorPage />} />
              <Route path="medicine" element={<MedicinePage />} />
              <Route path="category" element={<CategoryPage />} />
              <Route path="consultation" element={<ConsultationPage />} />
              <Route path="prescription" element={<PrescriptionPage />} />
              <Route path="courier" element={<CourierPage />} />
              <Route path="order" element={<OrderPage />} />
              <Route path="kanban" element={<AdminKanban />} />
              <Route path="automation" element={<AdminAutomation />} />
              <Route path="live-map" element={<AdminLiveMap />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="setting" element={<SettingPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}