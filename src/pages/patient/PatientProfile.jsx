import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

const mockProfile = {
  fullName:"Əli Həsənov", phoneNumber:"+994501234567",
  dateOfBirth:"1990-05-15", bloodType:"A+",
  height:178, weight:75, address:"Bakı, Nizami küç. 15",
  email:"ali@example.com", userName:"alihasanov",
};

const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","0+","0-"];

const styles = `
  .pp-root {}

  /* TİBB KARTI */
  .med-card-wrap { perspective:1000px; margin-bottom:28px; }
  .med-card {
    background:linear-gradient(135deg, #0D3349 0%, #1F618D 50%, #1A5276 100%);
    border-radius:20px; padding:28px 32px; position:relative; overflow:hidden;
    min-height:200px; cursor:pointer;
    transition:transform 0.6s cubic-bezier(0.23,1,0.32,1);
    transform-style:preserve-3d;
    box-shadow:0 20px 60px rgba(21,67,96,0.3);
  }
  .med-card:hover { transform:rotateY(3deg) rotateX(2deg) scale(1.01); }

  /* Holoqram naxışları */
  .med-card::before {
    content:''; position:absolute; inset:0; opacity:0.06;
    background:repeating-linear-gradient(
      45deg, #fff 0px, #fff 1px, transparent 1px, transparent 8px
    ),
    repeating-linear-gradient(
      -45deg, #1F618D 0px, #1F618D 1px, transparent 1px, transparent 8px
    );
  }
  /* Işıq efekti */
  .med-card::after {
    content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%;
    background:radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 60%);
    animation:holoPulse 3s ease-in-out infinite;
  }
  @keyframes holoPulse {
    0%,100%{transform:translate(10%,10%)} 50%{transform:translate(-10%,-10%)}
  }

  /* Kart məzmunu */
  .med-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; position:relative; z-index:1; }
  .med-card-brand { display:flex; align-items:center; gap:10px; }
  .med-card-logo { width:40px; height:40px; background:rgba(255,255,255,0.15); border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:20px; border:1px solid rgba(255,255,255,0.2); }
  .med-card-system { font-size:18px; font-weight:800; color:#fff; letter-spacing:-0.3px; }
  .med-card-system span { color:#AED6F1; }
  .med-card-id { font-size:10px; font-weight:700; color:rgba(255,255,255,0.5); letter-spacing:1px; text-transform:uppercase; }

  .med-card-chip {
    width:40px; height:30px; border-radius:5px;
    background:linear-gradient(135deg, #F1C40F, #2E86C1);
    border:1px solid rgba(255,255,255,0.3);
    display:flex; flex-direction:column; justify-content:center; gap:3px; padding:4px 6px;
  }
  .chip-line { height:2px; background:rgba(180,120,0,0.6); border-radius:1px; }

  .med-card-name { font-size:20px; font-weight:800; color:#fff; margin-bottom:6px; position:relative; z-index:1; letter-spacing:0.5px; text-transform:uppercase; }
  .med-card-info { display:flex; gap:20px; position:relative; z-index:1; flex-wrap:wrap; }
  .med-info-item { }
  .med-info-label { font-size:9px; font-weight:800; color:rgba(255,255,255,0.5); letter-spacing:1px; text-transform:uppercase; margin-bottom:2px; }
  .med-info-val { font-size:14px; font-weight:800; color:#fff; }
  .med-info-val.blood { color:#F1948A; font-size:16px; }

  /* Neon nöqtə */
  .neon-dot { width:8px; height:8px; border-radius:50%; background:#1F618D; display:inline-block; margin-right:6px; box-shadow:0 0 8px #1F618D; animation:neonBlink 2s infinite; }
  @keyframes neonBlink { 0%,100%{opacity:1;box-shadow:0 0 8px #1F618D} 50%{opacity:0.4;box-shadow:0 0 4px #1F618D} }

  .med-card-bottom { display:flex; align-items:center; justify-content:space-between; margin-top:20px; position:relative; z-index:1; }
  .med-card-dob { font-size:11px; color:rgba(255,255,255,0.6); font-weight:600; }
  .med-card-barcode { display:flex; gap:2px; align-items:flex-end; opacity:0.4; }
  .bc-bar { width:2px; background:#fff; border-radius:1px; }

  /* SAĞLİQ GÖSTƏRİCİLƏRİ */
  .health-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:22px; }
  @media (max-width:900px) { .health-stats { grid-template-columns:repeat(2,1fr); } }
  .hs-card { background:#fff; border:1.5px solid #D6EAF8; border-radius:13px; padding:16px; text-align:center; transition:all 0.2s; }
  .hs-card:hover { border-color:#AED6F1; box-shadow:0 4px 16px rgba(31,97,141,0.1); }
  .hs-icon { font-size:24px; margin-bottom:8px; }
  .hs-val { font-size:22px; font-weight:800; color:#154360; margin-bottom:2px; }
  .hs-label { font-size:11px; font-weight:700; color:#8DAFC4; text-transform:uppercase; letter-spacing:0.5px; }

  /* DÜZƏLİŞ FORMU */
  .edit-card { background:#fff; border-radius:14px; border:1.5px solid #D6EAF8; padding:24px; }
  .edit-title { font-size:16px; font-weight:800; color:#154360; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media (max-width:700px) { .form-grid { grid-template-columns:1fr; } }
  .fg { display:flex; flex-direction:column; gap:7px; }
  .fl { font-size:11px; font-weight:800; color:#1F618D; letter-spacing:0.5px; text-transform:uppercase; }
  .fi { padding:11px 14px; border:1.5px solid #D6EAF8; border-radius:9px; font-size:14px; color:#1A252F; font-family:'Plus Jakarta Sans',sans-serif; background:#F8FCFF; outline:none; transition:all 0.2s; }
  .fi:focus { border-color:#1A5276; box-shadow:0 0 0 3px rgba(31,97,141,0.09); }
  .fi::placeholder { color:#B0C4D8; }
  .fi-pass-wrap { position:relative; }
  .fi-pass-wrap .fi { padding-right:42px; width:100%; }
  .fi-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; color:#8DAFC4; }
  .fi-eye:hover { color:#1A5276; }

  /* ŞİFRƏ BÖLMƏSI */
  .pass-section { background:#F8FCFF; border:1.5px solid #D6EAF8; border-radius:12px; padding:20px; margin-top:16px; }
  .pass-section-title { font-size:13px; font-weight:800; color:#154360; margin-bottom:14px; display:flex; align-items:center; gap:6px; }

  .form-full { grid-column:1/-1; }
  .save-row { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
  .btn-save { display:flex; align-items:center; gap:7px; padding:11px 22px; background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; border:none; border-radius:9px; font-size:14px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; }
  .btn-save:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1A5276); transform:translateY(-1px); }
  .btn-save:disabled { opacity:0.7; cursor:not-allowed; }

  .toast { position:fixed; bottom:24px; right:24px; background:#1E8449; color:#fff; padding:12px 20px; border-radius:11px; font-size:13px; font-weight:700; box-shadow:0 8px 24px rgba(30,132,73,0.3); z-index:9999; animation:toastIn 0.3s ease; display:flex; align-items:center; gap:8px; }
  @keyframes toastIn { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  .toast.err { background:#C0392B; box-shadow:0 8px 24px rgba(192,57,43,0.3); }

  .skel-line { height:12px; border-radius:6px; background:linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; margin-bottom:8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .pg-header { margin-bottom:22px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }
`;

// Barkod dəkoru
const BarcodeDeco = () => (
  <div className="med-card-barcode">
    {[3,5,2,6,3,4,7,2,5,3,6,2,4,3,5].map((h,i)=>(
      <div key={i} className="bc-bar" style={{height:`${h * 3}px`}}/>
    ))}
  </div>
);

export default function PatientProfile() {
  const [profile, setProfile]     = useState(null);
  const [form, setForm]           = useState({});
  const [photoUploading, setPhotoUploading] = useState(false);
  const [newUsername,    setNewUsername]    = useState("");
  const [usernameLoading,setUsernameLoading]= useState(false);
  const [profilePhoto,   setProfilePhoto]   = useState(null);
  const [passForm, setPassForm]   = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [showPasses, setShowPasses] = useState({cur:false, newp:false, conf:false});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const patientName = localStorage.getItem("patientName") || "Xəstə";

  const showToast = (msg, isErr=false) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/Auth/my-profile`, { headers: authHeader() });
        const p = res.data?.data || res.data || mockProfile;
        setProfile(p);
        setForm({
          fullName: p.fullName || "",
          phoneNumber: p.phoneNumber || "",
          dateOfBirth: p.dateOfBirth?.split("T")[0] || "",
          bloodType: p.bloodType || "",
          height: p.height || "",
          weight: p.weight || "",
          address: p.address || "",
          email: p.email || "",
        });
      } catch {
        setProfile(mockProfile);
        setForm({ ...mockProfile, dateOfBirth: mockProfile.dateOfBirth });
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/Auth/update-profile`, form, { headers: jsonHeader() });
      showToast("✅ Profil uğurla yeniləndi!");
      localStorage.setItem("patientName", form.fullName || patientName);
    } catch (e) {
      showToast(e.response?.data?.message || "Xəta baş verdi.", true);
    } finally { setSaving(false); }
  };

  const handleChangePass = async () => {
    if (!passForm.currentPassword || !passForm.newPassword) { showToast("Bütün şifrə sahələrini doldurun.", true); return; }
    if (passForm.newPassword !== passForm.confirmPassword) { showToast("Yeni şifrələr uyğun gəlmir.", true); return; }
    if (passForm.newPassword.length < 6) { showToast("Şifrə ən az 6 simvol olmalıdır.", true); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/api/Auth/change-password`, {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      }, { headers: jsonHeader() });
      showToast("✅ Şifrə uğurla dəyişdirildi!");
      setPassForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (e) {
      showToast(e.response?.data?.message || "Cari şifrə yanlışdır.", true);
    } finally { setSaving(false); }
  };

  // İstifadəçi adını dəyiş
  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) return;
    setUsernameLoading(true);
    try {
      await axios.patch(`${API}/api/Auth/update-username`,
        { newUsername: newUsername.trim() },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      localStorage.setItem("userName", newUsername.trim());
      localStorage.setItem("patientName", newUsername.trim());
      showToast("İstifadəçi adı uğurla dəyişildi ✅");
      setNewUsername("");
    } catch { showToast("İstifadəçi adı dəyişilirkən xəta", "error"); }
    finally { setUsernameLoading(false); }
  };

  // Profil şəkli yüklə
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const userId = localStorage.getItem("userId") || "";
    if (!userId) { showToast("İstifadəçi ID tapılmadı", "error"); return; }
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await axios.post(`${API}/api/User/UploadProfileImage/${userId}`, fd, { headers: authHeader() });
      setProfilePhoto(URL.createObjectURL(file));
      showToast("Şəkil uğurla yükləndi ✅");
    } catch { showToast("Şəkil yüklənərkən xəta baş verdi", "error"); }
    finally { setPhotoUploading(false); }
  };

  const age = form.dateOfBirth
    ? Math.floor((new Date() - new Date(form.dateOfBirth)) / (365.25 * 24 * 3600 * 1000))
    : "—";

  const initials = (name) => (name||"X").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <h1>Profilim</h1>
        <p>Şəxsi məlumatlarınızı idarə edin</p>
      </div>

      {loading ? (
        <>
          <div style={{background:"#fff",borderRadius:20,padding:28,marginBottom:22,height:200,background:"linear-gradient(135deg,#EBF5FB,#D6EAF8)"}} />
          <div className="health-stats">{[1,2,3,4].map(i=><div key={i} style={{background:"#fff",borderRadius:13,padding:16,border:"1.5px solid #D6EAF8",height:80}}><div className="skel-line"/><div className="skel-line" style={{width:"60%"}}/></div>)}</div>
        </>
      ) : (
        <>
          {/* ───── TİBB KARTI ───── */}
          <div className="med-card-wrap">
            <div className="med-card">
              <div className="med-card-top">
                <div className="med-card-brand">
                  <div className="med-card-logo">🏥</div>
                  <div>
                    <div className="med-card-system">Medi<span>Core</span></div>
                    <div className="med-card-id">Pasiyent ID · #{Math.floor(Math.random()*90000+10000)}</div>
                  </div>
                </div>
                <div className="med-card-chip">
                  <div className="chip-line"/><div className="chip-line"/><div className="chip-line"/>
                </div>
              </div>

              <div className="med-card-name">
                <span className="neon-dot"/>
                {form.fullName || patientName}
              </div>

              <div className="med-card-info">
                <div className="med-info-item">
                  <div className="med-info-label">Qan Qrupu</div>
                  <div className="med-info-val blood">{form.bloodType || "—"}</div>
                </div>
                <div className="med-info-item">
                  <div className="med-info-label">Yaş</div>
                  <div className="med-info-val">{age}</div>
                </div>
                <div className="med-info-item">
                  <div className="med-info-label">Boy</div>
                  <div className="med-info-val">{form.height ? `${form.height} sm` : "—"}</div>
                </div>
                <div className="med-info-item">
                  <div className="med-info-label">Çəki</div>
                  <div className="med-info-val">{form.weight ? `${form.weight} kq` : "—"}</div>
                </div>
              </div>

              <div className="med-card-bottom">
                <div className="med-card-dob">
                  D.O.B: {form.dateOfBirth || "—"}
                </div>
                <BarcodeDeco />
              </div>
            </div>
          </div>

          {/* ───── SAĞLİQ GÖSTƏRİCİLƏRİ ───── */}
          <div className="health-stats">
            <div className="hs-card">
              <div className="hs-icon">🩸</div>
              <div className="hs-val">{form.bloodType || "—"}</div>
              <div className="hs-label">Qan Qrupu</div>
            </div>
            <div className="hs-card">
              <div className="hs-icon">📏</div>
              <div className="hs-val">{form.height || "—"}</div>
              <div className="hs-label">Boy (sm)</div>
            </div>
            <div className="hs-card">
              <div className="hs-icon">⚖️</div>
              <div className="hs-val">{form.weight || "—"}</div>
              <div className="hs-label">Çəki (kq)</div>
            </div>
            <div className="hs-card">
              <div className="hs-icon">🎂</div>
              <div className="hs-val">{age}</div>
              <div className="hs-label">Yaş</div>
            </div>
          </div>

          {/* ───── DÜZƏLİŞ FORMU ───── */}
          <div className="edit-card">
            <div className="edit-title">✏️ Məlumatlarımı Yenilə</div>
            <div className="form-grid">
              <div className="fg">
                <label className="fl">Ad Soyad</label>
                <input className="fi" placeholder="Ad Soyad" value={form.fullName||""} onChange={e=>set("fullName",e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Telefon</label>
                <input className="fi" placeholder="+994501234567" value={form.phoneNumber||""} onChange={e=>set("phoneNumber",e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Email</label>
                <input className="fi" type="email" placeholder="mail@example.com" value={form.email||""} onChange={e=>set("email",e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Doğum Tarixi</label>
                <input className="fi" type="date" value={form.dateOfBirth||""} onChange={e=>set("dateOfBirth",e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Qan Qrupu</label>
                <select className="fi" value={form.bloodType||""} onChange={e=>set("bloodType",e.target.value)}>
                  <option value="">Seçin</option>
                  {BLOOD_TYPES.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Boy (sm)</label>
                <input className="fi" type="number" placeholder="178" value={form.height||""} onChange={e=>set("height",e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Çəki (kq)</label>
                <input className="fi" type="number" placeholder="75" value={form.weight||""} onChange={e=>set("weight",e.target.value)} />
              </div>
              <div className="fg">
                <label className="fl">Ünvan</label>
                <input className="fi" placeholder="Bakı, Nizami küç." value={form.address||""} onChange={e=>set("address",e.target.value)} />
              </div>
            </div>

            <div className="save-row">
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? "⏳ Saxlanılır..." : "💾 Saxla"}
              </button>
            </div>

            {/* ŞİFRƏ DƏYİŞDİR */}
            <div className="pass-section">
              <div className="pass-section-title">🔐 Şifrəni Dəyişdir</div>
              <div className="form-grid">
                {[
                  { key:"currentPassword", label:"Cari Şifrə",   show:"cur",  ph:"Cari şifrəni daxil edin" },
                  { key:"newPassword",     label:"Yeni Şifrə",   show:"newp", ph:"Yeni şifrə (min. 6 simvol)" },
                  { key:"confirmPassword", label:"Yeni Şifrə (təkrar)", show:"conf", ph:"Yeni şifrəni təkrarlayın" },
                ].map(({key,label,show,ph})=>(
                  <div className="fg" key={key}>
                    <label className="fl">{label}</label>
                    <div className="fi-pass-wrap">
                      <input className="fi"
                        type={showPasses[show]?"text":"password"}
                        placeholder={ph}
                        value={passForm[key]}
                        onChange={e=>setPassForm(f=>({...f,[key]:e.target.value}))} />
                      <button className="fi-eye" onClick={()=>setShowPasses(s=>({...s,[show]:!s[show]}))} tabIndex={-1}>
                        {showPasses[show]?"🙈":"👁️"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="save-row">
                <button className="btn-save" onClick={handleChangePass} disabled={saving}>
                  {saving?"⏳ Dəyişdirilir...":"🔑 Şifrəni Dəyişdir"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className={`toast ${toast.isErr?"err":""}`}>{toast.msg}</div>
      )}
    </>
  );
}