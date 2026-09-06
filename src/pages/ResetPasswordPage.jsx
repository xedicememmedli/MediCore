import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #EBF5FB;
    padding: 24px;
  }

  .auth-card {
    background: #fff;
    border-radius: 20px;
    border: 1.5px solid #D6EAF8;
    padding: 48px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 8px 32px rgba(31,97,141,0.08);
  }

  .card-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #EBF5FB, #D6EAF8);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    margin-bottom: 24px;
  }

  .auth-title {
    font-size: 24px;
    font-weight: 800;
    color: #154360;
    margin-bottom: 8px;
  }

  .auth-subtitle {
    color: #5D8AA8;
    font-size: 14px;
    margin-bottom: 32px;
    line-height: 1.6;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #1F618D;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .input-wrap {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    pointer-events: none;
  }

  .form-input {
    width: 100%;
    padding: 13px 16px 13px 42px;
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
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .auth-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #154360, #1F618D);
    transform: translateY(-1px);
  }

  .auth-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .back-link {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 20px;
    font-size: 13px;
    color: #5D8AA8;
    text-decoration: none;
    font-weight: 600;
    justify-content: center;
  }

  .back-link:hover {
    color: #1F618D;
  }

  .error-box {
    background: #FDF2F2;
    border: 1px solid #F5C6CB;
    color: #C0392B;
    padding: 11px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .success-box {
    background: #E8FAF8;
    border: 1px solid #A9DFBF;
    color: #1E8449;
    padding: 16px;
    border-radius: 10px;
    font-size: 14px;
    margin-bottom: 18px;
    text-align: center;
    line-height: 1.6;
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

  @media (max-width: 576px) {
    .auth-card {
      padding: 32px 20px;
    }
  }
`;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    token: searchParams.get("token") || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!form.email || !form.token || !form.newPassword || !form.confirmPassword) {
      setError("Bütün sahələri doldurun.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Şifrələr uyğun gəlmir.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Şifrə ən azı 6 simvoldan ibarət olmalıdır.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API}/api/Auth/reset-password`, {
        email: form.email,
        token: form.token,
        newPassword: form.newPassword,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.ErrorMessage ||
        "Xəta baş verdi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="card-icon">🔑</div>

          <div className="auth-title">Yeni şifrə</div>
          <div className="auth-subtitle">
            Yeni şifrənizi daxil edin və hesabınıza girişi bərpa edin.
          </div>

          {error && <div className="error-box">⚠️ {error}</div>}

          {success ? (
            <div className="success-box">
              ✅ Şifrə uğurla yeniləndi! Giriş səhifəsinə yönləndirilirsiniz...
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">E-poçt</label>
                <div className="input-wrap">
                  <span className="input-icon">📧</span>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="mail@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Yeniləmə kodu</label>
                <div className="input-wrap">
                  <span className="input-icon">🔢</span>
                  <input
                    className="form-input"
                    placeholder="E-poçta gələn kodu daxil edin"
                    value={form.token}
                    onChange={(e) => setForm({ ...form, token: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Yeni şifrə</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Şifrənin təkrarı</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  />
                </div>
              </div>

              <button className="auth-btn" onClick={handleReset} disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" />
                    Yüklənilir...
                  </>
                ) : (
                  "Şifrəni yenilə →"
                )}
              </button>
            </>
          )}

          <Link to="/login" className="back-link">
            ← Giriş səhifəsinə qayıt
          </Link>
        </div>
      </div>
    </>
  );
}