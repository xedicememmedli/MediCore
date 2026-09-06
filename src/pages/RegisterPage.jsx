import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

const API = process.env.REACT_APP_API_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  .auth-page {
    min-height: 100vh;
    display: flex;
    background: #EBF5FB;
  }

  .auth-left {
    width: 480px;
    background: linear-gradient(160deg, #154360 0%, #1F618D 60%, #2E86C1 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px 48px;
    position: relative;
    overflow: hidden;
  }

  .auth-left::before {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    top: -200px;
    right: -200px;
  }

  .auth-left::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(26,188,156,0.08);
    bottom: -100px;
    left: -80px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }

  .brand-logo {
    width: 58px;
    height: 58px;
    object-fit: contain;
    border-radius: 14px;
    background: rgba(255,255,255,0.10);
    padding: 6px;
    border: 1px solid rgba(255,255,255,0.18);
    backdrop-filter: blur(10px);
  }

  .brand-name {
    font-size: 30px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.5px;
  }

  .brand-name span {
    color: #AED6F1;
  }

  .brand-tagline {
    color: rgba(255,255,255,0.75);
    font-size: 14px;
    text-align: center;
    line-height: 1.8;
    max-width: 280px;
    position: relative;
    z-index: 1;
    margin-bottom: 48px;
  }

  .steps {
    position: relative;
    z-index: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
  }

  .step-num {
    width: 32px;
    height: 32px;
    background: rgba(26,188,156,0.2);
    border: 1px solid rgba(26,188,156,0.4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: #1ABC9C;
    flex-shrink: 0;
  }

  .step-text {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.88);
  }

  .auth-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 48px;
    overflow-y: auto;
    background: linear-gradient(180deg, #F8FCFF 0%, #EBF5FB 100%);
  }

  .auth-card {
    width: 100%;
    max-width: 440px;
  }

  .auth-title {
    font-size: 28px;
    font-weight: 800;
    color: #154360;
    margin-bottom: 6px;
  }

  .auth-subtitle {
    color: #5D8AA8;
    font-size: 14px;
    margin-bottom: 32px;
  }

  .auth-subtitle a {
    color: #1F618D;
    font-weight: 600;
    text-decoration: none;
  }

  .auth-subtitle a:hover {
    text-decoration: underline;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #1F618D;
    margin-bottom: 7px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .input-wrap {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    pointer-events: none;
  }

  .form-input {
    width: 100%;
    padding: 12px 14px 12px 40px;
    border: 1.5px solid #D6EAF8;
    border-radius: 10px;
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1A252F;
    background: #F8FCFF;
    transition: all 0.2s;
    outline: none;
  }

  .form-input:focus {
    border-color: #1F618D;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(31,97,141,0.1);
  }

  .form-input::placeholder {
    color: #B0C4D8;
  }

  .role-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .role-card {
    border: 1.5px solid #D6EAF8;
    border-radius: 10px;
    padding: 12px 14px;
    cursor: pointer;
    transition: all 0.2s;
    background: #F8FCFF;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .role-card:hover {
    border-color: #AED6F1;
    background: #EBF5FB;
  }

  .role-card.selected {
    border-color: #1F618D;
    background: #EBF5FB;
    box-shadow: 0 0 0 3px rgba(31,97,141,0.08);
  }

  .role-card-icon {
    font-size: 20px;
  }

  .role-card-label {
    font-size: 13px;
    font-weight: 600;
    color: #154360;
  }

  .role-card-desc {
    font-size: 11px;
    color: #5D8AA8;
  }

  .auth-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .auth-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #154360, #1F618D);
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(31,97,141,0.3);
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
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .success-box {
    background: #E8FAF8;
    border: 1px solid #A9DFBF;
    color: #1E8449;
    padding: 11px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .divider {
    height: 1px;
    background: #D6EAF8;
    margin: 20px 0;
  }

  @media (max-width: 992px) {
    .auth-page {
      flex-direction: column;
    }

    .auth-left {
      width: 100%;
      min-height: 360px;
    }

    .auth-right {
      padding: 32px 24px;
    }
  }

  @media (max-width: 576px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .role-grid {
      grid-template-columns: 1fr;
    }

    .auth-left {
      padding: 40px 24px;
    }

    .auth-right {
      padding: 28px 16px;
    }
  }
`;

const roles = [
  { value: "Admin", icon: "🛡️", label: "Admin", desc: "Tam idarəetmə" },
  { value: "Doctor", icon: "👨‍⚕️", label: "Həkim", desc: "Tibbi panel" },
  { value: "Patient", icon: "🧑", label: "Pasient", desc: "Şəxsi panel" },
  { value: "Courier", icon: "🚚", label: "Kuryer", desc: "Çatdırılma paneli" },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
    role: "Patient",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.userName || !form.password || !form.confirmPassword) {
      setError("Bütün sahələri doldurun.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Şifrələr uyğun gəlmir.");
      return;
    }

    if (form.password.length < 6) {
      setError("Şifrə ən azı 6 simvoldan ibarət olmalıdır.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      Name: form.name,
      Email: form.email,
      UserName: form.userName,
      Password: form.password,
      ConfirmPassword: form.confirmPassword,
      Role: form.role,
    };

    console.log("REGISTER PAYLOAD:", payload);

    try {
      const res = await axios.post(`${API}/api/Auth/Register`, payload);
      console.log("REGISTER SUCCESS:", res.data);
      setSuccess("Qeydiyyat uğurla tamamlandı! Giriş səhifəsinə yönləndirilirsiniz...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.log("REGISTER ERROR FULL:", err);
      console.log("REGISTER ERROR DATA:", err.response?.data);

      const data = err.response?.data;
      let msg = "Qeydiyyat zamanı xəta baş verdi.";

      if (typeof data === "string" && data.trim()) {
        msg = data;
      } else if (data?.message) {
        msg = data.message;
      } else if (data?.Message) {
        msg = data.Message;
      } else if (data?.ErrorMessage) {
        msg = data.ErrorMessage;
      } else if (data?.title) {
        msg = data.title;
      } else if (data?.errors && typeof data.errors === "object") {
        msg = Object.values(data.errors).flat().join(" | ");
      }

      setError(msg);
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
            <img src={logo} alt="MediCore Logo" className="brand-logo" />
            <div className="brand-name">
              Medi<span>Core</span>
            </div>
          </div>

          <p className="brand-tagline">
            Tibbi idarəetmə sisteminə qoşulun. Cəmi bir neçə addıma hesabınızı yaradın.
          </p>

          <div className="steps">
            {[
              "Şəxsi məlumatlarınızı daxil edin",
              "Rolunuzu seçin",
              "Hesabınızı yaradın",
              "Sistemə daxil olun",
            ].map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">{i + 1}</div>
                <div className="step-text">{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-title">Hesab yaradın ✨</div>

            <div className="auth-subtitle">
              Artıq hesabınız var? <Link to="/login">Daxil olun</Link>
            </div>

            {error && <div className="error-box">⚠️ {error}</div>}
            {success && <div className="success-box">✅ {success}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ad və soyad</label>
                <div className="input-wrap">
                  <span className="input-icon">✏️</span>
                  <input
                    className="form-input"
                    placeholder="Ad və soyadınızı daxil edin"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">E-poçt</label>
                <div className="input-wrap">
                  <span className="input-icon">📧</span>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="mail@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">İstifadəçi adı</label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input
                  className="form-input"
                  placeholder="İstifadəçi adınızı daxil edin"
                  value={form.userName}
                  onChange={(e) => set("userName", e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Şifrə</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Şifrə təkrarı</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="divider" />

            <div className="form-group">
              <label className="form-label">Rol seçin</label>
              <div className="role-grid">
                {roles.map((r) => (
                  <div
                    key={r.value}
                    className={`role-card ${form.role === r.value ? "selected" : ""}`}
                    onClick={() => set("role", r.value)}
                  >
                    <div className="role-card-icon">{r.icon}</div>
                    <div>
                      <div className="role-card-label">{r.label}</div>
                      <div className="role-card-desc">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="auth-btn" onClick={handleRegister} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  Yüklənilir...
                </>
              ) : (
                "Qeydiyyatdan keç →"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}