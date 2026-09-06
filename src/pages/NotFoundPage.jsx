import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  .nf-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #F0F7FF 0%, #E8FAF8 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }

  /* SESSION EXPIRED */
  .nf-expired {
    background: linear-gradient(135deg, #1F618D, #154360);
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .nf-expired-card {
    background: #fff; border-radius: 20px; padding: 44px 40px;
    max-width: 420px; width: 100%; text-align: center;
    box-shadow: 0 32px 80px rgba(21,67,96,0.3);
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  .exp-icon { font-size: 56px; margin-bottom: 18px; }
  .exp-title { font-size: 22px; font-weight: 800; color: #154360; margin-bottom: 10px; }
  .exp-sub { font-size: 14px; color: #5D8AA8; line-height: 1.7; margin-bottom: 28px; }
  .btn-exp { width: 100%; padding: 14px; background: linear-gradient(135deg,#1F618D,#2E86C1); color: #fff; border: none; border-radius: 11px; font-size: 15px; font-weight: 800; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-exp:hover { opacity: 0.9; transform: translateY(-1px); }

  /* 404 */
  .nf-card {
    text-align: center; max-width: 480px; width: 100%;
  }
  .nf-number {
    font-size: 120px; font-weight: 800;
    background: linear-gradient(135deg, #1F618D, #17A589);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1; margin-bottom: 8px;
    animation: float 3s ease-in-out infinite;
  }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  .nf-emoji { font-size: 52px; margin-bottom: 18px; }
  .nf-title { font-size: 24px; font-weight: 800; color: #154360; margin-bottom: 10px; }
  .nf-sub { font-size: 14px; color: #5D8AA8; line-height: 1.7; margin-bottom: 32px; }
  .nf-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-home { padding: 12px 24px; background: linear-gradient(135deg,#1F618D,#2E86C1); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-home:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-back { padding: 12px 24px; background: #fff; border: 1.5px solid #D6EAF8; border-radius: 10px; font-size: 14px; font-weight: 700; color: #1F618D; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s; }
  .btn-back:hover { background: #EBF5FB; }
  .countdown { font-size: 12px; color: #B0C4D8; margin-top: 20px; }
`;

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isExpired = new URLSearchParams(location.search).get("expired") === "1";
  const isLoginPage = location.pathname === "/login";

  const [countdown, setCountdown] = useState(5);

  const role = localStorage.getItem("role")?.toLowerCase();
  const homeRoute = role ? `/${role}` : "/login";

  // Session expired — 5 saniyə sonra avtomatik login-ə
  useEffect(() => {
    if (!isExpired) return;
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); navigate("/login", { replace: true }); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isExpired, navigate]);

  if (isExpired) {
    return (
      <>
        <style>{styles}</style>
        <div className="nf-expired">
          <div className="nf-expired-card">
            <div className="exp-icon">🔒</div>
            <div className="exp-title">Sessiya bitdi</div>
            <div className="exp-sub">
              Təhlükəsizlik üçün sessiyanız avtomatik olaraq başa çatdı.<br />
              Davam etmək üçün yenidən daxil olun.
            </div>
            <button className="btn-exp" onClick={() => navigate("/login", { replace: true })}>
              🔑 Yenidən daxil ol
            </button>
            <div className="countdown">{countdown} saniyə sonra avtomatik yönləndiriləcəksiniz</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="nf-root">
        <div className="nf-card">
          <div className="nf-number">404</div>
          <div className="nf-emoji">🏥</div>
          <div className="nf-title">Səhifə tapılmadı</div>
          <div className="nf-sub">
            Axtardığınız səhifə mövcud deyil və ya köçürülüb.<br />
            Ana səhifəyə qayıdın.
          </div>
          <div className="nf-btns">
            <button className="btn-back" onClick={() => navigate(-1)}>← Geri qayıt</button>
            <button className="btn-home" onClick={() => navigate(homeRoute, { replace: true })}>
              🏠 Ana səhifəyə get
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
