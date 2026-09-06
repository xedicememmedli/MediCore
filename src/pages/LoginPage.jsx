import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

const API = process.env.REACT_APP_API_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  .auth-page { min-height: 100vh; display: flex; background: #EBF5FB; }

  .auth-left {
    width: 480px;
    flex-shrink: 0;
    background: linear-gradient(160deg, #154360 0%, #1F618D 60%, #2E86C1 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px 48px;
    position: relative;
    overflow: hidden;
  }

  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }

  .brand-logo {
    width: 180px;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 6px 20px rgba(0,0,0,0.25));
  }

  .brand-tagline {
    color: rgba(255,255,255,0.8);
    font-size: 15px;
    text-align: center;
    line-height: 1.8;
    max-width: 320px;
    position: relative;
    z-index: 1;
    margin-bottom: 48px;
  }

  .brand-tagline strong {
    color: #ffffff;
    font-size: 18px;
    display: block;
    margin-bottom: 12px;
  }

  .auth-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 48px;
    position: relative;
  }

  .auth-card { width: 100%; max-width: 420px; }

  .auth-title {
    font-size: 28px;
    font-weight: 800;
    color: #154360;
    margin-bottom: 6px;
  }

  .auth-subtitle {
    color: #5D8AA8;
    font-size: 14px;
    margin-bottom: 36px;
  }

  .form-group { margin-bottom: 20px; }

  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #1F618D;
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
    padding: 13px 14px;
    border: 1.5px solid #D6EAF8;
    border-radius: 10px;
    font-size: 14px;
    background: #F8FCFF;
    outline: none;
  }

  .form-input:focus {
    border-color: #1F618D;
    background: #fff;
  }

  .auth-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg,#1F618D,#2E86C1);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }

  .auth-btn:hover:not(:disabled) {
    background: linear-gradient(135deg,#154360,#1F618D);
  }

  .auth-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error-box {
    background: #FDF2F2;
    border: 1px solid #F5C6CB;
    color: #C0392B;
    padding: 11px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 18px;
  }

  @media (max-width: 900px) {
    .auth-left { display: none; }
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userName: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.userName.trim() || !form.password.trim()) {
      setError("Bütün sahələri doldurun");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Arxa plan URL-ni dəqiq yoxla. Əgər .env işləməsə, bura birbaşa 'https://localhost:7105/api/Auth/Login' yaza bilərsən
      const res = await axios.post(`${API}/api/Auth/Login`, {
        UserName: form.userName,
        Password: form.password,
      });

      const token = res?.data?.token || res?.data?.accessToken;

      if (!token) {
        throw new Error("Token tapılmadı");
      }

      localStorage.setItem("token", token);

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role =
        decoded?.role ||
        decoded?.Role ||
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        "";

      localStorage.setItem("role", role);

      // Kuryer üçün də yönləndirmə əlavə edildi
      if (role === "Admin") navigate("/admin");
      else if (role === "Doctor") navigate("/doctor");
      else if (role === "Courier") navigate("/courier"); 
      else if (role === "Patient") navigate("/patient");
      else navigate("/");
      
    } catch (err) {
      console.log("LOGIN ERROR:", err?.response?.data || err.message);
      setError("İstifadəçi adı və ya şifrə yanlışdır");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="auth-page">
        <div className="auth-left">
          <div className="brand">
            <img src={logo} alt="MediCore" className="brand-logo" />
          </div>

          {/* DƏYİŞDİRİLƏN PEŞƏKAR MƏTN BÖLMƏSİ */}
          <div className="brand-tagline">
            <strong>Vahid Rəqəmsal Səhiyyə Ekosistemi</strong>
            Pasiyent xidmətləri, tibbi idarəetmə və logistikanı tək mərkəzdə birləşdirən təhlükəsiz platforma.
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-title">Sistemə Daxil Olun</div>

            <div className="auth-subtitle">
              Hesabınız yoxdur? <Link to="/register">Qeydiyyatdan keçin</Link>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="form-group">
              <label className="form-label">İstifadəçi adı</label>
              <input
                className="form-input"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Şifrə</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
              />
            </div>

            <button className="auth-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Yüklənir..." : "Daxil ol"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}