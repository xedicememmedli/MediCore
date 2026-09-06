import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

const mockData = [
  {
    id: 1,
    consultationId: 1,
    consultationInfo: "Nigar Məmmədova",
    instructions: "Gündə 3 dəfə, yeməkdən sonra",
    items: [
      { id: 1, medicineId: 1, medicineName: "Amoksisilin 500mg", dosage: "500mg", quantity: 14, duration: "7 gün" },
      { id: 2, medicineId: 2, medicineName: "İbuprofen 400mg", dosage: "400mg", quantity: 10, duration: "5 gün" },
    ],
  },
  {
    id: 2,
    consultationId: 2,
    consultationInfo: "Rauf Əliyev",
    instructions: "Səhər axşam",
    items: [
      { id: 3, medicineId: 3, medicineName: "Vitamin D3", dosage: "1000IU", quantity: 30, duration: "30 gün" },
    ],
  },
  { id: 3, consultationId: 3, consultationInfo: "Sevinc Hüseynova", instructions: "", items: [] },
];

const mockConsultations = [
  { id: 1, label: "Nigar Məmmədova — 06.03.2026" },
  { id: 2, label: "Rauf Əliyev — 06.03.2026" },
  { id: 3, label: "Sevinc Hüseynova — 07.03.2026" },
];

const mockMedicines = [
  { id: 1, name: "Amoksisilin 500mg" },
  { id: 2, name: "İbuprofen 400mg" },
  { id: 3, name: "Vitamin D3 1000IU" },
  { id: 4, name: "Metoprolol 50mg" },
];

const styles = `
  .pg-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; gap: 16px; }
  .pg-header h1 { font-size: 21px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pg-header p { font-size: 13px; color: #5D8AA8; }

  .btn-primary { display: flex; align-items: center; gap: 7px; padding: 10px 18px; background: linear-gradient(135deg, #1F618D, #2E86C1); color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #154360, #1F618D); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(31,97,141,0.25); }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .search-bar { display: flex; align-items: center; gap: 8px; background: #fff; border: 1.5px solid #D6EAF8; border-radius: 9px; padding: 9px 14px; margin-bottom: 18px; max-width: 320px; transition: all 0.2s; }
  .search-bar:focus-within { border-color: #1F618D; box-shadow: 0 0 0 3px rgba(31,97,141,0.08); }
  .search-bar input { border: none; background: none; outline: none; font-size: 13px; color: #1A252F; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }
  .search-bar input::placeholder { color: #B0C4D8; }

  .presc-list { display: flex; flex-direction: column; gap: 14px; }
  .presc-card { background: #fff; border-radius: 14px; border: 1.5px solid #D6EAF8; overflow: hidden; transition: all 0.2s; }
  .presc-card:hover { border-color: #AED6F1; box-shadow: 0 6px 20px rgba(31,97,141,0.07); }

  .presc-head { padding: 14px 20px; background: linear-gradient(135deg, #F8FCFF, #EBF5FB); border-bottom: 1px solid #D6EAF8; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .presc-head-left { display: flex; align-items: center; gap: 12px; }
  .presc-num { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #1F618D, #2E86C1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 800; flex-shrink: 0; }
  .presc-patient { font-size: 14px; font-weight: 800; color: #154360; }
  .presc-con-id { font-size: 11px; color: #8DAFC4; margin-top: 2px; }
  .presc-actions { display: flex; gap: 7px; }
  .btn-pdf { display: flex; align-items: center; gap: 5px; padding: 6px 12px; background: #EAF2F8; border: 1.5px solid #F9E79F; border-radius: 7px; color: #D4AC0D; font-size: 11px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s; }
  .btn-pdf:hover { background: #F9E79F; }
  .btn-edit-sm { display: flex; align-items: center; gap: 5px; padding: 6px 12px; background: #EBF5FB; border: 1.5px solid #D6EAF8; border-radius: 7px; color: #1F618D; font-size: 11px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s; }
  .btn-edit-sm:hover { background: #D6EAF8; }
  .btn-del-sm { padding: 6px 10px; background: #FDF2F2; border: 1.5px solid #FADBD8; border-radius: 7px; color: #E74C3C; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s; }
  .btn-del-sm:hover { background: #FADBD8; }

  .presc-body { padding: 14px 20px; }
  .presc-inst { display: flex; align-items: flex-start; gap: 8px; background: #F8FCFF; border: 1px solid #EBF5FB; border-radius: 9px; padding: 10px 14px; font-size: 13px; color: #5D8AA8; line-height: 1.5; margin-bottom: 12px; }
  .items-title { font-size: 11px; font-weight: 800; color: #5D8AA8; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px; }
  .items-table { width: 100%; border-collapse: collapse; }
  .items-table th { font-size: 10px; font-weight: 800; color: #8DAFC4; text-align: left; padding: 7px 12px; background: #F8FCFF; border-bottom: 1px solid #EBF5FB; letter-spacing: 0.5px; text-transform: uppercase; }
  .items-table td { font-size: 13px; color: #1A252F; padding: 10px 12px; border-bottom: 1px solid #F4FAFD; }
  .items-table tr:last-child td { border-bottom: none; }
  .items-table tr:hover td { background: #F8FCFF; }
  .med-name-td { font-weight: 700; color: #154360; }
  .dosage-tag { display: inline-block; background: #EBF5FB; border: 1px solid #D6EAF8; color: #1F618D; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
  .qty-tag { display: inline-block; background: #EAF2F8; border: 1px solid #AED6F1; color: #1A5276; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
  .no-items { text-align: center; padding: 16px; color: #B0C4D8; font-size: 13px; background: #F8FCFF; border-radius: 8px; }

  .count-badge { display: inline-flex; align-items: center; background: #EBF5FB; border: 1px solid #D6EAF8; color: #1F618D; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 20px; margin-left: 10px; }
  .empty-state { text-align: center; padding: 60px; background: #fff; border-radius: 14px; border: 1.5px dashed #D6EAF8; }
  .empty-state .ei { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 16px; font-weight: 700; color: #154360; margin-bottom: 6px; }
  .empty-state p { font-size: 13px; color: #5D8AA8; }

  .overlay { position: fixed; inset: 0; background: rgba(21,67,96,0.45); backdrop-filter: blur(4px); display: flex; align-items: flex-start; justify-content: center; z-index: 999; padding: 20px; animation: fadeIn 0.18s ease; overflow-y: auto; }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal { background: #fff; border-radius: 16px; width: 100%; max-width: 600px; box-shadow: 0 24px 64px rgba(21,97,141,0.2); animation: slideUp 0.2s ease; margin: auto; }
  @keyframes slideUp { from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }
  .modal-head { padding: 22px 24px 18px; border-bottom: 1px solid #EBF5FB; display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-size: 17px; font-weight: 800; color: #154360; }
  .modal-x { width: 30px; height: 30px; border-radius: 8px; background: #EBF5FB; border: none; cursor: pointer; font-size: 14px; color: #5D8AA8; display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
  .modal-x:hover { background: #D6EAF8; }
  .modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; max-height: 65vh; overflow-y: auto; }
  .modal-foot { padding: 16px 24px; border-top: 1px solid #EBF5FB; display: flex; gap: 10px; justify-content: flex-end; }
  .section-title { font-size: 12px; font-weight: 800; color: #5D8AA8; letter-spacing: 0.8px; text-transform: uppercase; padding-bottom: 8px; border-bottom: 1px solid #EBF5FB; }
  .fg { display: flex; flex-direction: column; gap: 7px; }
  .fl { font-size: 12px; font-weight: 700; color: #1F618D; letter-spacing: 0.5px; text-transform: uppercase; }
  .fi { padding: 11px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px; font-size: 14px; color: #1A252F; font-family: 'Plus Jakarta Sans', sans-serif; background: #F8FCFF; outline: none; transition: all 0.2s; }
  .fi:focus { border-color: #1F618D; background: #fff; box-shadow: 0 0 0 3px rgba(31,97,141,0.09); }
  .fi::placeholder { color: #B0C4D8; }
  textarea.fi { resize: vertical; min-height: 70px; line-height: 1.5; }
  select.fi { cursor: pointer; }

  .item-rows { display: flex; flex-direction: column; gap: 10px; }
  .item-row { display: grid; grid-template-columns: 1fr 80px 60px 90px 32px; gap: 8px; align-items: center; }
  .btn-remove-item { width: 32px; height: 32px; border-radius: 8px; background: #FDF2F2; border: 1.5px solid #FADBD8; color: #E74C3C; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.18s; flex-shrink: 0; }
  .btn-remove-item:hover { background: #FADBD8; }
  .btn-remove-item:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-add-item { display: flex; align-items: center; gap: 7px; padding: 9px 14px; background: #EAF2F8; border: 1.5px dashed #AED6F1; border-radius: 9px; color: #1A5276; font-size: 12px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s; width: 100%; }
  .btn-add-item:hover { background: #D6EAF8; }

  .btn-cancel-modal { padding: 10px 18px; background: #EBF5FB; border: 1.5px solid #D6EAF8; border-radius: 9px; color: #1F618D; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s; }
  .btn-cancel-modal:hover { background: #D6EAF8; }
  .err-msg { background: #FDF2F2; border: 1px solid #FADBD8; color: #C0392B; padding: 10px 14px; border-radius: 8px; font-size: 13px; }
  .confirm-box { background: #fff; border-radius: 14px; padding: 28px; max-width: 360px; width: 100%; text-align: center; box-shadow: 0 24px 64px rgba(21,67,96,0.2); animation: slideUp 0.2s ease; }
  .confirm-box .ci { font-size: 40px; margin-bottom: 12px; }
  .confirm-box h3 { font-size: 17px; font-weight: 800; color: #154360; margin-bottom: 8px; }
  .confirm-box p { font-size: 13px; color: #5D8AA8; margin-bottom: 22px; line-height: 1.6; }
  .confirm-btns { display: flex; gap: 10px; }
  .btn-del-confirm { flex: 1; padding: 11px; background: linear-gradient(135deg, #E74C3C, #C0392B); color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .btn-del-confirm:hover:not(:disabled) { opacity: 0.9; }
  .btn-del-confirm:disabled { opacity: 0.7; cursor: not-allowed; }
  .spin { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const emptyItem = () => ({ id: "", medicineId: "", dosage: "", quantity: "", duration: "" });
const emptyForm = { consultationId: "", instructions: "", items: [emptyItem()] };

export default function MyPrescriptions() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, mRes] = await Promise.all([
        axios.get(`${API}/api/Prescription`, { headers: authHeader() }),
        axios.get(`${API}/api/Consultation`, { headers: authHeader() }),
        axios.get(`${API}/api/Medicine`, { headers: authHeader() }),
      ]);

      setData(Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || []);
      setConsultations(Array.isArray(cRes.data) ? cRes.data : cRes.data?.data || []);
      setMedicines(Array.isArray(mRes.data) ? mRes.data : mRes.data?.data || []);
    } catch {
      setData(mockData);
      setConsultations(mockConsultations);
      setMedicines(mockMedicines);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      data.filter(
        (d) =>
          (d.consultationInfo || "").toLowerCase().includes(q) ||
          (d.instructions || "").toLowerCase().includes(q) ||
          String(d.id).includes(q)
      )
    );
  }, [search, data]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ ...emptyForm, items: [emptyItem()] });
    setError("");
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      consultationId: String(item.consultationId || ""),
      instructions: item.instructions || "",
      items:
        item.items?.length > 0
          ? item.items.map((i) => ({
              id: i.id || "",
              medicineId: String(i.medicineId || ""),
              dosage: i.dosage || "",
              quantity: String(i.quantity || ""),
              duration: i.duration || "",
            }))
          : [emptyItem()],
    });
    setError("");
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setError("");
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setItemField = (idx, k, v) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, [k]: v } : it)),
    }));

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (idx) =>
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));

  const handleSave = async () => {
    if (!form.consultationId) {
      setError("Konsultasiya seçilməlidir.");
      return;
    }

    const validItems = form.items.filter((i) => i.medicineId);
    setSaving(true);
    setError("");

    try {
      if (editItem) {
        const fd = new FormData();
        fd.append("Id", editItem.id);
        fd.append("ConsultationId", form.consultationId);
        fd.append("Instructions", form.instructions || "");

        validItems.forEach((it, idx) => {
          if (it.id) fd.append(`Items[${idx}].Id`, it.id);
          fd.append(`Items[${idx}].MedicineId`, it.medicineId);
          fd.append(`Items[${idx}].Dosage`, it.dosage || "");
          fd.append(`Items[${idx}].Duration`, it.duration || "");
          fd.append(`Items[${idx}].Quantity`, it.quantity || 1);
        });

        await axios.put(`${API}/api/Prescription`, fd, { headers: authHeader() });
      } else {
        await axios.post(
          `${API}/api/Prescription`,
          {
            consultationId: Number(form.consultationId),
            instructions: form.instructions,
            items: validItems.map((it) => ({
              medicineId: Number(it.medicineId),
              dosage: it.dosage,
              quantity: Number(it.quantity) || 1,
              duration: it.duration,
              prescriptionId: 0,
            })),
          },
          { headers: jsonHeader() }
        );
      }

      await fetchAll();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/Prescription/SoftDelete/${deleteTarget.id}`, {
        headers: authHeader(),
      });
      await fetchAll();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handlePdf = async (id) => {
    try {
      const res = await axios.get(`${API}/api/Prescription/DownloadPdf/${id}`, {
        headers: authHeader(),
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `resept_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("PDF yüklənərkən xəta baş verdi.");
    }
  };

  const getMedName = (id) =>
    medicines.find((m) => m.id === Number(id))?.name || `Dərman #${id}`;

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>
            Reseptlərim <span className="count-badge">{filtered.length}</span>
          </h1>
          <p>Xəstələrə yazdığınız bütün reseptlər</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          ＋ Yeni Resept
        </button>
      </div>

      <div className="search-bar">
        <span style={{ color: "#B0C4D8", fontSize: 14 }}>🔍</span>
        <input
          placeholder="Resept axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8" }}>⏳ Yüklənir...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">📋</div>
          <h3>Resept tapılmadı</h3>
          <p>Yeni resept yazmaq üçün yuxarıdakı düyməyə klikləyin</p>
        </div>
      ) : (
        <div className="presc-list">
          {filtered.map((item) => (
            <div className="presc-card" key={item.id}>
              <div className="presc-head">
                <div className="presc-head-left">
                  <div className="presc-num">#{item.id}</div>
                  <div>
                    <div className="presc-patient">
                      {item.consultationInfo || `Konsultasiya #${item.consultationId}`}
                    </div>
                    <div className="presc-con-id">Konsultasiya #{item.consultationId}</div>
                  </div>
                </div>

                <div className="presc-actions">
                  <button className="btn-pdf" onClick={() => handlePdf(item.id)}>
                    📄 PDF
                  </button>
                  <button className="btn-edit-sm" onClick={() => openEdit(item)}>
                    ✏️ Redaktə
                  </button>
                  <button className="btn-del-sm" onClick={() => setDeleteTarget(item)}>
                    🗑
                  </button>
                </div>
              </div>

              <div className="presc-body">
                {item.instructions && (
                  <div className="presc-inst">
                    <span>📝</span>
                    {item.instructions}
                  </div>
                )}

                <div className="items-title">💊 Dərmanlar ({item.items?.length || 0})</div>

                {item.items?.length > 0 ? (
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Dərman</th>
                        <th>Dozaj</th>
                        <th>Miqdar</th>
                        <th>Müddət</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.items.map((it, i) => (
                        <tr key={it.id || i}>
                          <td>
                            <span className="med-name-td">
                              {it.medicineName || getMedName(it.medicineId)}
                            </span>
                          </td>
                          <td>
                            <span className="dosage-tag">{it.dosage || "—"}</span>
                          </td>
                          <td>
                            <span className="qty-tag">{it.quantity} ədəd</span>
                          </td>
                          <td style={{ color: "#5D8AA8", fontSize: 12 }}>{it.duration || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-items">Element yoxdur</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">
                {editItem ? "✏️ Resepti Redaktə Et" : "＋ Yeni Resept Yaz"}
              </div>
              <button className="modal-x" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="err-msg">⚠️ {error}</div>}

              <div className="section-title">📋 Əsas məlumat</div>

              <div className="fg">
                <label className="fl">Konsultasiya *</label>
                <select
                  className="fi"
                  value={form.consultationId}
                  onChange={(e) => setField("consultationId", e.target.value)}
                >
                  <option value="">Seçin...</option>
                  {consultations.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.label
                        ? c.label
                        : c.patientName
                        ? `#${c.id} — ${c.patientName}`
                        : `Konsultasiya #${c.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fg">
                <label className="fl">Təlimatlar</label>
                <textarea
                  className="fi"
                  rows={2}
                  placeholder="Qəbul qaydaları..."
                  value={form.instructions}
                  onChange={(e) => setField("instructions", e.target.value)}
                />
              </div>

              <div className="section-title">💊 Dərmanlar</div>

              <div className="item-rows">
                {form.items.map((it, idx) => (
                  <div className="item-row" key={idx}>
                    <select
                      className="fi"
                      value={it.medicineId}
                      onChange={(e) => setItemField(idx, "medicineId", e.target.value)}
                    >
                      <option value="">Dərman seçin...</option>
                      {medicines.map((m) => (
                        <option key={m.id} value={String(m.id)}>
                          {m.name}
                        </option>
                      ))}
                    </select>

                    <input
                      className="fi"
                      placeholder="Dozaj"
                      value={it.dosage}
                      onChange={(e) => setItemField(idx, "dosage", e.target.value)}
                    />

                    <input
                      className="fi"
                      type="number"
                      placeholder="Say"
                      value={it.quantity}
                      onChange={(e) => setItemField(idx, "quantity", e.target.value)}
                    />

                    <input
                      className="fi"
                      placeholder="Müddət"
                      value={it.duration}
                      onChange={(e) => setItemField(idx, "duration", e.target.value)}
                    />

                    <button
                      className="btn-remove-item"
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button className="btn-add-item" onClick={addItem}>
                ＋ Dərman əlavə et
              </button>
            </div>

            <div className="modal-foot">
              <button className="btn-cancel-modal" onClick={closeModal}>
                Ləğv et
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <span className="spin" /> Saxlanır...
                  </>
                ) : editItem ? (
                  "Yenilə"
                ) : (
                  "Resept yarat"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="confirm-box">
            <div className="ci">🗑️</div>
            <h3>Silinsin?</h3>
            <p>
              Resept <strong>#{deleteTarget.id}</strong> silinəcək.
            </p>
            <div className="confirm-btns">
              <button
                className="btn-cancel-modal"
                style={{ flex: 1 }}
                onClick={() => setDeleteTarget(null)}
              >
                Ləğv et
              </button>
              <button className="btn-del-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spin" /> : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}