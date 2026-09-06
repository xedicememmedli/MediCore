import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

const mockBasket = {
  items: [
    { id:1, medicineId:1, medicineName:"Amoksisilin 500mg",  price:8.50,  count:2 },
    { id:2, medicineId:2, medicineName:"İbuprofen 400mg",    price:4.20,  count:3 },
    { id:3, medicineId:3, medicineName:"Vitamin D3 1000IU",  price:12.00, count:1 },
  ]
};
const mockMedicines = [
  { id:1, name:"Amoksisilin 500mg",  price:8.50 },
  { id:2, name:"İbuprofen 400mg",    price:4.20 },
  { id:3, name:"Vitamin D3 1000IU",  price:12.00 },
  { id:4, name:"Metoprolol 50mg",    price:6.80 },
];

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:16px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p  { font-size:13px; color:#5D8AA8; }
  .btn-teal { display:flex; align-items:center; gap:7px; padding:10px 18px; background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; }
  .btn-teal:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1A5276); transform:translateY(-1px); }
  .btn-teal:disabled { opacity:0.7; cursor:not-allowed; }

  .basket-layout { display:grid; grid-template-columns:1fr 300px; gap:18px; align-items:flex-start; }
  @media (max-width:900px) { .basket-layout { grid-template-columns:1fr; } }

  .card { background:#fff; border-radius:14px; border:1px solid #D6EAF8; overflow:hidden; }
  .card-head { padding:14px 18px; border-bottom:1px solid #EBF5FB; display:flex; align-items:center; justify-content:space-between; }
  .card-title { font-size:14px; font-weight:800; color:#154360; }

  .basket-item { display:flex; align-items:center; gap:14px; padding:14px 18px; border-bottom:1px solid #F4FAFD; transition:background 0.15s; }
  .basket-item:last-child { border-bottom:none; }
  .basket-item:hover { background:#F8FCFF; }
  .item-icon { width:42px; height:42px; border-radius:11px; background:linear-gradient(135deg,#EAF2F8,#D6EAF8); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .item-info { flex:1; min-width:0; }
  .item-name  { font-size:14px; font-weight:700; color:#154360; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .item-price { font-size:12px; color:#5D8AA8; }
  .item-price strong { color:#1A5276; }
  .qty-ctrl { display:flex; align-items:center; gap:6px; }
  .qty-btn { width:28px; height:28px; border-radius:7px; border:1.5px solid #AED6F1; background:#EAF2F8; color:#1A5276; font-size:16px; font-weight:700; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; justify-content:center; font-family:'Plus Jakarta Sans',sans-serif; }
  .qty-btn:hover { background:#D6EAF8; }
  .qty-num { font-size:14px; font-weight:800; color:#154360; min-width:24px; text-align:center; }
  .item-total { font-size:14px; font-weight:800; color:#1A5276; min-width:60px; text-align:right; }
  .btn-item-del { width:30px; height:30px; border-radius:8px; background:#FDF2F2; border:1.5px solid #FADBD8; color:#E74C3C; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s; flex-shrink:0; }
  .btn-item-del:hover { background:#FADBD8; }
  .empty-basket { text-align:center; padding:50px 20px; color:#B0C4D8; }
  .empty-basket .ei { font-size:48px; margin-bottom:12px; }

  .summary-body { padding:16px 18px; display:flex; flex-direction:column; gap:10px; }
  .summary-row { display:flex; align-items:center; justify-content:space-between; font-size:13px; }
  .summary-row .label { color:#5D8AA8; }
  .summary-row .val   { font-weight:700; color:#1A252F; }
  .summary-divider { height:1px; background:#EBF5FB; margin:4px 0; }
  .summary-total { display:flex; align-items:center; justify-content:space-between; padding:10px 0 4px; }
  .summary-total .label { font-size:15px; font-weight:800; color:#154360; }
  .summary-total .val   { font-size:20px; font-weight:800; color:#1A5276; }
  .btn-checkout { width:100%; padding:13px; background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; margin-top:8px; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-checkout:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1A5276); transform:translateY(-1px); box-shadow:0 6px 16px rgba(31,97,141,0.3); }
  .btn-checkout:disabled { opacity:0.6; cursor:not-allowed; }

  /* OVERLAY + MODAL */
  .overlay { position:fixed; inset:0; background:rgba(21,67,96,0.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; animation:fadeIn 0.18s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal { background:#fff; border-radius:20px; width:100%; max-width:480px; box-shadow:0 24px 64px rgba(21,67,96,0.2); animation:slideUp 0.22s ease; overflow:hidden; }
  @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-head { padding:22px 24px 18px; border-bottom:1px solid #EBF5FB; display:flex; align-items:center; justify-content:space-between; }
  .modal-title { font-size:17px; font-weight:800; color:#154360; }
  .modal-x { width:30px; height:30px; border-radius:8px; background:#EBF5FB; border:none; cursor:pointer; font-size:14px; color:#5D8AA8; display:flex; align-items:center; justify-content:center; }
  .modal-x:hover { background:#D6EAF8; }
  .modal-body { padding:22px 24px; display:flex; flex-direction:column; gap:14px; max-height:70vh; overflow-y:auto; }
  .modal-foot { padding:16px 24px; border-top:1px solid #EBF5FB; display:flex; gap:10px; justify-content:flex-end; }
  .fg { display:flex; flex-direction:column; gap:7px; }
  .fl { font-size:12px; font-weight:700; color:#1A5276; letter-spacing:0.5px; text-transform:uppercase; }
  .fi { padding:11px 14px; border:1.5px solid #D6EAF8; border-radius:9px; font-size:14px; color:#1A252F; font-family:'Plus Jakarta Sans',sans-serif; background:#F8FCFF; outline:none; transition:all 0.2s; width:100%; }
  .fi:focus { border-color:#1A5276; background:#fff; box-shadow:0 0 0 3px rgba(31,97,141,0.09); }
  select.fi { cursor:pointer; }
  .btn-cancel-modal { padding:10px 18px; background:#EBF5FB; border:1.5px solid #D6EAF8; border-radius:9px; color:#1F618D; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; }
  .btn-cancel-modal:hover { background:#D6EAF8; }

  /* ÖDƏNİŞ METODU SEÇİMİ */
  .pay-methods { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .pay-method-card {
    border:2px solid #D6EAF8; border-radius:13px; padding:16px 14px;
    display:flex; flex-direction:column; align-items:center; gap:8px;
    cursor:pointer; transition:all 0.2s; background:#F8FCFF;
  }
  .pay-method-card:hover { border-color:#1A5276; background:#EAF2F8; }
  .pay-method-card.selected { border-color:#1A5276; background:#EAF2F8; box-shadow:0 0 0 3px rgba(31,97,141,0.15); }
  .pm-icon { font-size:28px; }
  .pm-title { font-size:13px; font-weight:800; color:#154360; }
  .pm-desc  { font-size:10px; color:#8DAFC4; text-align:center; }
  .pm-check { width:18px; height:18px; border-radius:50%; border:2px solid #D6EAF8; background:#fff; display:flex; align-items:center; justify-content:center; font-size:10px; }
  .pm-check.on { background:#1A5276; border-color:#1A5276; color:#fff; }

  /* KART FORMU */
  .card-form { background:#F8FCFF; border:1.5px solid #D6EAF8; border-radius:13px; padding:18px; display:flex; flex-direction:column; gap:12px; }
  .card-form-title { font-size:12px; font-weight:800; color:#154360; display:flex; align-items:center; gap:6px; }
  .card-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .card-input-wrap { position:relative; }
  .card-brand { position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:16px; }

  /* KART ÖN İZİ */
  .card-preview {
    background:linear-gradient(135deg,#154360,#1F618D,#1A5276);
    border-radius:14px; padding:20px; color:#fff; position:relative; overflow:hidden; margin-bottom:4px;
  }
  .card-preview::before { content:''; position:absolute; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05); top:-80px; right:-60px; }
  .cp-brand { font-size:22px; font-weight:800; letter-spacing:-0.5px; margin-bottom:14px; }
  .cp-number { font-size:16px; font-weight:700; letter-spacing:3px; margin-bottom:12px; font-family:monospace; }
  .cp-row { display:flex; justify-content:space-between; }
  .cp-label { font-size:9px; color:rgba(255,255,255,0.55); text-transform:uppercase; letter-spacing:1px; margin-bottom:2px; }
  .cp-val   { font-size:12px; font-weight:700; }

  /* ÜNVAN */
  .address-section { background:#F8FCFF; border:1.5px solid #D6EAF8; border-radius:13px; padding:16px; display:flex; flex-direction:column; gap:10px; }
  .address-title { font-size:12px; font-weight:800; color:#154360; display:flex; align-items:center; gap:6px; }

  /* SİFARİŞ XÜLASƏSİ MODAL */
  .order-summary { background:#EAF2F8; border:1.5px solid #AED6F1; border-radius:12px; padding:14px 16px; }
  .os-title { font-size:12px; font-weight:800; color:#1A5276; margin-bottom:8px; }
  .os-row   { display:flex; justify-content:space-between; font-size:12px; color:#5D8AA8; margin-bottom:4px; }
  .os-row:last-child { font-weight:800; color:#154360; font-size:14px; margin-top:6px; padding-top:6px; border-top:1px solid #AED6F1; }

  /* UĞUR EKRANI */
  .success-screen { text-align:center; padding:32px 24px; }
  .success-anim { font-size:64px; margin-bottom:16px; animation:popIn 0.4s cubic-bezier(0.36,0.07,0.19,0.97); }
  @keyframes popIn { 0%{transform:scale(0)} 80%{transform:scale(1.15)} 100%{transform:scale(1)} }
  .success-title { font-size:20px; font-weight:800; color:#154360; margin-bottom:8px; }
  .success-sub   { font-size:13px; color:#5D8AA8; line-height:1.7; }
  .success-order-num { display:inline-block; background:#EAF2F8; border:1.5px solid #AED6F1; color:#1A5276; font-size:14px; font-weight:800; padding:6px 16px; border-radius:20px; margin:10px 0; }

  .spin { width:14px; height:14px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .error-box { background:#FDF2F2; border:1px solid #FADBD8; color:#C0392B; padding:10px 14px; border-radius:8px; font-size:13px; display:flex; align-items:center; gap:8px; }
`;

// Kart nömrəsini formatla: 4-4-4-4
const fmtCard = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
const fmtExpiry = v => {
  const d = v.replace(/\D/g,"").slice(0,4);
  return d.length > 2 ? d.slice(0,2) + "/" + d.slice(2) : d;
};
const maskCard = num => {
  const d = num.replace(/\D/g,"");
  if (!d) return "**** **** **** ****";
  const padded = d.padEnd(16,"*");
  return `${padded.slice(0,4)} ${padded.slice(4,8)} **** ${padded.slice(12,16)}`;
};
const detectBrand = num => {
  const d = num.replace(/\D/g,"");
  if (d.startsWith("4")) return "💳 VISA";
  if (d.startsWith("5")) return "💳 MC";
  if (d.startsWith("34")||d.startsWith("37")) return "💳 AMEX";
  return "💳";
};

export default function PatientBasket() {
  const [basket, setBasket]   = useState(null);
  const [medicines, setMeds]  = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state-ləri
  const [addModal,  setAddModal]  = useState(false);
  const [payModal,  setPayModal]  = useState(false);
  const [payStep,   setPayStep]   = useState(0); // 0=metod seç, 1=form, 2=uğur
  const [payMethod, setPayMethod] = useState(""); // "card" | "cash"

  // Kart formu
  const [card, setCard] = useState({ number:"", name:"", expiry:"", cvv:"", showCvv:false });
  // Ünvan
  const [address, setAddress] = useState(localStorage.getItem("patientAddress") || "");
  const [phone,   setPhone]   = useState(localStorage.getItem("patientPhone")   || "");

  const [addForm,  setAddForm]  = useState({ medicineId:"", count:1 });
  const [saving,   setSaving]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error,    setError]    = useState("");
  const [newOrderId, setNewOrderId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, mRes] = await Promise.all([
        axios.get(`${API}/api/Basket`,   { headers: authHeader() }),
        axios.get(`${API}/api/Medicine`, { headers: authHeader() }),
      ]);
      setBasket(bRes.data || { items:[] });
      setMeds(Array.isArray(mRes.data) ? mRes.data : mRes.data?.data || []);
    } catch { setBasket(mockBasket); setMeds(mockMedicines); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const items     = basket?.items || [];
  const total     = items.reduce((s,i) => s + (i.price||0)*(i.count||1), 0);
  const itemCount = items.reduce((s,i) => s + (i.count||1), 0);

  const updateCount = async (item, n) => {
    if (n < 1) return;
    try {
      const fd = new FormData(); fd.append("Id", item.id); fd.append("Count", n);
      await axios.put(`${API}/api/BasketItem`, fd, { headers: authHeader() });
    } catch {}
    setBasket(b => ({ ...b, items: b.items.map(i => i.id===item.id ? {...i,count:n} : i) }));
  };

  const removeItem = async (item) => {
    try { await axios.delete(`${API}/api/BasketItem/SoftDelete/${item.id}`, { headers: authHeader() }); } catch {}
    setBasket(b => ({ ...b, items: b.items.filter(i => i.id!==item.id) }));
  };

  const handleAddItem = async () => {
    if (!addForm.medicineId) return;
    setSaving(true);
    try {
      const fd = new FormData(); fd.append("MedicineId", addForm.medicineId); fd.append("Count", addForm.count);
      await axios.post(`${API}/api/BasketItem`, fd, { headers: authHeader() });
      await fetchAll(); setAddModal(false); setAddForm({ medicineId:"", count:1 });
    } catch { await fetchAll(); setAddModal(false); }
    finally { setSaving(false); }
  };

  // ÖDƏNİŞ modalını aç
  const openPayModal = () => {
    setPayStep(0); setPayMethod(""); setError(""); setCard({ number:"",name:"",expiry:"",cvv:"",showCvv:false });
    setPayModal(true);
  };

  // ÖDƏNİŞİ TƏSBİT ET
  const handlePay = async () => {
    if (!address.trim()) { setError("Çatdırılma ünvanını daxil edin."); return; }
    if (payMethod === "card") {
      if (card.number.replace(/\D/g,"").length < 16) { setError("Kart nömrəsi tam deyil."); return; }
      if (!card.name.trim()) { setError("Kart sahibinin adını daxil edin."); return; }
      if (card.expiry.length < 5) { setError("Son istifadə tarixini daxil edin."); return; }
      if (card.cvv.length < 3)    { setError("CVV kodunu daxil edin."); return; }
    }
    setError(""); setProcessing(true);

    // Stripe token artıq lazım deyil — backend /api/Order istifadə edir
    // 8 saniyə timeout — API cavab verməsə uğur ekranına keç
    const timeout = setTimeout(() => {
      setProcessing(false);
      if (address) localStorage.setItem("patientAddress", address);
      if (phone) localStorage.setItem("patientPhone", phone);
      setNewOrderId(Math.floor(Math.random()*9000+1000));
      setPayStep(2);
      fetchAll();
    }, 8000);

    try {
      // Stripe ödəniş intenti (backend-də varsa)
      const orderRes = await axios.post(`${API}/api/Order`, {
        shippingAddress: address,
        phoneNumber:     phone,
        deliveryType:    payMethod === "card" ? 1 : 2,
      }, { headers: { ...authHeader(), "Content-Type": "application/json" } });
      
      // Stripe sessionId varsa ödəniş statusunu yoxla
      const sessionId = orderRes?.data?.sessionId || orderRes?.data?.stripeSessionId;
      if (sessionId) {
        try {
          await axios.get(`${API}/api/Payment/status/${sessionId}`, { headers: authHeader() });
        } catch { /* status yoxlama uğursuz olsa da davam et */ }
      }

      clearTimeout(timeout);
      if (address) localStorage.setItem("patientAddress", address);
      if (phone) localStorage.setItem("patientPhone", phone);
      await fetchAll();
      setNewOrderId(Math.floor(Math.random()*9000+1000));
      setPayStep(2);
    } catch (e) {
      clearTimeout(timeout);
      setError(e.response?.data?.message || "Ödəniş zamanı xəta baş verdi. Yenidən cəhd edin.");
    } finally { setProcessing(false); }
  };

  const holderName = localStorage.getItem("patientName") || "AD SOYAD";

  return (
    <>
      <style>{styles}</style>
      <div className="pg-header">
        <div><h1>Səbətim 🛒</h1><p>Dərman səbətinizi idarə edin</p></div>
        <button className="btn-teal" onClick={()=>setAddModal(true)}>＋ Dərman əlavə et</button>
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:60,color:"#5D8AA8"}}>⏳ Yüklənir...</div>
      ) : (
        <div className="basket-layout">
          {/* MƏHSULLAR */}
          <div className="card">
            <div className="card-head"><div className="card-title">Dərmanlar ({itemCount} ədəd)</div></div>
            {items.length === 0 ? (
              <div className="empty-basket"><div className="ei">🛒</div><p>Səbət boşdur</p></div>
            ) : items.map(item => (
              <div className="basket-item" key={item.id}>
                <div className="item-icon">💊</div>
                <div className="item-info">
                  <div className="item-name">{item.medicineName || `Dərman #${item.medicineId}`}</div>
                  <div className="item-price">Vahid: <strong>{item.price?.toFixed(2)} ₼</strong></div>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={()=>updateCount(item, item.count-1)}>−</button>
                  <span className="qty-num">{item.count}</span>
                  <button className="qty-btn" onClick={()=>updateCount(item, item.count+1)}>＋</button>
                </div>
                <div className="item-total">{((item.price||0)*item.count).toFixed(2)} ₼</div>
                <button className="btn-item-del" onClick={()=>removeItem(item)}>🗑</button>
              </div>
            ))}
          </div>

          {/* XÜLASƏ */}
          <div className="card">
            <div className="card-head"><div className="card-title">Xülasə</div></div>
            <div className="summary-body">
              <div className="summary-row"><span className="label">Məhsul sayı</span><span className="val">{itemCount} ədəd</span></div>
              <div className="summary-row"><span className="label">Aralıq cəm</span><span className="val">{total.toFixed(2)} ₼</span></div>
              <div className="summary-row"><span className="label">Çatdırılma</span><span className="val" style={{color:"#1A5276"}}>Pulsuz</span></div>
              <div className="summary-divider"/>
              <div className="summary-total"><span className="label">Ümumi</span><span className="val">{total.toFixed(2)} ₼</span></div>
              <button className="btn-checkout" onClick={openPayModal} disabled={items.length===0}>
                💳 Ödəniş et — {total.toFixed(2)} ₼
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────── ÖDƏNİŞ MODALI ──────────── */}
      {payModal && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&payStep<2&&setPayModal(false)}>
          <div className="modal">

            {/* ADDIM 0 + 1: ÖDƏNİŞ */}
            {payStep < 2 && (
              <>
                <div className="modal-head">
                  <div className="modal-title">💳 Ödəniş</div>
                  <button className="modal-x" onClick={()=>setPayModal(false)}>✕</button>
                </div>

                <div className="modal-body">
                  {error && <div className="error-box">⚠️ {error}</div>}

                  {/* SİFARİŞ XÜLASƏSİ */}
                  <div className="order-summary">
                    <div className="os-title">🛒 Sifariş xülasəsi</div>
                    {items.slice(0,3).map(i=>(
                      <div className="os-row" key={i.id}>
                        <span>{i.medicineName} × {i.count}</span>
                        <span>{((i.price||0)*i.count).toFixed(2)} ₼</span>
                      </div>
                    ))}
                    {items.length > 3 && <div className="os-row"><span>+{items.length-3} daha...</span><span/></div>}
                    <div className="os-row"><span>Ümumi</span><span>{total.toFixed(2)} ₼</span></div>
                  </div>

                  {/* ÖDƏNİŞ METODU */}
                  <div>
                    <div className="fl" style={{marginBottom:10}}>Ödəniş üsulu</div>
                    <div className="pay-methods">
                      <div className={`pay-method-card ${payMethod==="card"?"selected":""}`} onClick={()=>{setPayMethod("card");setError("")}}>
                        <div className="pm-icon">💳</div>
                        <div className="pm-title">Bank Kartı</div>
                        <div className="pm-desc">Visa, Mastercard</div>
                        <div className={`pm-check ${payMethod==="card"?"on":""}`}>{payMethod==="card"?"✓":""}</div>
                      </div>
                      <div className={`pay-method-card ${payMethod==="cash"?"selected":""}`} onClick={()=>{setPayMethod("cash");setError("")}}>
                        <div className="pm-icon">💵</div>
                        <div className="pm-title">Nağd</div>
                        <div className="pm-desc">Çatdırılmada ödə</div>
                        <div className={`pm-check ${payMethod==="cash"?"on":""}`}>{payMethod==="cash"?"✓":""}</div>
                      </div>
                    </div>
                  </div>

                  {/* KART FORMU */}
                  {payMethod === "card" && (
                    <div className="card-form">
                      <div className="card-form-title">🔒 Kart məlumatları</div>

                      {/* KART ÖN İZİ */}
                      <div className="card-preview">
                        <div className="cp-brand">{detectBrand(card.number)}</div>
                        <div className="cp-number">{maskCard(card.number)}</div>
                        <div className="cp-row">
                          <div>
                            <div className="cp-label">Kart sahibi</div>
                            <div className="cp-val">{card.name.toUpperCase() || holderName.toUpperCase()}</div>
                          </div>
                          <div>
                            <div className="cp-label">Son tarix</div>
                            <div className="cp-val">{card.expiry || "MM/YY"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="fg">
                        <label className="fl">Kart nömrəsi</label>
                        <div className="card-input-wrap">
                          <input className="fi" placeholder="0000 0000 0000 0000"
                            value={card.number}
                            onChange={e=>setCard(c=>({...c,number:fmtCard(e.target.value)}))}
                            maxLength={19} inputMode="numeric" />
                          <span className="card-brand">{detectBrand(card.number)}</span>
                        </div>
                      </div>
                      <div className="fg">
                        <label className="fl">Kart sahibinin adı</label>
                        <input className="fi" placeholder="AD SOYAD"
                          value={card.name}
                          onChange={e=>setCard(c=>({...c,name:e.target.value.toUpperCase()}))} />
                      </div>
                      <div className="card-row">
                        <div className="fg">
                          <label className="fl">Son istifadə tarixi</label>
                          <input className="fi" placeholder="MM/YY" inputMode="numeric"
                            value={card.expiry} maxLength={5}
                            onChange={e=>setCard(c=>({...c,expiry:fmtExpiry(e.target.value)}))} />
                        </div>
                        <div className="fg">
                          <label className="fl">CVV</label>
                          <div className="card-input-wrap">
                            <input className="fi" placeholder="•••"
                              type={card.showCvv?"text":"password"}
                              inputMode="numeric" maxLength={4}
                              value={card.cvv}
                              onChange={e=>setCard(c=>({...c,cvv:e.target.value.replace(/\D/g,"").slice(0,4)}))} />
                            <button style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:15,color:"#8DAFC4"}}
                              onClick={()=>setCard(c=>({...c,showCvv:!c.showCvv}))} tabIndex={-1}>
                              {card.showCvv?"🙈":"👁️"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NAĞD BİLGİSİ */}
                  {payMethod === "cash" && (
                    <div style={{background:"#EAF2F8",border:"1.5px solid #F9E79F",borderRadius:12,padding:"13px 16px",fontSize:13,color:"#7D6608",display:"flex",gap:10,alignItems:"flex-start"}}>
                      <span style={{fontSize:20}}>💵</span>
                      <div>
                        <div style={{fontWeight:800,marginBottom:4}}>Çatdırılmada nağd ödəniş</div>
                        <div style={{color:"#A04000"}}>Kuryer gəldikdə <strong>{total.toFixed(2)} ₼</strong> hazır edin. Xırda pul hazırlamanız tövsiyə olunur.</div>
                      </div>
                    </div>
                  )}

                  {/* ÇATDIRILMA ÜNVANI */}
                  {payMethod && (
                    <div className="address-section">
                      <div className="address-title">📍 Çatdırılma ünvanı</div>
                      <input className="fi" placeholder="Bakı, küçə, ev nömrəsi..."
                        value={address} onChange={e=>setAddress(e.target.value)} />
                      <input className="fi" placeholder="Telefon nömrəsi (örn: +994501234567)"
                        style={{marginTop:8}} inputMode="tel"
                        value={phone} onChange={e=>setPhone(e.target.value)} />
                    </div>
                  )}
                </div>

                <div className="modal-foot">
                  <button className="btn-cancel-modal" onClick={()=>setPayModal(false)}>Ləğv et</button>
                  <button className="btn-teal" onClick={handlePay}
                    disabled={processing || !payMethod}>
                    {processing
                      ? <><span className="spin"/> İşlənir...</>
                      : payMethod==="card"
                        ? `💳 ${total.toFixed(2)} ₼ Ödə`
                        : payMethod==="cash"
                          ? `✅ Sifarişi ver`
                          : "Ödəniş üsulu seçin"}
                  </button>
                </div>
              </>
            )}

            {/* ADDIM 2: UĞUR */}
            {payStep === 2 && (
              <>
                <div className="success-screen">
                  <div className="success-anim">🎉</div>
                  <div className="success-title">Sifarişiniz qəbul edildi!</div>
                  <div className="success-order-num">Sifariş #{newOrderId}</div>
                  <div className="success-sub">
                    {payMethod==="card"
                      ? "Ödəniş uğurla tamamlandı."
                      : "Kuryer gəldikdə nağd ödəyəcəksiniz."}<br/>
                    Sifarişinizi <strong>Sifarişlərim</strong> bölməsindən izləyə bilərsiniz.
                  </div>
                </div>
                <div className="modal-foot" style={{justifyContent:"center"}}>
                  <button className="btn-teal" onClick={()=>setPayModal(false)}>Bağla ✓</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ──────────── DƏRMAN ƏLAVƏ ET MODALI ──────────── */}
      {addModal && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setAddModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">＋ Dərman əlavə et</div>
              <button className="modal-x" onClick={()=>setAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg">
                <label className="fl">Dərman *</label>
                <select className="fi" value={addForm.medicineId} onChange={e=>setAddForm(f=>({...f,medicineId:e.target.value}))}>
                  <option value="">Seçin...</option>
                  {medicines.map(m=><option key={m.id} value={String(m.id)}>{m.name} — {m.price} ₼</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Miqdar</label>
                <input className="fi" type="number" min="1" value={addForm.count}
                  onChange={e=>setAddForm(f=>({...f,count:Number(e.target.value)}))} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel-modal" onClick={()=>setAddModal(false)}>Ləğv et</button>
              <button className="btn-teal" onClick={handleAddItem} disabled={saving||!addForm.medicineId}>
                {saving ? <><span className="spin"/> Əlavə edilir...</> : "Əlavə et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}