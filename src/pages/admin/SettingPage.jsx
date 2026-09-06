import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockData = [
  { id: 1, key: "site_name", value: "MediCore" },
  { id: 2, key: "support_email", value: "support@medicore.az" },
  { id: 3, key: "delivery_fee", value: "0" },
  { id: 4, key: "max_basket_items", value: "20" },
  { id: 5, key: "consultation_duration", value: "30" },
];

const styles = `
  .pg-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 22px; gap: 16px;
  }
  .pg-header h1 { font-size: 21px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pg-header p { font-size: 13px; color: #5D8AA8; }

  .btn-primary {
    display: flex; align-items: center; gap: 7px; padding: 10px 18px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    color: #fff; border: none; border-radius: 9px;
    font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #154360, #1F618D);
    transform: translateY(-1px); box-shadow: 0 6px 16px rgba(31,97,141,0.25);
  }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #D6EAF8;
    border-radius: 9px; padding: 9px 14px;
    margin-bottom: 18px; max-width: 320px; transition: all 0.2s;
  }
  .search-bar:focus-within { border-color: #1F618D; box-shadow: 0 0 0 3px rgba(31,97,141,0.08); }
  .search-bar input {
    border: none; background: none; outline: none;
    font-size: 13px; color: #1A252F; width: 100%;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .search-bar input::placeholder { color: #B0C4D8; }

  .settings-card { background: #fff; border-radius: 14px; border: 1px solid #D6EAF8; overflow: hidden; }
  .settings-table { width: 100%; border-collapse: collapse; }
  .settings-table th {
    font-size: 10px; font-weight: 800; color: #5D8AA8;
    text-align: left; padding: 11px 20px;
    letter-spacing: 0.8px; text-transform: uppercase;
    background: #F8FCFF; border-bottom: 1px solid #EBF5FB;
  }
  .settings-table td {
    padding: 13px 20px; border-bottom: 1px solid #F4FAFD;
    vertical-align: middle;
  }
  .settings-table tr:last-child td { border-bottom: none; }
  .settings-table tr:hover td { background: #F8FCFF; }

  .key-cell {
    display: flex; align-items: center; gap: 10px;
  }
  .key-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0;
  }
  .key-name { font-size: 13px; font-weight: 700; color: #154360; font-family: monospace; }
  .val-cell {
    font-size: 13px; color: #1A252F;
    max-width: 300px; word-break: break-all;
  }
  .val-chip {
    display: inline-block;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    color: #1F618D; font-size: 12px; font-weight: 600;
    padding: 3px 10px; border-radius: 6px; font-family: monospace;
  }
  .action-btns { display: flex; gap: 6px; }
  .btn-sm-edit {
    padding: 6px 10px; background: #EBF5FB; border: 1.5px solid #D6EAF8;
    border-radius: 7px; color: #1F618D; font-size: 11px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-sm-edit:hover { background: #D6EAF8; }
  .btn-sm-del {
    padding: 6px 10px; background: #FDF2F2; border: 1.5px solid #FADBD8;
    border-radius: 7px; color: #E74C3C; font-size: 11px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-sm-del:hover { background: #FADBD8; }

  .count-badge {
    display: inline-flex; align-items: center;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    color: #1F618D; font-size: 12px; font-weight: 700;
    padding: 2px 10px; border-radius: 20px; margin-left: 10px;
  }
  .empty-state {
    text-align: center; padding: 60px;
    background: #fff; border-radius: 14px; border: 1.5px dashed #D6EAF8;
  }
  .empty-state .ei { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 16px; font-weight: 700; color: #154360; margin-bottom: 6px; }
  .empty-state p { font-size: 13px; color: #5D8AA8; }

  .overlay {
    position: fixed; inset: 0;
    background: rgba(21,67,96,0.45); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 999; padding: 20px; animation: fadeIn 0.18s ease;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .modal {
    background: #fff; border-radius: 16px; width: 100%; max-width: 440px;
    box-shadow: 0 24px 64px rgba(21,67,96,0.2); animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }
  .modal-head {
    padding: 22px 24px 18px; border-bottom: 1px solid #EBF5FB;
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-title { font-size: 17px; font-weight: 800; color: #154360; }
  .modal-x {
    width: 30px; height: 30px; border-radius: 8px; background: #EBF5FB;
    border: none; cursor: pointer; font-size: 14px; color: #5D8AA8;
    display: flex; align-items: center; justify-content: center; transition: all 0.18s;
  }
  .modal-x:hover { background: #D6EAF8; color: #154360; }
  .modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; }
  .modal-foot { padding: 16px 24px; border-top: 1px solid #EBF5FB; display: flex; gap: 10px; justify-content: flex-end; }
  .fg { display: flex; flex-direction: column; gap: 7px; }
  .fl { font-size: 12px; font-weight: 700; color: #1F618D; letter-spacing: 0.5px; text-transform: uppercase; }
  .fi {
    padding: 11px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px;
    font-size: 14px; color: #1A252F; font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F8FCFF; outline: none; transition: all 0.2s;
  }
  .fi:focus { border-color: #1F618D; background: #fff; box-shadow: 0 0 0 3px rgba(31,97,141,0.09); }
  .fi::placeholder { color: #B0C4D8; }
  .fi-mono { font-family: monospace; }
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
  .field-hint { font-size: 11px; color: #8DAFC4; margin-top: 2px; }
  .confirm-box {
    background: #fff; border-radius: 14px; padding: 28px;
    max-width: 360px; width: 100%; text-align: center;
    box-shadow: 0 24px 64px rgba(21,67,96,0.2); animation: slideUp 0.2s ease;
  }
  .confirm-box .ci { font-size: 40px; margin-bottom: 12px; }
  .confirm-box h3 { font-size: 17px; font-weight: 800; color: #154360; margin-bottom: 8px; }
  .confirm-box p { font-size: 13px; color: #5D8AA8; margin-bottom: 22px; line-height: 1.6; }
  .confirm-btns { display: flex; gap: 10px; }
  .btn-del-confirm {
    flex: 1; padding: 11px;
    background: linear-gradient(135deg, #E74C3C, #C0392B);
    color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .btn-del-confirm:hover:not(:disabled) { opacity: 0.9; }
  .btn-del-confirm:disabled { opacity: 0.7; cursor: not-allowed; }
  .spin {
    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const KEY_ICONS = {
  site_name: "🏥",
  support_email: "📧",
  delivery_fee: "🚚",
  max_basket_items: "🛒",
  consultation_duration: "⏱️"
};

const getIcon = (key) => KEY_ICONS[key] || "⚙️";
const emptyForm = { key: "", value: "" };

export default function SettingPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [notifForm, setNotifForm] = useState({
    appUserId: "",
    title: "",
    message: "",
    orderId: ""
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");
  const [patients, setPatients] = useState([]);

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/Setting`, { headers: authHeader() });
      setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await axios.get(`${API}/api/User/GetAllPatients`, {
        headers: authHeader()
      });
      setPatients(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      setPatients([]);
    }
  };

  useEffect(() => {
    fetchData();
    loadPatients();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      data.filter(
        (d) =>
          (d.key || "").toLowerCase().includes(q) ||
          (d.value || "").toLowerCase().includes(q)
      )
    );
  }, [search, data]);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ key: item.key || "", value: item.value || "" });
    setError("");
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setError("");
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.key.trim()) {
      setError("Açar (key) sahəsi mütləqdir.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("Key", form.key.trim());
      fd.append("Value", form.value.trim());

      if (editItem) {
        fd.append("Id", editItem.id);
        await axios.put(`${API}/api/Setting`, fd, { headers: authHeader() });
      } else {
        await axios.post(`${API}/api/Setting`, fd, { headers: authHeader() });
      }

      await fetchData();
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
      await axios.delete(`${API}/api/Setting/SoftDelete/${deleteTarget.id}`, {
        headers: authHeader()
      });
      await fetchData();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const sendNotification = async () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      setNotifMsg("❌ Başlıq və mətn mütləqdir");
      return;
    }

    setNotifLoading(true);
    setNotifMsg("");

    try {
      const fd = new FormData();
      fd.append("AppUserId", notifForm.appUserId || "");
      fd.append("Title", notifForm.title.trim());
      fd.append("Message", notifForm.message.trim());
      fd.append("OrderId", notifForm.orderId || "");

      await axios.post(`${API}/api/Notification`, fd, {
        headers: authHeader()
      });

      setNotifMsg("✅ Bildiriş göndərildi");
      setNotifForm({
        appUserId: "",
        title: "",
        message: "",
        orderId: ""
      });
    } catch (err) {
      setNotifMsg(err.response?.data?.message || "❌ Bildiriş göndərilmədi");
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>
            Ayarlar <span className="count-badge">{filtered.length}</span>
          </h1>
          <p>Sistem konfiqurasiyasını idarə edin</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          ＋ Yeni Ayar
        </button>
      </div>

      <div className="search-bar">
        <span style={{ color: "#B0C4D8", fontSize: 14 }}>🔍</span>
        <input
          placeholder="Açar və ya dəyər axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8" }}>
          ⏳ Yüklənir...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">⚙️</div>
          <h3>Ayar tapılmadı</h3>
          <p>Yeni sistem ayarı əlavə etmək üçün yuxarıdakı düyməyə klikləyin</p>
        </div>
      ) : (
        <div className="settings-card">
          <table className="settings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Açar (Key)</th>
                <th>Dəyər (Value)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ color: "#8DAFC4", fontWeight: 700, fontSize: 12 }}>
                    {i + 1}
                  </td>
                  <td>
                    <div className="key-cell">
                      <div className="key-icon">{getIcon(item.key)}</div>
                      <span className="key-name">{item.key}</span>
                    </div>
                  </td>
                  <td className="val-cell">
                    <span className="val-chip">{item.value || "—"}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-sm-edit" onClick={() => openEdit(item)}>
                        ✏️ Redaktə
                      </button>
                      <button className="btn-sm-del" onClick={() => setDeleteTarget(item)}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          background: "#fff",
          border: "1.5px solid #D6EAF8",
          borderRadius: 14,
          padding: "24px",
          marginTop: 24,
          marginBottom: 24
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 13,
            color: "#1F618D",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: 16
          }}
        >
          🔔 Bildiriş Göndər
        </div>

        {notifMsg && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 13,
              fontWeight: 700,
              background: notifMsg.startsWith("✅") ? "#E8F8F5" : "#FDEDEC",
              color: notifMsg.startsWith("✅") ? "#17A589" : "#E74C3C"
            }}
          >
            {notifMsg}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#5D8AA8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6
              }}
            >
              Xəstə (boş = hamıya)
            </div>

            <select
              value={notifForm.appUserId}
              onChange={(e) =>
                setNotifForm({ ...notifForm, appUserId: e.target.value })
              }
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "1.5px solid #D6EAF8",
                fontSize: 13,
                outline: "none",
                fontFamily: "'Plus Jakarta Sans',sans-serif"
              }}
            >
              <option value="">— Bütün xəstələr —</option>
              {patients.map((p) => (
                <option key={p.id || p.appUserId} value={p.id || p.appUserId}>
                  {p.name || p.fullName || p.userName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#5D8AA8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6
              }}
            >
              Sifariş ID (istəyə bağlı)
            </div>

            <input
              type="number"
              placeholder="Sifariş nömrəsi..."
              value={notifForm.orderId}
              onChange={(e) =>
                setNotifForm({ ...notifForm, orderId: e.target.value })
              }
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "1.5px solid #D6EAF8",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#5D8AA8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 6
            }}
          >
            Başlıq
          </div>

          <input
            placeholder="Bildiriş başlığı..."
            value={notifForm.title}
            onChange={(e) =>
              setNotifForm({ ...notifForm, title: e.target.value })
            }
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              border: "1.5px solid #D6EAF8",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#5D8AA8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 6
            }}
          >
            Mətn
          </div>

          <textarea
            placeholder="Bildiriş mətni..."
            value={notifForm.message}
            onChange={(e) =>
              setNotifForm({ ...notifForm, message: e.target.value })
            }
            rows={3}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              border: "1.5px solid #D6EAF8",
              fontSize: 13,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "'Plus Jakarta Sans',sans-serif"
            }}
          />
        </div>

        <button
          onClick={sendNotification}
          disabled={notifLoading}
          style={{
            padding: "11px 24px",
            background: "linear-gradient(135deg,#1F618D,#2E86C1)",
            color: "#fff",
            border: "none",
            borderRadius: 9,
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans',sans-serif"
          }}
        >
          {notifLoading ? "⏳ Göndərilir..." : "📤 Bildiriş Göndər"}
        </button>
      </div>

      {modal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">
                {editItem ? "✏️ Ayarı Redaktə Et" : "＋ Yeni Ayar"}
              </div>
              <button className="modal-x" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="err-msg">⚠️ {error}</div>}

              <div className="fg">
                <label className="fl">Açar (Key) *</label>
                <input
                  className="fi fi-mono"
                  placeholder="Məs: site_name"
                  value={form.key}
                  onChange={(e) => set("key", e.target.value)}
                  autoFocus
                  disabled={!!editItem}
                />
                {!editItem && (
                  <span className="field-hint">
                    Snake_case formatında yazın: site_name, delivery_fee
                  </span>
                )}
              </div>

              <div className="fg">
                <label className="fl">Dəyər (Value)</label>
                <input
                  className="fi"
                  placeholder="Dəyəri daxil edin"
                  value={form.value}
                  onChange={(e) => set("value", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>
            </div>

            <div className="modal-foot">
              <button className="btn-cancel" onClick={closeModal}>
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
                  "Əlavə et"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="confirm-box">
            <div className="ci">🗑️</div>
            <h3>Silinsin?</h3>
            <p>
              <strong>"{deleteTarget.key}"</strong> ayarı silinəcək.
              <br />
              Bu əməliyyat geri alına bilər.
            </p>
            <div className="confirm-btns">
              <button
                className="btn-cancel"
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