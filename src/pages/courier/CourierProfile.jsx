import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function CourierProfile() {
  const [profile, setProfile]   = useState(null);
  const [form, setForm]         = useState({ vehicleType: "", vehiclePlateNumber: "" });
  const [photo, setPhoto]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");
  const [err, setErr]           = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/api/Auth/my-profile`, { headers: authHeader() });
      const d = res.data?.data || res.data;
      setProfile(d);
      setForm({
        vehicleType: d?.vehicleType || "",
        vehiclePlateNumber: d?.vehiclePlateNumber || "",
      });
    } catch { /* mock */ setProfile({ vehicleType: "Motosiklet", vehiclePlateNumber: "99-AB-123" }); }
  };

  const handlePhotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true); setMsg(""); setErr("");
    try {
      const fd = new FormData();
      if (photo) fd.append("Photo", photo);
      fd.append("VehicleType", form.vehicleType);
      fd.append("VehiclePlateNumber", form.vehiclePlateNumber);
      const uid = localStorage.getItem("userId") || "";
      if (uid) fd.append("AppUserId", uid);
      await axios.put(`${API}/api/Courier/update-my-profile`, fd, { headers: authHeader() });
      setMsg("Profil uğurla yeniləndi ✅");
    } catch { setErr("Yeniləmə zamanı xəta baş verdi"); }
    finally { setSaving(false); }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) return;
    setUsernameLoading(true); setMsg(""); setErr("");
    try {
      await axios.patch(`${API}/api/Auth/update-username`,
        { newUsername: newUsername.trim() },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      localStorage.setItem("courierName", newUsername.trim());
      setMsg("İstifadəçi adı uğurla dəyişildi ✅");
      setNewUsername("");
    } catch { setErr("İstifadəçi adı dəyişilirkən xəta baş verdi"); }
    finally { setUsernameLoading(false); }
  };

  const courierName = localStorage.getItem("courierName") || "Kuryer";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#154360", marginBottom: 24 }}>
        🚴 Profil Məlumatları
      </h2>

      {msg && <div style={{ background:"#EAF2F8", color:"#D4AC0D", padding:"12px 16px", borderRadius:10, marginBottom:16, fontWeight:700, fontSize:13 }}>{msg}</div>}
      {err && <div style={{ background:"#FDEDEC", color:"#E74C3C", padding:"12px 16px", borderRadius:10, marginBottom:16, fontWeight:700, fontSize:13 }}>{err}</div>}

      {/* Avatar */}
      <div style={{ background:"#fff", border:"1.5px solid #D6EAF8", borderRadius:14, padding:"20px 24px", marginBottom:18, display:"flex", alignItems:"center", gap:20 }}>
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#EAF2F8,#D6EAF8)", border:"3px solid #AED6F1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, overflow:"hidden" }}>
            {photoPreview ? <img src={photoPreview} alt="profil" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : "🚴"}
          </div>
          <label style={{ position:"absolute", bottom:0, right:0, width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#1F618D,#2E86C1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"2px solid #fff", fontSize:12 }}>
            📷<input type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhotoChange}/>
          </label>
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:16, color:"#154360" }}>{courierName}</div>
          <div style={{ fontSize:12, color:"#8DAFC4", marginTop:3 }}>Şəkil dəyişmək üçün kamera ikonuna klikləyin</div>
        </div>
      </div>

      {/* Vasitə məlumatları */}
      <div style={{ background:"#fff", border:"1.5px solid #D6EAF8", borderRadius:14, padding:"20px 24px", marginBottom:18 }}>
        <div style={{ fontWeight:800, fontSize:12, color:"#1F618D", letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:16 }}>🚗 Vasitə Məlumatları</div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#1F618D", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:6 }}>Vasitə növü</div>
          <select value={form.vehicleType} onChange={e=>setForm({...form, vehicleType:e.target.value})}
            style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1.5px solid #D6EAF8", fontSize:13, outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            <option value="">Seçin...</option>
            <option value="Motosiklet">🏍️ Motosiklet</option>
            <option value="Velosiped">🚲 Velosiped</option>
            <option value="Avtomobil">🚗 Avtomobil</option>
            <option value="Piyada">🚶 Piyada</option>
          </select>
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#1F618D", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:6 }}>Nömrə nişanı</div>
          <input placeholder="Nömrə nişanı (məs: 99-AB-123)" value={form.vehiclePlateNumber}
            onChange={e=>setForm({...form, vehiclePlateNumber:e.target.value})}
            style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1.5px solid #D6EAF8", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ width:"100%", padding:"12px", background:"linear-gradient(135deg,#1F618D,#2E86C1)", color:"#fff", border:"none", borderRadius:10, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          {saving ? "⏳ Saxlanılır..." : "💾 Yadda Saxla"}
        </button>
      </div>

      {/* İstifadəçi adı */}
      <div style={{ background:"#fff", border:"1.5px solid #D6EAF8", borderRadius:14, padding:"20px 24px" }}>
        <div style={{ fontWeight:800, fontSize:12, color:"#1F618D", letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:16 }}>👤 İstifadəçi Adını Dəyiş</div>
        <div style={{ display:"flex", gap:10 }}>
          <input placeholder="Yeni istifadəçi adı..."
            value={newUsername} onChange={e=>setNewUsername(e.target.value)}
            style={{ flex:1, padding:"10px 14px", borderRadius:8, border:"1.5px solid #D6EAF8", fontSize:13, outline:"none" }}/>
          <button onClick={handleUsernameUpdate} disabled={usernameLoading||!newUsername.trim()}
            style={{ padding:"0 18px", background:"linear-gradient(135deg,#1F618D,#2E86C1)", color:"#fff", border:"none", borderRadius:8, fontWeight:800, cursor:"pointer", fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            {usernameLoading ? "⏳" : "Dəyiş"}
          </button>
        </div>
      </div>
    </div>
  );
}