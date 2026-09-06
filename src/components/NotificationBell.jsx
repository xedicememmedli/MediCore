import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Mock — backend notification endpoint olmasa fallback
const buildMockNotifs = (role) => {
  const base = [
    { id: 1, title: "Yeni mesaj",         body: "Sizə yeni mesaj gəldi",          time: new Date(Date.now() - 5*60000).toISOString(),  read: false, icon: "💬" },
    { id: 2, title: "Randevu təsdiqləndi", body: "Sabah saat 10:00 təsdiqləndi",   time: new Date(Date.now() - 25*60000).toISOString(), read: false, icon: "✅" },
    { id: 3, title: "Sistem bildirişi",    body: "MediCore-a xoş gəldiniz!",       time: new Date(Date.now() - 2*3600000).toISOString(), read: true,  icon: "🏥" },
  ];
  if (role === "admin") base.push({ id: 4, title: "Yeni sifariş", body: "3 yeni sifariş gözləyir", time: new Date(Date.now() - 10*60000).toISOString(), read: false, icon: "📦" });
  if (role === "doctor") base.push({ id: 5, title: "Yeni xəstə", body: "Yeni xəstə randevu aldı", time: new Date(Date.now() - 8*60000).toISOString(), read: false, icon: "👤" });
  return base;
};

const styles = `
  .nb-wrap { position: relative; }

  .nb-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; cursor: pointer; transition: all 0.18s;
    position: relative; flex-shrink: 0;
  }
  .nb-btn:hover { background: #D6EAF8; }
  .nb-dot {
    position: absolute; top: 5px; right: 5px;
    width: 9px; height: 9px; border-radius: 50%;
    background: #E74C3C; border: 2px solid #fff;
    animation: nbPulse 2s infinite;
  }
  @keyframes nbPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }

  .nb-count {
    position: absolute; top: -4px; right: -4px;
    min-width: 18px; height: 18px; padding: 0 4px;
    background: #E74C3C; color: #fff; border-radius: 9px;
    font-size: 10px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #fff;
  }

  /* DROPDOWN */
  .nb-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    width: 320px; background: #fff;
    border-radius: 14px; border: 1.5px solid #D6EAF8;
    box-shadow: 0 16px 48px rgba(21,67,96,0.18);
    z-index: 1000; animation: nbFade 0.18s ease;
    overflow: hidden;
  }
  @keyframes nbFade { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

  .nb-dd-head {
    padding: 14px 16px; border-bottom: 1px solid #EBF5FB;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nb-dd-title { font-size: 14px; font-weight: 800; color: #154360; }
  .nb-dd-mark { font-size: 11px; font-weight: 700; color: #17A589; cursor: pointer; background: none; border: none; font-family: 'Plus Jakarta Sans', sans-serif; }
  .nb-dd-mark:hover { text-decoration: underline; }

  .nb-list { max-height: 320px; overflow-y: auto; }
  .nb-list::-webkit-scrollbar { width: 3px; }
  .nb-list::-webkit-scrollbar-thumb { background: #D6EAF8; border-radius: 3px; }

  .nb-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 16px; border-bottom: 1px solid #F4FAFD;
    cursor: pointer; transition: background 0.15s;
  }
  .nb-item:last-child { border-bottom: none; }
  .nb-item:hover { background: #F8FCFF; }
  .nb-item.unread { background: #FAFFFD; }

  .nb-item-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #E8FAF8; display: flex; align-items: center;
    justify-content: center; font-size: 17px; flex-shrink: 0;
  }
  .nb-item-content { flex: 1; min-width: 0; }
  .nb-item-title { font-size: 13px; font-weight: 700; color: #154360; margin-bottom: 2px; }
  .nb-item.unread .nb-item-title { color: #0E6655; }
  .nb-item-body { font-size: 11px; color: #5D8AA8; line-height: 1.4; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .nb-item-time { font-size: 10px; color: #B0C4D8; }
  .nb-unread-dot { width: 7px; height: 7px; border-radius: 50%; background: #17A589; flex-shrink: 0; margin-top: 6px; }

  .nb-empty { padding: 32px; text-align: center; color: #B0C4D8; font-size: 13px; }
  .nb-empty span { font-size: 32px; display: block; margin-bottom: 8px; }
`;

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return "Az əvvəl";
  if (diff < 3600) return `${Math.floor(diff / 60)} dəq əvvəl`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`;
  return `${Math.floor(diff / 86400)} gün əvvəl`;
}

export default function NotificationBell({ accentColor = "#1F618D" }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const role = localStorage.getItem("role")?.toLowerCase() || "patient";

  const unreadCount = notifs.filter(n => !n.read).length;

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId") || "";
      const endpoint = userId
        ? `${API}/api/Notification/UserNotifications/${userId}`
        : `${API}/api/Notification`;
      const res = await axios.get(endpoint, { headers: authHeader() });
      setNotifs(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      setNotifs(buildMockNotifs(role));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000); // Hər dəqiqə yenilə
    return () => clearInterval(interval);
  }, []);

  // Kənarda klikləndikdə bağla
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    try {
      const unread = notifs.filter(n => !n.isRead);
      await Promise.all(unread.map(n =>
        axios.put(`${API}/api/Notification/MarkAsRead/${n.id}`, {}, { headers: authHeader() })
      ));
    } catch { }
  };

  const markRead = async (id) => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    try {
      await axios.put(`${API}/api/Notification/MarkAsRead/${id}`, {}, { headers: authHeader() });
    } catch { }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="nb-wrap" ref={wrapRef}>
        <div className="nb-btn" onClick={() => setOpen(o => !o)} style={{ background: open ? "#D6EAF8" : "#EBF5FB" }}>
          🔔
          {unreadCount > 0 && (
            <span className="nb-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </div>

        {open && (
          <div className="nb-dropdown">
            <div className="nb-dd-head">
              <div className="nb-dd-title">
                Bildirişlər
                {unreadCount > 0 && <span style={{ background: "#E74C3C", color: "#fff", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 20, marginLeft: 8 }}>{unreadCount}</span>}
              </div>
              {unreadCount > 0 && (
                <button className="nb-dd-mark" onClick={markAllRead}>Hamısını oxundu işarələ</button>
              )}
            </div>

            <div className="nb-list">
              {loading && notifs.length === 0 ? (
                <div className="nb-empty"><span>⏳</span>Yüklənir...</div>
              ) : notifs.length === 0 ? (
                <div className="nb-empty"><span>🔔</span>Bildiriş yoxdur</div>
              ) : notifs.map(n => (
                <div key={n.id} className={`nb-item ${!n.read ? "unread" : ""}`} onClick={() => markRead(n.id)}>
                  <div className="nb-item-icon">{n.icon || "🔔"}</div>
                  <div className="nb-item-content">
                    <div className="nb-item-title">{n.title}</div>
                    <div className="nb-item-body">{n.body}</div>
                    <div className="nb-item-time">{timeAgo(n.time || n.createdAt)}</div>
                  </div>
                  {!n.read && <div className="nb-unread-dot" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}