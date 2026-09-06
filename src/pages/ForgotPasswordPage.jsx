import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Plus Jakarta Sans',sans-serif; }
  .fp-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#EBF5FB 0%,#E8FAF8 100%); padding:24px; }
  .fp-card { background:#fff; border-radius:22px; border:1.5px solid #D6EAF8; padding:48px 44px; width:100%; max-width:460px; box-shadow:0 16px 48px rgba(31,97,141,0.1); }
  .fp-icon-wrap { width:68px; height:68px; background:linear-gradient(135deg,#EBF5FB,#D6EAF8); border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:32px; margin-bottom:24px; }
  .fp-title { font-size:24px; font-weight:800; color:#154360; margin-bottom:8px; }
  .fp-sub { color:#5D8AA8; font-size:14px; margin-bottom:32px; line-height:1.65; }

  /* ADDIM GÖSTƏRİCİSİ */
  .fp-steps { display:flex; align-items:center; gap:0; margin-bottom:28px; }
  .fp-step-item { display:flex; flex-direction:column; align-items:center; gap:5px; flex:1; }
  .fp-step-circle { width:28px; height:28px; border-radius:50%; border:2px solid #D6EAF8; background:#fff; color:#B0C4D8; font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; transition:all 0.3s; }
  .fp-step-circle.done   { background:linear-gradient(135deg,#17A589,#1ABC9C); border-color:#17A589; color:#fff; }
  .fp-step-circle.active { border-color:#1F618D; color:#1F618D; background:#EBF5FB; }
  .fp-step-line { flex:1; height:2px; background:#D6EAF8; transition:background 0.3s; }
  .fp-step-line.done { background:linear-gradient(90deg,#17A589,#1ABC9C); }
  .fp-step-label { font-size:9px; font-weight:800; color:#B0C4D8; white-space:nowrap; }
  .fp-step-item.active .fp-step-label { color:#1F618D; }
  .fp-step-item.done  .fp-step-label { color:#17A589; }

  /* FORMLAR */
  .form-group { margin-bottom:20px; }
  .form-label { display:block; font-size:12px; font-weight:700; color:#1F618D; margin-bottom:8px; letter-spacing:0.5px; text-transform:uppercase; }
  .input-wrap { position:relative; }
  .input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:16px; pointer-events:none; }
  .form-input { width:100%; padding:13px 44px 13px 42px; border:1.5px solid #D6EAF8; border-radius:10px; font-size:14px; font-family:'Plus Jakarta Sans',sans-serif; color:#1A252F; background:#F8FCFF; transition:all 0.2s; outline:none; }
  .form-input:focus { border-color:#1F618D; background:#fff; box-shadow:0 0 0 3px rgba(31,97,141,0.1); }
  .form-input::placeholder { color:#B0C4D8; }
  .eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:17px; padding:4px; color:#8DAFC4; }
  .eye-btn:hover { color:#1F618D; }

  /* OTP QUTULARI */
  .otp-row { display:flex; gap:12px; justify-content:center; margin-bottom:8px; }
  .otp-input {
    width:64px; height:64px; border:2px solid #D6EAF8; border-radius:14px;
    font-size:28px; font-weight:800; text-align:center;
    font-family:'Plus Jakarta Sans',sans-serif; color:#154360;
    background:#F8FCFF; outline:none; transition:all 0.2s;
  }
  .otp-input:focus { border-color:#1F618D; background:#fff; box-shadow:0 0 0 4px rgba(31,97,141,0.12); transform:scale(1.05); }
  .otp-input.filled { border-color:#17A589; background:#E8FAF8; }
  .otp-input.error  { border-color:#E74C3C !important; background:#FDF2F2 !important; }
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    15%{transform:translateX(-8px)}
    30%{transform:translateX(8px)}
    45%{transform:translateX(-6px)}
    60%{transform:translateX(6px)}
    75%{transform:translateX(-3px)}
    90%{transform:translateX(3px)}
  }
  .otp-row.shaking .otp-input { animation:shake 0.5s cubic-bezier(.36,.07,.19,.97); }
  .otp-timer { text-align:center; font-size:12px; color:#8DAFC4; margin-bottom:16px; }
  .otp-timer span { color:#1F618D; font-weight:800; }
  .otp-resend { background:none; border:none; color:#1F618D; font-size:12px; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; text-decoration:underline; }

  .fp-btn { width:100%; padding:14px; background:linear-gradient(135deg,#1F618D,#2E86C1); color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .fp-btn:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1F618D); transform:translateY(-1px); box-shadow:0 8px 20px rgba(31,97,141,0.3); }
  .fp-btn:disabled { opacity:0.7; cursor:not-allowed; }
  .fp-back { display:flex; align-items:center; gap:6px; margin-top:20px; font-size:13px; color:#5D8AA8; text-decoration:none; font-weight:600; justify-content:center; }
  .fp-back:hover { color:#1F618D; }
  .error-box { background:#FDF2F2; border:1px solid #F5C6CB; color:#C0392B; padding:11px 14px; border-radius:8px; font-size:13px; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .success-card { text-align:center; padding:20px 0; }
  .success-icon { font-size:60px; margin-bottom:16px; animation:popIn 0.4s cubic-bezier(.36,.07,.19,.97); }
  @keyframes popIn { 0%{transform:scale(0)} 80%{transform:scale(1.15)} 100%{transform:scale(1)} }
  .success-title { font-size:20px; font-weight:800; color:#154360; margin-bottom:8px; }
  .success-sub { font-size:13px; color:#5D8AA8; line-height:1.7; }
  .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

const STEP_LABELS = ["Email","OTP Kodu","Yeni Şifrə"];

function useCountdown(init) {
  const [count, setCount] = useState(init);
  const reset = () => setCount(init);
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);
  return [count, reset];
}

export default function ForgotPasswordPage() {
  const [step, setStep]         = useState(0);   // 0=email, 1=otp, 2=newpass, 3=done
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState(["","","",""]);
  const [shaking, setShaking]   = useState(false);
  const [newPass, setNewPass]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [countdown, resetCountdown] = useCountdown(60);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  // ──── ADDIM 0: Email göndər ────
  const sendEmail = async () => {
    if (!email) { setError("Email daxil edin."); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/api/Auth/forgot-password`, { email });
      resetCountdown();
      setStep(1);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (e) {
      setError(e.response?.data?.message || "Xəta baş verdi. Email-i yoxlayın.");
    } finally { setLoading(false); }
  };

  // ──── OTP daxiletmə ────
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) otpRefs[idx + 1].current?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(""));
      otpRefs[3].current?.focus();
    }
  };

  // ──── ADDIM 1: OTP yoxla ────
  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 4) { shake(); setError("4 rəqəmli kodu tam daxil edin."); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/api/Auth/verify-otp`, { email, otp: code });
      setStep(2);
    } catch (e) {
      shake();
      setOtp(["","","",""]);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
      setError("Kod yanlışdır. Yenidən cəhd edin.");
    } finally { setLoading(false); }
  };

  // ──── ADDIM 2: Yeni şifrə ────
  const resetPassword = async () => {
    if (!newPass || newPass.length < 6) { setError("Şifrə ən az 6 simvol olmalıdır."); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/api/Auth/reset-password`, {
        email,
        otp: otp.join(""),
        newPassword: newPass,
      });
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.message || "Şifrə yenilənmədi.");
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    try {
      await axios.post(`${API}/api/Auth/forgot-password`, { email });
      resetCountdown();
      setOtp(["","","",""]);
      otpRefs[0].current?.focus();
    } catch {}
  };

  const stepStatus = (i) => {
    if (step > i) return "done";
    if (step === i) return "active";
    return "";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="fp-page">
        <div className="fp-card">

          {step < 3 ? (
            <>
              <div className="fp-icon-wrap">
                {step===0?"🔐":step===1?"📱":"🔑"}
              </div>
              <div className="fp-title">
                {step===0?"Şifrəni Bərpa Et":step===1?"OTP Kodu Daxil Et":"Yeni Şifrə Yarat"}
              </div>
              <div className="fp-sub">
                {step===0 && "Email ünvanınızı daxil edin. Bərpa kodu göndərəcəyik."}
                {step===1 && <>Email-ə göndərilən <strong>4 rəqəmli</strong> kodu daxil edin.<br/><span style={{color:"#1F618D",fontWeight:700}}>{email}</span></>}
                {step===2 && "Yeni şifrənizi müəyyən edin. Ən az 6 simvol olmalıdır."}
              </div>

              {/* ADDIM GÖSTƏRİCİSİ */}
              <div className="fp-steps">
                {STEP_LABELS.map((lbl, i) => (
                  <div key={i} className={`fp-step-item ${stepStatus(i)}`} style={{flex:i<STEP_LABELS.length-1?1:"initial"}}>
                    <div style={{display:"flex",alignItems:"center",width:"100%"}}>
                      <div className={`fp-step-circle ${stepStatus(i)}`}>
                        {step > i ? "✓" : i + 1}
                      </div>
                      {i < STEP_LABELS.length - 1 && (
                        <div className={`fp-step-line ${step > i ? "done" : ""}`} />
                      )}
                    </div>
                    <div className="fp-step-label">{lbl}</div>
                  </div>
                ))}
              </div>

              {error && <div className="error-box">⚠️ {error}</div>}

              {/* ADDIM 0: EMAİL */}
              {step === 0 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Email ünvanı</label>
                    <div className="input-wrap">
                      <span className="input-icon">📧</span>
                      <input className="form-input" type="email" placeholder="mail@example.com"
                        value={email} onChange={e=>setEmail(e.target.value)}
                        onKeyDown={e=>e.key==="Enter"&&sendEmail()} />
                    </div>
                  </div>
                  <button className="fp-btn" onClick={sendEmail} disabled={loading}>
                    {loading ? <><div className="spinner"/> Göndərilir...</> : "OTP kodu göndər →"}
                  </button>
                </>
              )}

              {/* ADDIM 1: OTP */}
              {step === 1 && (
                <>
                  <div className={`otp-row ${shaking?"shaking":""}`} onPaste={handleOtpPaste}>
                    {otp.map((v, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        className={`otp-input ${v?"filled":""} ${shaking?"error":""}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={v}
                        onChange={e=>handleOtpChange(e.target.value, i)}
                        onKeyDown={e=>handleOtpKeyDown(e, i)}
                      />
                    ))}
                  </div>
                  <div className="otp-timer">
                    {countdown > 0
                      ? <>Kod etibarlıdır: <span>{countdown}s</span></>
                      : <button className="otp-resend" onClick={resendOtp}>Kodu yenidən göndər</button>
                    }
                  </div>
                  <button className="fp-btn" onClick={verifyOtp} disabled={loading || otp.join("").length < 4}>
                    {loading ? <><div className="spinner"/> Yoxlanılır...</> : "Kodu Təsdiqlə →"}
                  </button>
                </>
              )}

              {/* ADDIM 2: YENİ ŞİFRƏ */}
              {step === 2 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Yeni Şifrə</label>
                    <div className="input-wrap">
                      <span className="input-icon">🔒</span>
                      <input className="form-input"
                        type={showPass?"text":"password"}
                        placeholder="Yeni şifrə (min. 6 simvol)"
                        value={newPass}
                        onChange={e=>setNewPass(e.target.value)}
                        onKeyDown={e=>e.key==="Enter"&&resetPassword()} />
                      <button className="eye-btn" onClick={()=>setShowPass(s=>!s)} tabIndex={-1}>
                        {showPass?"🙈":"👁️"}
                      </button>
                    </div>
                  </div>
                  <button className="fp-btn" onClick={resetPassword} disabled={loading}>
                    {loading ? <><div className="spinner"/> Yenilənir...</> : "Şifrəni Yenilə ✓"}
                  </button>
                </>
              )}
            </>
          ) : (
            /* UĞUR EKRANı */
            <div className="success-card">
              <div className="success-icon">🎉</div>
              <div className="success-title">Şifrəniz yeniləndi!</div>
              <div className="success-sub">
                Yeni şifrənizlə sistemə daxil ola bilərsiniz.<br/>
                <Link to="/login" style={{color:"#1F618D",fontWeight:800,textDecoration:"none"}}>
                  🔑 Daxil olmaq üçün klikləyin →
                </Link>
              </div>
            </div>
          )}

          {step < 3 && (
            <Link to="/login" className="fp-back">← Girişə qayıt</Link>
          )}
        </div>
      </div>
    </>
  );
}