import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const mockData = [
  {
    id: 1,
    consultationId: 1,
    consultationInfo: "Dr. Əli Həsənov — 01.03.2026",
    instructions: "Gündə 3 dəfə, yeməkdən sonra qəbul edin",
    createdAt: "2026-03-01T10:00:00",
    items: [
      { id: 1, medicineName: "Amoksisilin 500mg", dosage: "500mg", quantity: 14, duration: "7 gün" },
      { id: 2, medicineName: "İbuprofen 400mg", dosage: "400mg", quantity: 10, duration: "5 gün" },
    ],
  },
  {
    id: 2,
    consultationId: 2,
    consultationInfo: "Dr. Günel Quliyeva — 04.03.2026",
    instructions: "Səhər axşam qəbul edin",
    createdAt: "2026-03-04T14:00:00",
    items: [
      { id: 3, medicineName: "Vitamin D3 1000IU", dosage: "1000IU", quantity: 30, duration: "30 gün" },
    ],
  },
];

const styles = `
  .pg-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 22px;
    gap: 16px;
  }

  .pg-header h1 {
    font-size: 21px;
    font-weight: 800;
    color: #154360;
    margin-bottom: 3px;
  }

  .pg-header p {
    font-size: 13px;
    color: #5D8AA8;
  }

  .count-badge {
    display: inline-flex;
    align-items: center;
    background: #EAF2F8;
    border: 1px solid #AED6F1;
    color: #1F618D;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 20px;
    margin-left: 10px;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1.5px solid #D6EAF8;
    border-radius: 9px;
    padding: 9px 14px;
    margin-bottom: 18px;
    max-width: 320px;
  }

  .search-bar:focus-within {
    border-color: #1F618D;
    box-shadow: 0 0 0 3px rgba(31, 97, 141, 0.10);
  }

  .search-bar input {
    border: none;
    background: none;
    outline: none;
    font-size: 13px;
    color: #1A252F;
    width: 100%;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .search-bar input::placeholder {
    color: #B0C4D8;
  }

  .empty-state {
    text-align: center;
    padding: 60px;
    background: #fff;
    border-radius: 14px;
    border: 1.5px dashed #AED6F1;
  }

  .empty-state .ei {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .empty-state h3 {
    font-size: 16px;
    font-weight: 700;
    color: #154360;
    margin-bottom: 6px;
  }

  .empty-state p {
    font-size: 13px;
    color: #5D8AA8;
  }

  .skel-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skel-card {
    background: #fff;
    border-radius: 14px;
    border: 1.5px solid #D6EAF8;
    overflow: hidden;
  }

  .skel-head-p {
    height: 60px;
    background: #EAF2F8;
  }

  .skel-body-p {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skel-line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, #EAF2F8 25%, #D6EAF8 50%, #EAF2F8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .presc-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .presc-card {
    background: #fff;
    border-radius: 14px;
    border: 1.5px solid #D6EAF8;
    overflow: hidden;
    transition: all 0.2s;
  }

  .presc-card:hover {
    border-color: #AED6F1;
    box-shadow: 0 6px 20px rgba(31, 97, 141, 0.08);
  }

  .presc-head {
    padding: 14px 18px;
    background: linear-gradient(135deg, #F0F6FC, #EAF2F8);
    border-bottom: 1px solid #D6EAF8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .presc-head-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .presc-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    flex-shrink: 0;
    box-shadow: 0 6px 14px rgba(31, 97, 141, 0.25);
  }

  .presc-doctor {
    font-size: 14px;
    font-weight: 800;
    color: #154360;
  }

  .presc-date {
    font-size: 11px;
    color: #8DAFC4;
    margin-top: 2px;
  }

  .presc-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .btn-pdf {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    background: #EAF2F8;
    border: 1.5px solid #AED6F1;
    border-radius: 8px;
    color: #1F618D;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all 0.18s;
  }

  .btn-pdf:hover {
    background: #D6EAF8;
    border-color: #85C1E9;
  }

  .btn-pdf:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-cart-all {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    color: #fff;
    border: none;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 800;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(31, 97, 141, 0.25);
  }

  .btn-cart-all:hover:not(:disabled) {
    background: linear-gradient(135deg, #154360, #1F618D);
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(21, 67, 96, 0.28);
  }

  .btn-cart-all:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .btn-cart-all.done {
    background: linear-gradient(135deg, #0B2D4E, #154360);
  }

  .presc-body {
    padding: 14px 18px;
  }

  .presc-inst {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #F0F6FC;
    border: 1px solid #D6EAF8;
    border-radius: 9px;
    padding: 10px 14px;
    font-size: 13px;
    color: #5D8AA8;
    line-height: 1.5;
    margin-bottom: 14px;
  }

  .items-title {
    font-size: 11px;
    font-weight: 800;
    color: #5D8AA8;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
  }

  .items-table th {
    text-align: left;
    font-size: 10px;
    font-weight: 800;
    color: #8DAFC4;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 6px 10px;
    background: #F0F6FC;
    border-bottom: 1px solid #EAF2F8;
  }

  .items-table td {
    padding: 9px 10px;
    font-size: 13px;
    color: #1A252F;
    border-bottom: 1px solid #F4FAFD;
  }

  .items-table tr:last-child td {
    border-bottom: none;
  }

  .items-table tr:hover td {
    background: #F8FBFE;
  }

  .med-name-cell {
    font-weight: 700;
    color: #154360;
  }

  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: #1F618D;
    color: #fff;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    z-index: 9998;
    transition: transform 0.3s ease;
    box-shadow: 0 8px 24px rgba(31, 97, 141, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }

  .toast.show {
    transform: translateX(-50%) translateY(0);
  }

  .flying-pill {
    position: fixed;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    z-index: 9999;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(31, 97, 141, 0.35);
  }

  .spin {
    width: 13px;
    height: 13px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default function PatientPrescriptions() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState({});
  const [cartLoading, setCartLoading] = useState({});
  const [cartDone, setCartDone] = useState({});
  const [toast, setToast] = useState({ show: false, text: "" });
  const [flyingPill, setFlyingPill] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/Prescription`, {
          headers: authHeader(),
        });
        setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch {
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      data.filter(
        (d) =>
          (d.consultationInfo || "").toLowerCase().includes(q) ||
          (d.instructions || "").toLowerCase().includes(q)
      )
    );
  }, [search, data]);

  const showToast = (text) => {
    setToast({ show: true, text });
    setTimeout(() => setToast({ show: false, text: "" }), 3000);
  };

  const handleDownloadPdf = async (id) => {
    setPdfLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await axios.get(`${API}/api/Prescription/DownloadPdf/${id}`, {
        headers: authHeader(),
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resept_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("📄 Resept yükləndi");
    } catch {
      showToast("⚠️ PDF yüklənə bilmədi");
    } finally {
      setPdfLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const handleAddAllToCart = async (presc, e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    setFlyingPill({
      x: rect.left + rect.width / 2 - 18,
      y: rect.top - 18,
      shrink: false,
    });

    setTimeout(() => {
      setFlyingPill((prev) =>
        prev ? { ...prev, x: window.innerWidth - 60, y: 30, shrink: true } : null
      );
    }, 50);

    setTimeout(() => setFlyingPill(null), 700);

    setCartLoading((c) => ({ ...c, [presc.id]: true }));

    try {
      await axios.post(
        `${API}/api/Basket/add-from-prescription/${presc.id}`,
        {},
        { headers: authHeader() }
      );
      setCartDone((c) => ({ ...c, [presc.id]: true }));
      showToast(`🛒 ${presc.items?.length || 0} dərman səbətə əlavə edildi!`);
    } catch {
      try {
        for (const item of presc.items || []) {
          const fd = new FormData();
          fd.append("MedicineId", item.medicineId || item.id);
          fd.append("Count", item.quantity || 1);
          await axios.post(`${API}/api/BasketItem`, fd, { headers: authHeader() });
        }
        setCartDone((c) => ({ ...c, [presc.id]: true }));
        showToast(`🛒 ${presc.items?.length || 0} dərman səbətə əlavə edildi!`);
      } catch {
        showToast("⚠️ Səbətə əlavə edilə bilmədi");
      }
    } finally {
      setCartLoading((c) => ({ ...c, [presc.id]: false }));
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "";
    return new Date(dt).toLocaleDateString("az-AZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <style>{styles}</style>

      {flyingPill && (
        <div
          className="flying-pill"
          style={{
            left: flyingPill.x,
            top: flyingPill.y,
            transform: flyingPill.shrink ? "scale(0.2)" : "scale(1)",
            opacity: flyingPill.shrink ? 0 : 1,
            transition: "all 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          💊
        </div>
      )}

      <div className={`toast ${toast.show ? "show" : ""}`}>{toast.text}</div>

      <div className="pg-header">
        <div>
          <h1>
            Reseptlərim <span className="count-badge">{filtered.length}</span>
          </h1>
          <p>Həkimlər tərəfindən yazılmış reseptlər</p>
        </div>
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
        <div className="skel-list">
          {[1, 2].map((i) => (
            <div className="skel-card" key={i}>
              <div className="skel-head-p" />
              <div className="skel-body-p">
                <div className="skel-line" style={{ width: "80%" }} />
                <div className="skel-line" style={{ width: "60%" }} />
                <div className="skel-line" style={{ width: "70%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">📋</div>
          <h3>Resept yoxdur</h3>
          <p>Həkim resept yazanda burada görünəcək</p>
        </div>
      ) : (
        <div className="presc-list">
          {filtered.map((presc) => (
            <div className="presc-card" key={presc.id}>
              <div className="presc-head">
                <div className="presc-head-left">
                  <div className="presc-icon">📋</div>
                  <div>
                    <div className="presc-doctor">
                      {presc.consultationInfo || `Konsultasiya #${presc.consultationId}`}
                    </div>
                    <div className="presc-date">📅 {formatDate(presc.createdAt)}</div>
                  </div>
                </div>

                <div className="presc-actions">
                  <button
                    className="btn-pdf"
                    onClick={() => handleDownloadPdf(presc.id)}
                    disabled={pdfLoading[presc.id]}
                  >
                    {pdfLoading[presc.id] ? (
                      <><span className="spin" /> Yüklənir...</>
                    ) : (
                      "📄 PDF yüklə"
                    )}
                  </button>

                  <button
                    className={`btn-cart-all ${cartDone[presc.id] ? "done" : ""}`}
                    onClick={(e) => handleAddAllToCart(presc, e)}
                    disabled={cartLoading[presc.id] || cartDone[presc.id]}
                  >
                    {cartLoading[presc.id] ? (
                      <><span className="spin" /> Əlavə edilir...</>
                    ) : cartDone[presc.id] ? (
                      "✅ Səbətdədir"
                    ) : (
                      "💊 Bütün dərmanları səbətə at"
                    )}
                  </button>
                </div>
              </div>

              <div className="presc-body">
                {presc.instructions && (
                  <div className="presc-inst">
                    <span>💡</span>
                    <span>{presc.instructions}</span>
                  </div>
                )}

                <div className="items-title">
                  Dərmanlar ({presc.items?.length || 0} əd.)
                </div>

                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Dərman adı</th>
                      <th>Doza</th>
                      <th>Miqdar</th>
                      <th>Müddət</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(presc.items || []).map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>
                          <span className="med-name-cell">💊 {item.medicineName}</span>
                        </td>
                        <td>{item.dosage || "—"}</td>
                        <td>{item.quantity || "—"}</td>
                        <td>{item.duration || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}