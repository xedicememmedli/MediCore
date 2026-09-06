import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import CourierDashboard from "./CourierDashboard";
import CourierProfile from './CourierProfile';
import CourierDeliveries from "./CourierDeliveries";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F0F7FF; }
  .cl-root { display: flex; min-height: 100vh; }
  .cl-sidebar { width: 220px; flex-shrink: 0; background: linear-gradient(180deg, #1A252F 0%, #2C3E50 60%, #34495E 100%); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; }
  .cl-logo { padding: 22px 20px 18px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 10px; }
  .cl-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .cl-logo-text { font-size: 17px; font-weight: 800; color: #fff; }
  .cl-logo-sub { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .cl-courier-card { margin: 14px 12px; padding: 12px; background: rgba(255,255,255,0.08); border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; gap: 10px; }
  .cl-cour-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #1F618D, #154360); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .cl-cour-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
  .cl-cour-label { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 600; }
  .cl-nav { flex: 1; padding: 8px 10px; }
  .cl-section-label { font-size: 9px; font-weight: 800; color: rgba(255,255,255,0.3); letter-spacing: 1.2px; text-transform: uppercase; padding: 10px 10px 6px; }
  .cl-nav a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 600; transition: all 0.18s; margin-bottom: 2px; position: relative; }
  .cl-nav a:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .cl-nav a.active { background: rgba(31,97,141,0.25); color: #fff; font-weight: 700; }
  .cl-nav a.active::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px; border-radius: 0 3px 3px 0; background: #1F618D; }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .cl-logout-wrap { padding: 12px 10px; border-top: 1px solid rgba(255,255,255,0.1); }
  .cl-logout { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; background: none; border: none; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }
  .cl-logout:hover { background: rgba(231,76,60,0.2); color: #E74C3C; }
  .cl-main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
  .cl-topbar { height: 60px; background: #fff; border-bottom: 1px solid #EBF5FB; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 99; box-shadow: 0 1px 8px rgba(0,0,0,0.04); }
  .cl-breadcrumb { font-size: 13px; color: #5D8AA8; font-weight: 600; }
  .cl-breadcrumb strong { color: #154360; }
  .cl-today { font-size: 12px; color: #5D8AA8; font-weight: 600; background: #EAF2F8; padding: 5px 12px; border-radius: 20px; border: 1px solid #F9E79F; }
  .cl-page { flex: 1; padding: 24px; }
`;

export default function CourierLayout() {
  const navigate = useNavigate();
  const courierName = localStorage.getItem("courierName") || "Kuryer";
  const initial = courierName[0]?.toUpperCase() || "K";
  const today = new Date().toLocaleDateString("az-AZ", { day: "2-digit", month: "long", year: "numeric" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="cl-root">
        <aside className="cl-sidebar">
          <div className="cl-logo">
            <div className="cl-logo-icon">🏥</div>
            <div><div className="cl-logo-text">MediCore</div><div className="cl-logo-sub">Kuryer Paneli</div></div>
          </div>
          <div className="cl-courier-card">
            <div className="cl-cour-avatar">{initial}</div>
            <div><div className="cl-cour-name">{courierName}</div><div className="cl-cour-label">🚚 Kuryer</div></div>
          </div>
          <nav className="cl-nav">
            <div className="cl-section-label">Əsas</div>
            <NavLink to="/courier/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
              <span className="nav-icon">📊</span>İdarə Paneli
            </NavLink>
            <div className="cl-section-label">Çatdırılma</div>
            <NavLink to="/courier/profile"
              style={({isActive})=>({display:"flex",alignItems:"center",gap:10,padding:"11px 16px",borderRadius:10,textDecoration:"none",fontWeight:700,fontSize:13,color:isActive?"#fff":"#5D8AA8",background:isActive?"linear-gradient(135deg,#1F618D,#2E86C1)":"transparent",transition:"all 0.2s"})}>
              <span>👤</span><span>Profilim</span>
            </NavLink>
            <NavLink to="/courier/deliveries" className={({ isActive }) => isActive ? "active" : ""}>
              <span className="nav-icon">🚚</span>Çatdırılmalar
            </NavLink>
          </nav>
          <div className="cl-logout-wrap">
            <button className="cl-logout" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>Çıxış
            </button>
          </div>
        </aside>
        <div className="cl-main">
          <header className="cl-topbar">
            <span className="cl-breadcrumb">MediCore / <strong>Kuryer Paneli</strong></span>
            <span className="cl-today">📅 {today}</span>
          </header>
          <main className="cl-page">
            <Routes>
              <Route index element={<Navigate to="/courier/dashboard" replace />} />
              <Route path="dashboard" element={<CourierDashboard />} />
              <Route path="deliveries" element={<CourierDeliveries />} />
              <Route path="profile" element={<CourierProfile />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}