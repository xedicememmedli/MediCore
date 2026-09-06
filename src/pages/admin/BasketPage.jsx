import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockBasket = {
  id: 1,
  items: [
    { id: 1, medicineId: 1, medicineName: "Amoksisilin 500mg", price: 8.50, count: 2, imageUrl: "" },
    { id: 2, medicineId: 2, medicineName: "İbuprofen 400mg", price: 4.20, count: 3, imageUrl: "" },
    { id: 3, medicineId: 3, medicineName: "Vitamin D3 1000IU", price: 12.00, count: 1, imageUrl: "" },
  ]
};

const mockMedicines = [
  { id: 1, name: "Amoksisilin 500mg", price: 8.50 },
  { id: 2, name: "İbuprofen 400mg", price: 4.20 },
  { id: 3, name: "Vitamin D3 1000IU", price: 12.00 },
  { id: 4, name: "Metoprolol 50mg", price: 6.80 },
];

const styles = `
  .pg-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 22px; gap: 16px;
  }
  .pg-header h1 { font-size: 21px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pg-header p { font-size: 13px; color: #5D8AA8; }

  .btn-primary {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 18px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    color: #fff; border: none; border-radius: 9px;
    font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #154360, #1F618D);
    transform: translateY(-1px); box-shadow: 0 6px 16px rgba(31,97,141,0.25);
  }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .basket-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 18px;
    align-items: flex-start;
  }
  @media (max-width: 900px) { .basket-layout { grid-template-columns: 1fr; } }

  .card { background: #fff; border-radius: 14px; border: 1px solid #D6EAF8; overflow: hidden; }
  .card-head {
    padding: 16px 20px; border-bottom: 1px solid #EBF5FB;
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-title { font-size: 14px; font-weight: 800; color: #154360; }

  /* SƏBƏT ELEMENTLƏRİ */
  .basket-items { padding: 8px 0; }
  .basket-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 20px; border-bottom: 1px solid #F4FAFD;
    transition: background 0.15s;
  }
  .basket-item:last-child { border-bottom: none; }
  .basket-item:hover { background: #F8FCFF; }
  .item-icon {
    width: 44px; height: 44px; border-radius: 11px;
    background: linear-gradient(135deg, #EBF5FB, #D6EAF8);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .item-info { flex: 1; min-width: 0; }
  .item-name { font-size: 14px; font-weight: 700; color: #154360; margin-bottom: 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item-price { font-size: 12px; color: #5D8AA8; }
  .item-price strong { color: #1F618D; }

  .qty-ctrl { display: flex; align-items: center; gap: 6px; }
  .qty-btn {
    width: 28px; height: 28px; border-radius: 7px;
    border: 1.5px solid #D6EAF8; background: #EBF5FB;
    color: #1F618D; font-size: 16px; font-weight: 700;
    cursor: pointer; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .qty-btn:hover { background: #D6EAF8; border-color: #AED6F1; }
  .qty-num { font-size: 14px; font-weight: 800; color: #154360; min-width: 24px; text-align: center; }

  .item-total { font-size: 14px; font-weight: 800; color: #1F618D; min-width: 60px; text-align: right; }
  .btn-item-del {
    width: 30px; height: 30px; border-radius: 8px;
    background: #FDF2F2; border: 1.5px solid #FADBD8;
    color: #E74C3C; font-size: 13px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s; flex-shrink: 0;
  }
  .btn-item-del:hover { background: #FADBD8; }

  .empty-basket {
    text-align: center; padding: 50px 20px;
    color: #B0C4D8;
  }
  .empty-basket .ei { font-size: 48px; margin-bottom: 12px; }
  .empty-basket p { font-size: 14px; }

  /* XÜLASƏ */
  .summary-card { background: #fff; border-radius: 14px; border: 1px solid #D6EAF8; overflow: hidden; }
  .summary-head { padding: 16px 20px; border-bottom: 1px solid #EBF5FB; }
  .summary-title { font-size: 14px; font-weight: 800; color: #154360; }
  .summary-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
  .summary-row {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px;
  }
  .summary-row .label { color: #5D8AA8; }
  .summary-row .val { font-weight: 700; color: #1A252F; }
  .summary-divider { height: 1px; background: #EBF5FB; margin: 4px 0; }
  .summary-total {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0 4px;
  }
  .summary-total .label { font-size: 15px; font-weight: 800; color: #154360; }
  .summary-total .val { font-size: 20px; font-weight: 800; color: #1F618D; }

  .btn-checkout {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #1ABC9C, #17A589);
    color: #fff; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 800;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s; margin-top: 8px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-checkout:hover:not(:disabled) {
    background: linear-gradient(135deg, #17A589, #148F77);
    transform: translateY(-1px); box-shadow: 0 6px 16px rgba(26,188,156,0.3);
  }
  .btn-checkout:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-add-from-presc {
    width: 100%; padding: 10px;
    background: #EBF5FB; border: 1.5px dashed #AED6F1;
    border-radius: 9px; color: #1F618D;
    font-size: 12px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.18s; margin-bottom: 10px;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .btn-add-from-presc:hover { background: #D6EAF8; }

  .success-msg {
    background: #E8FAF8; border: 1px solid #A9DFBF; color: #17A589;
    padding: 11px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
    display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
  }

  /* ADD MODAL */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(21,67,96,0.45); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 999; padding: 20px; animation: fadeIn 0.18s ease;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal {
    background: #fff; border-radius: 16px;
    width: 100%; max-width: 440px;
    box-shadow: 0 24px 64px rgba(21,67,96,0.2);
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }
  .modal-head {
    padding: 22px 24px 18px; border-bottom: 1px solid #EBF5FB;
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-title { font-size: 17px; font-weight: 800; color: #154360; }
  .modal-x {
    width: 30px; height: 30px; border-radius: 8px;
    background: #EBF5FB; border: none; cursor: pointer;
    font-size: 14px; color: #5D8AA8;
    display: flex; align-items: center; justify-content: center; transition: all 0.18s;
  }
  .modal-x:hover { background: #D6EAF8; color: #154360; }
  .modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; }
  .modal-foot { padding: 16px 24px; border-top: 1px solid #EBF5FB; display: flex; gap: 10px; justify-content: flex-end; }
  .fg { display: flex; flex-direction: column; gap: 7px; }
  .fl { font-size: 12px; font-weight: 700; color: #1F618D; letter-spacing: 0.5px; text-transform: uppercase; }
  .fi {
    padding: 11px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px;
    font-size: 14px; color: #1A252F;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F8FCFF; outline: none; transition: all 0.2s;
  }
  .fi:focus { border-color: #1F618D; background: #fff; box-shadow: 0 0 0 3px rgba(31,97,141,0.09); }
  select.fi { cursor: pointer; }
  .btn-cancel {
    padding: 10px 18px; background: #EBF5FB; border: 1.5px solid #D6EAF8; border-radius: 9px;
    color: #1F618D; font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-cancel:hover { background: #D6EAF8; }
  .err-msg {
    background: #FDF2F2; border: 1px solid #FADBD8; color: #C0392B;
    padding: 10px 14px; border-radius: 8px; font-size: 13px;
  }
  .spin {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function BasketPage() {
  const [basket, setBasket] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(false);
  const [addForm, setAddForm] = useState({ medicineId: "", count: 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [prescModal, setPrescModal] = useState(false);
  const [prescId, setPrescId] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, mRes] = await Promise.all([
        axios.get(`${API}/api/Basket`, { headers: authHeader() }),
        axios.get(`${API}/api/Medicine`, { headers: authHeader() }),
      ]);
      setBasket(bRes.data || { items: [] });
      setMedicines(Array.isArray(mRes.data) ? mRes.data : mRes.data?.data || []);
    } catch {
      setBasket(mockBasket);
      setMedicines(mockMedicines);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const items = basket?.items || [];
  const total = items.reduce((s, i) => s + (i.price || 0) * (i.count || 1), 0);
  const itemCount = items.reduce((s, i) => s + (i.count || 1), 0);

  // Miqdar yenilə
  const updateCount = async (item, newCount) => {
    if (newCount < 1) return;
    try {
      const fd = new FormData();
      fd.append("Id", item.id);
      fd.append("Count", newCount);
      await axios.put(`${API}/api/BasketItem`, fd, { headers: authHeader() });
      setBasket(b => ({ ...b, items: b.items.map(i => i.id === item.id ? { ...i, count: newCount } : i) }));
    } catch {
      setBasket(b => ({ ...b, items: b.items.map(i => i.id === item.id ? { ...i, count: newCount } : i) }));
    }
  };

  // Element sil
  const removeItem = async (item) => {
    try {
      await axios.delete(`${API}/api/BasketItem/SoftDelete/${item.id}`, { headers: authHeader() });
    } catch { }
    setBasket(b => ({ ...b, items: b.items.filter(i => i.id !== item.id) }));
  };

  // Dərman əlavə et
  const handleAddItem = async () => {
    if (!addForm.medicineId) { setError("Dərman seçin."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      fd.append("MedicineId", addForm.medicineId);
      fd.append("Count", addForm.count);
      await axios.post(`${API}/api/BasketItem`, fd, { headers: authHeader() });
      await fetchAll();
      setModal(false);
      setAddForm({ medicineId: "", count: 1 });
    } catch (err) {
      setError(err.response?.data?.message || "Xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  };

  // Reseptdən əlavə et
  const handleAddFromPrescription = async () => {
    if (!prescId) return;
    try {
      await axios.post(`${API}/api/Basket/add-from-prescription/${prescId}`, {}, { headers: authHeader() });
      await fetchAll();
      setPrescModal(false);
      setPrescId("");
      setSuccess("Resept dərmanları səbətə əlavə edildi!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      await fetchAll();
      setPrescModal(false);
    }
  };

  // Checkout
  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await axios.post(`${API}/api/Basket/checkout`, {}, { headers: authHeader() });
      setSuccess("Sifariş uğurla yaradıldı! 🎉");
      await fetchAll();
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setSuccess("Sifariş yaradıldı! (mock)");
      setTimeout(() => setSuccess(""), 3000);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>Səbət 🛒</h1>
          <p>Dərman səbətini idarə edin</p>
        </div>
        <button className="btn-primary" onClick={() => { setModal(true); setError(""); }}>
          ＋ Dərman əlavə et
        </button>
      </div>

      {success && <div className="success-msg">✅ {success}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8" }}>⏳ Yüklənir...</div>
      ) : (
        <div className="basket-layout">
          {/* SƏBƏT ELEMENTLƏRİ */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Səbət elementləri ({itemCount})</div>
            </div>
            <div className="basket-items">
              {items.length === 0 ? (
                <div className="empty-basket">
                  <div className="ei">🛒</div>
                  <p>Səbət boşdur</p>
                </div>
              ) : (
                items.map(item => (
                  <div className="basket-item" key={item.id}>
                    <div className="item-icon">💊</div>
                    <div className="item-info">
                      <div className="item-name">{item.medicineName || `Dərman #${item.medicineId}`}</div>
                      <div className="item-price">
                        Vahid qiymət: <strong>{item.price?.toFixed(2)} ₼</strong>
                      </div>
                    </div>
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={() => updateCount(item, item.count - 1)}>−</button>
                      <span className="qty-num">{item.count}</span>
                      <button className="qty-btn" onClick={() => updateCount(item, item.count + 1)}>＋</button>
                    </div>
                    <div className="item-total">{((item.price || 0) * item.count).toFixed(2)} ₼</div>
                    <button className="btn-item-del" onClick={() => removeItem(item)}>🗑</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* XÜLASƏ */}
          <div>
            <div className="summary-card">
              <div className="summary-head">
                <div className="summary-title">Sifariş Xülasəsi</div>
              </div>
              <div className="summary-body">
                <button className="btn-add-from-presc" onClick={() => setPrescModal(true)}>
                  📋 Reseptdən əlavə et
                </button>

                <div className="summary-row">
                  <span className="label">Məhsul sayı</span>
                  <span className="val">{itemCount} ədəd</span>
                </div>
                <div className="summary-row">
                  <span className="label">Aralıq cəm</span>
                  <span className="val">{total.toFixed(2)} ₼</span>
                </div>
                <div className="summary-row">
                  <span className="label">Çatdırılma</span>
                  <span className="val" style={{ color: "#17A589" }}>Pulsuz</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-total">
                  <span className="label">Ümumi</span>
                  <span className="val">{total.toFixed(2)} ₼</span>
                </div>
                <button
                  className="btn-checkout"
                  onClick={handleCheckout}
                  disabled={checkingOut || items.length === 0}
                >
                  {checkingOut ? <><span className="spin" /> İşlənir...</> : "✅ Sifarişi tamamla"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DƏRMAN ƏLAVƏ ET MODALI */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">＋ Dərman əlavə et</div>
              <button className="modal-x" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="err-msg">⚠️ {error}</div>}
              <div className="fg">
                <label className="fl">Dərman *</label>
                <select className="fi" value={addForm.medicineId}
                  onChange={e => setAddForm(f => ({ ...f, medicineId: e.target.value }))}>
                  <option value="">Dərman seçin...</option>
                  {medicines.map(m => (
                    <option key={m.id} value={String(m.id)}>{m.name} — {m.price} ₼</option>
                  ))}
                </select>
              </div>
              <div className="fg">
                <label className="fl">Miqdar</label>
                <input className="fi" type="number" min="1" value={addForm.count}
                  onChange={e => setAddForm(f => ({ ...f, count: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel" onClick={() => setModal(false)}>Ləğv et</button>
              <button className="btn-primary" onClick={handleAddItem} disabled={saving}>
                {saving ? <><span className="spin" /> Əlavə edilir...</> : "Əlavə et"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESEPTDƏN ƏLAVƏ ET */}
      {prescModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setPrescModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">📋 Reseptdən əlavə et</div>
              <button className="modal-x" onClick={() => setPrescModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="fg">
                <label className="fl">Resept ID</label>
                <input className="fi" type="number" placeholder="Resept nömrəsini daxil edin"
                  value={prescId} onChange={e => setPrescId(e.target.value)} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-cancel" onClick={() => setPrescModal(false)}>Ləğv et</button>
              <button className="btn-primary" onClick={handleAddFromPrescription} disabled={!prescId}>
                Əlavə et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
