import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockSpecialties = [
  { id: 1, name: "Kardioloqiya" },
  { id: 2, name: "Nevrologiya" },
  { id: 3, name: "Ortopediya" },
  { id: 4, name: "Dərmatologiya" },
];

const mockProfile = {
  id: 1, appUserId: "u1", appUserName: "Dr. Əli Həsənov",
  specialtyId: 1, specialtyName: "Kardioloqiya",
  consultationFee: 50, experience: "10 il",
  education: "Bakı Dövlət Tibb Universiteti",
  workingHours: "09:00 - 18:00",
  biography: "Ürək-damar xəstəlikləri üzrə mütəxəssis həkim. 10 illik təcrübə ilə yüzlərlə xəstəyə kömək etmişəm.",
};

const styles = `
  .profile-layout {
    display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: flex-start;
  }
  @media (max-width: 900px) { .profile-layout { grid-template-columns: 1fr; } }

  /* SOL KART */
  .profile-card {
    background: #fff; border-radius: 16px; border: 1.5px solid #D6EAF8; overflow: hidden;
  }
  .profile-card-banner {
    height: 80px;
    background: linear-gradient(135deg, #154360, #1F618D, #2E86C1);
  }
  .profile-card-body { padding: 0 20px 20px; }
  .profile-avatar-wrap { margin-top: -30px; margin-bottom: 12px; }
  .profile-avatar {
    width: 64px; height: 64px; border-radius: 18px;
    background: linear-gradient(135deg, #1ABC9C, #17A589);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; font-weight: 800; color: #fff;
    border: 3px solid #fff; box-shadow: 0 4px 12px rgba(26,188,156,0.3);
  }
  .profile-name { font-size: 17px; font-weight: 800; color: #154360; margin-bottom: 4px; }
  .profile-spec {
    display: inline-flex; align-items: center; gap: 5px;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    color: #1F618D; font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 20px; margin-bottom: 14px;
  }
  .profile-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .ps-item {
    background: #F8FCFF; border-radius: 10px; border: 1px solid #EBF5FB;
    padding: 10px; text-align: center;
  }
  .ps-val { font-size: 18px; font-weight: 800; color: #1F618D; margin-bottom: 2px; }
  .ps-label { font-size: 10px; color: #5D8AA8; font-weight: 600; }
  .profile-info-rows { display: flex; flex-direction: column; gap: 8px; }
  .pir { display: flex; align-items: flex-start; gap: 9px; font-size: 12px; }
  .pir-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
  .pir-label { color: #5D8AA8; font-weight: 600; margin-bottom: 1px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
  .pir-val { color: #1A252F; font-weight: 600; }

  /* SAĞ — FORM */
  .form-card { background: #fff; border-radius: 16px; border: 1.5px solid #D6EAF8; padding: 24px; }
  .form-card-title { font-size: 16px; font-weight: 800; color: #154360; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .form-section { margin-bottom: 20px; }
  .form-section-title { font-size: 11px; font-weight: 800; color: #5D8AA8; letter-spacing: 0.8px; text-transform: uppercase; padding-bottom: 8px; border-bottom: 1px solid #EBF5FB; margin-bottom: 14px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .fg { display: flex; flex-direction: column; gap: 7px; }
  .fl { font-size: 12px; font-weight: 700; color: #1F618D; letter-spacing: 0.5px; text-transform: uppercase; }
  .fi {
    padding: 11px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px;
    font-size: 14px; color: #1A252F; font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F8FCFF; outline: none; transition: all 0.2s;
  }
  .fi:focus { border-color: #1F618D; background: #fff; box-shadow: 0 0 0 3px rgba(31,97,141,0.09); }
  .fi::placeholder { color: #B0C4D8; }
  .fi:disabled { background: #F4FAFD; color: #8DAFC4; cursor: not-allowed; }
  textarea.fi { resize: vertical; min-height: 90px; line-height: 1.5; }
  select.fi { cursor: pointer; }

  .save-row { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #EBF5FB; }
  .btn-primary { display: flex; align-items: center; gap: 7px; padding: 11px 22px; background: linear-gradient(135deg, #1F618D, #2E86C1); color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #154360, #1F618D); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(31,97,141,0.25); }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
  .success-msg { display: flex; align-items: center; gap: 8px; background: #E8FAF8; border: 1px solid #A9DFBF; color: #17A589; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; }
  .err-msg { background: #FDF2F2; border: 1px solid #FADBD8; color: #C0392B; padding: 10px 14px; border-radius: 8px; font-size: 13px; }
  .spin { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ŞİFRƏ BÖLÜMÜ */
  .pw-card { background: #fff; border-radius: 16px; border: 1.5px solid #D6EAF8; padding: 24px; margin-top: 18px; }
`;

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    specialtyId: "", consultationFee: "",
    experience: "", education: "", workingHours: "", biography: "",
  });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [newUsername,    setNewUsername]    = useState("");
  const [usernameLoading,setUsernameLoading]= useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.all([
          axios.get(`${API}/api/Auth/my-profile`, { headers: authHeader() }),
          axios.get(`${API}/api/Specialty`, { headers: authHeader() }),
        ]);
        const p = pRes.data;
        setProfile(p);
        setForm({
          specialtyId: String(p.specialtyId || ""),
          consultationFee: String(p.consultationFee || ""),
          experience: p.experience || "",
          education: p.education || "",
          workingHours: p.workingHours || "",
          biography: p.biography || "",
        });
        setSpecialties(Array.isArray(sRes.data) ? sRes.data : sRes.data?.data || []);
      } catch {
        setProfile(mockProfile);
        setSpecialties(mockSpecialties);
        setForm({
          specialtyId: String(mockProfile.specialtyId),
          consultationFee: String(mockProfile.consultationFee),
          experience: mockProfile.experience,
          education: mockProfile.education,
          workingHours: mockProfile.workingHours,
          biography: mockProfile.biography,
        });
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }));

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) return;
    setUsernameLoading(true);
    try {
      const API = process.env.REACT_APP_API_URL;
      const tok = localStorage.getItem("token");
      await axios.patch(`${API}/api/Auth/update-username`,
        { newUsername: newUsername.trim() },
        { headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" } }
      );
      localStorage.setItem("doctorName", newUsername.trim());
      setSuccess("İstifadəçi adı uğurla dəyişildi ✅");
      setNewUsername("");
    } catch { setError("İstifadəçi adı dəyişilirkən xəta baş verdi"); }
    finally { setUsernameLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const fd = new FormData();
      fd.append("Id", profile?.id || "");
      fd.append("AppUserId", profile?.appUserId || "");
      fd.append("SpecialtyId", form.specialtyId);
      fd.append("ConsultationFee", form.consultationFee);
      fd.append("Experience", form.experience);
      fd.append("Education", form.education);
      fd.append("WorkingHours", form.workingHours);
      fd.append("Biography", form.biography);
      await axios.put(`${API}/api/Doctor/update-my-profile`, fd, { headers: authHeader() });
      setSuccess("Profil uğurla yeniləndi!");
      // localStorage-i yenilə
      const spec = specialties.find(s => s.id === Number(form.specialtyId));
      if (spec) localStorage.setItem("doctorSpec", spec.name);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { setError(err.response?.data?.message || "Xəta baş verdi."); }
    finally { setSaving(false); }
  };

  const handlePwSave = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("Yeni şifrələr uyğun gəlmir."); return; }
    if (pwForm.newPassword.length < 6) { setPwError("Şifrə minimum 6 simvol olmalıdır."); return; }
    setPwSaving(true); setPwError(""); setPwSuccess("");
    try {
      await axios.post(`${API}/api/Auth/ChangePassword`, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      }, { headers: { ...authHeader(), "Content-Type": "application/json" } });
      setPwSuccess("Şifrə uğurla dəyişdirildi!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSuccess(""), 3000);
    } catch (err) { setPwError(err.response?.data?.message || "Şifrə dəyişdirilərkən xəta baş verdi."); }
    finally { setPwSaving(false); }
  };

  const initial = (profile?.appUserName || "D").replace("Dr. ", "")[0]?.toUpperCase();
  const specName = specialties.find(s => s.id === Number(form.specialtyId))?.name || profile?.specialtyName || "—";

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8" }}>⏳ Yüklənir...</div>;

  return (
    <>
      <style>{styles}</style>

      <div className="profile-layout">
        {/* SOL — PROFİL KARTI */}
        <div>
          <div className="profile-card">
            <div className="profile-card-banner" />
            <div className="profile-card-body">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">{initial}</div>
              </div>
              <div className="profile-name">{profile?.appUserName || "Həkim"}</div>
              <div className="profile-spec">⚕️ {specName}</div>
              <div className="profile-stats">
                <div className="ps-item">
                  <div className="ps-val">{profile?.consultationFee || form.consultationFee || "—"} ₼</div>
                  <div className="ps-label">Konsultasiya</div>
                </div>
                <div className="ps-item">
                  <div className="ps-val">{form.experience || "—"}</div>
                  <div className="ps-label">Təcrübə</div>
                </div>
              </div>
              <div className="profile-info-rows">
                {form.workingHours && (
                  <div className="pir">
                    <span className="pir-icon">🕐</span>
                    <div><div className="pir-label">İş saatları</div><div className="pir-val">{form.workingHours}</div></div>
                  </div>
                )}
                {form.education && (
                  <div className="pir">
                    <span className="pir-icon">🎓</span>
                    <div><div className="pir-label">Təhsil</div><div className="pir-val">{form.education}</div></div>
                  </div>
                )}
                {form.biography && (
                  <div className="pir">
                    <span className="pir-icon">📝</span>
                    <div><div className="pir-label">Bioqrafiya</div><div className="pir-val" style={{ fontSize: 11, lineHeight: 1.5 }}>{form.biography}</div></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ — DÜZƏLIŞ FORMU */}
        <div>
          <div className="form-card">
            <div className="form-card-title">✏️ Profil məlumatlarını yenilə</div>

            {success && <div className="success-msg" style={{ marginBottom: 16 }}>✅ {success}</div>}
            {error && <div className="err-msg" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

            <div className="form-section">
              <div className="form-section-title">Peşə məlumatları</div>
              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="fg">
                  <label className="fl">İxtisas</label>
                  <select className="fi" value={form.specialtyId} onChange={e => set("specialtyId", e.target.value)}>
                    <option value="">Seçin...</option>
                    {specialties.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">Konsultasiya Haqqı (₼)</label>
                  <input className="fi" type="number" placeholder="50" value={form.consultationFee} onChange={e => set("consultationFee", e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="fg">
                  <label className="fl">Təcrübə</label>
                  <input className="fi" placeholder="Məs: 10 il" value={form.experience} onChange={e => set("experience", e.target.value)} />
                </div>
                <div className="fg">
                  <label className="fl">İş Saatları</label>
                  <input className="fi" placeholder="09:00 - 18:00" value={form.workingHours} onChange={e => set("workingHours", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Əlavə məlumat</div>
              <div className="fg" style={{ marginBottom: 14 }}>
                <label className="fl">Təhsil</label>
                <input className="fi" placeholder="Universitet adı" value={form.education} onChange={e => set("education", e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Bioqrafiya</label>
                <textarea className="fi" rows={3} placeholder="Özünüz haqqında qısa məlumat..." value={form.biography} onChange={e => set("biography", e.target.value)} />
              </div>
            </div>

            <div className="save-row">
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spin" /> Saxlanır...</> : "💾 Yadda saxla"}
              </button>
            </div>
          </div>

          
      {/* İSTİFADƏÇİ ADI DƏYİŞ */}
      <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #D5F5E3",padding:"24px",marginTop:20}}>
        <div style={{fontWeight:800,fontSize:12,color:"#17A589",letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:14}}>
          👤 İstifadəçi Adını Dəyiş
        </div>
        {success && <div style={{background:"#E8F8F5",color:"#17A589",padding:"10px 14px",borderRadius:8,marginBottom:12,fontSize:13}}>{success}</div>}
        {error && <div style={{background:"#FDEDEC",color:"#E74C3C",padding:"10px 14px",borderRadius:8,marginBottom:12,fontSize:13}}>{error}</div>}
        <div style={{display:"flex",gap:10}}>
          <input placeholder="Yeni istifadəçi adı..." style={{flex:1,padding:"10px 14px",borderRadius:8,border:"1.5px solid #A9DFBF",fontSize:13,outline:"none"}}
            value={newUsername} onChange={e=>setNewUsername(e.target.value)} />
          <button style={{padding:"0 18px",background:"linear-gradient(135deg,#17A589,#1ABC9C)",color:"#fff",border:"none",borderRadius:8,fontWeight:800,cursor:"pointer",fontSize:13}}
            onClick={handleUsernameUpdate} disabled={usernameLoading||!newUsername.trim()}>
            {usernameLoading ? "⏳" : "Dəyiş"}
          </button>
        </div>
      </div>

{/* ŞİFRƏ DƏYİŞDİR */}
          <div className="pw-card">
            <div className="form-card-title">🔐 Şifrəni dəyişdir</div>

            {pwSuccess && <div className="success-msg" style={{ marginBottom: 16 }}>✅ {pwSuccess}</div>}
            {pwError && <div className="err-msg" style={{ marginBottom: 16 }}>⚠️ {pwError}</div>}

            <div className="fg" style={{ marginBottom: 12 }}>
              <label className="fl">Cari şifrə</label>
              <input className="fi" type="password" placeholder="••••••••" value={pwForm.currentPassword} onChange={e => setPw("currentPassword", e.target.value)} />
            </div>
            <div className="form-row">
              <div className="fg">
                <label className="fl">Yeni şifrə</label>
                <input className="fi" type="password" placeholder="••••••••" value={pwForm.newPassword} onChange={e => setPw("newPassword", e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Yeni şifrəni təsdiqlə</label>
                <input className="fi" type="password" placeholder="••••••••" value={pwForm.confirmPassword} onChange={e => setPw("confirmPassword", e.target.value)} />
              </div>
            </div>
            <div className="save-row">
              <button className="btn-primary" onClick={handlePwSave} disabled={pwSaving}>
                {pwSaving ? <><span className="spin" /> Dəyişdirilir...</> : "🔐 Şifrəni dəyişdir"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}