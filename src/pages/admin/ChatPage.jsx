import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useChatSignalR } from "../../hooks/useChatSignalR";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

const mockConversations = [
  { userId: "u1", userName: "Dr. Əli Həsənov",    lastMessage: "Salam, yeni xəstə var",   lastTime: "2026-03-06T11:00:00", unread: 2, avatar: "Ə" },
  { userId: "u2", userName: "Nigar Məmmədova",    lastMessage: "Resept lazımdır",          lastTime: "2026-03-06T09:30:00", unread: 1, avatar: "N" },
  { userId: "u3", userName: "Dr. Günel Quliyeva", lastMessage: "Növbəti həftə müayinə?",  lastTime: "2026-03-05T17:00:00", unread: 0, avatar: "G" },
];
const mockMessages = {
  u1: [
    { id: 1, senderId: "u1", content: "Salam admin, yeni xəstə var", sentAt: "2026-03-06T10:50:00", isOwn: false },
    { id: 2, senderId: "me", content: "Anlayışlıyam, qeyd etdim",    sentAt: "2026-03-06T10:55:00", isOwn: true },
    { id: 3, senderId: "u1", content: "Salam, yeni xəstə var",       sentAt: "2026-03-06T11:00:00", isOwn: false },
  ],
};

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; gap:16px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }
  .signalr-badge { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; }
  .badge-connected    { background:#E8FAF8; color:#17A589; border:1px solid #A9DFBF; }
  .badge-disconnected { background:#FDEDEC; color:#E74C3C; border:1px solid #FADBD8; }
  .badge-reconnecting { background:#FEF9E7; color:#D4AC0D; border:1px solid #F9E79F; }
  .dot { width:7px; height:7px; border-radius:50%; display:inline-block; }
  .dot-green  { background:#17A589; }
  .dot-red    { background:#E74C3C; }
  .dot-yellow { background:#D4AC0D; animation:pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .chat-layout { display:grid; grid-template-columns:280px 1fr; height:calc(100vh - 120px); background:#fff; border-radius:16px; border:1.5px solid #D6EAF8; overflow:hidden; }
  .conv-panel { border-right:1px solid #EBF5FB; display:flex; flex-direction:column; background:#FAFCFE; }
  .conv-panel-head { padding:18px 16px 14px; border-bottom:1px solid #EBF5FB; }
  .conv-panel-title { font-size:15px; font-weight:800; color:#154360; margin-bottom:10px; }
  .conv-search { display:flex; align-items:center; gap:7px; background:#fff; border:1.5px solid #D6EAF8; border-radius:9px; padding:8px 12px; }
  .conv-search:focus-within { border-color:#1F618D; }
  .conv-search input { border:none; background:none; outline:none; font-size:13px; color:#1A252F; width:100%; font-family:'Plus Jakarta Sans',sans-serif; }
  .conv-list { flex:1; overflow-y:auto; }
  .conv-list::-webkit-scrollbar { width:4px; }
  .conv-list::-webkit-scrollbar-thumb { background:#D6EAF8; border-radius:4px; }
  .conv-item { display:flex; align-items:center; gap:11px; padding:11px 16px; cursor:pointer; transition:all 0.15s; border-bottom:1px solid #F4FAFD; }
  .conv-item:hover { background:#EBF5FB; }
  .conv-item.active { background:#EBF5FB; border-right:3px solid #1F618D; }
  .conv-avatar { width:40px; height:40px; border-radius:11px; background:linear-gradient(135deg,#1F618D,#2E86C1); display:flex; align-items:center; justify-content:center; color:#fff; font-size:15px; font-weight:800; flex-shrink:0; }
  .conv-info { flex:1; min-width:0; }
  .conv-name { font-size:13px; font-weight:700; color:#154360; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
  .conv-last { font-size:11px; color:#8DAFC4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .conv-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
  .conv-time { font-size:10px; color:#B0C4D8; }
  .unread-badge { background:#1F618D; color:#fff; font-size:10px; font-weight:800; min-width:18px; height:18px; padding:0 4px; border-radius:9px; display:flex; align-items:center; justify-content:center; }

  .msg-panel { display:flex; flex-direction:column; height:100%; }
  .msg-panel-head { padding:14px 20px; border-bottom:1px solid #EBF5FB; display:flex; align-items:center; gap:12px; background:linear-gradient(135deg,#F8FCFF,#EBF5FB); }
  .msg-head-avatar { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,#1F618D,#2E86C1); display:flex; align-items:center; justify-content:center; color:#fff; font-size:15px; font-weight:800; flex-shrink:0; }
  .msg-head-name { font-size:14px; font-weight:800; color:#154360; }
  .msg-head-status { font-size:11px; font-weight:600; }
  .status-online { color:#17A589; } .status-offline { color:#B0C4D8; }

  .msg-body { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:12px; background:#F8FCFF; }
  .msg-body::-webkit-scrollbar { width:4px; }
  .msg-body::-webkit-scrollbar-thumb { background:#D6EAF8; border-radius:4px; }
  .msg-date-sep { display:flex; align-items:center; gap:10px; color:#B0C4D8; font-size:11px; font-weight:600; }
  .msg-date-sep::before,.msg-date-sep::after { content:''; flex:1; height:1px; background:#EBF5FB; }
  .msg-row { display:flex; align-items:flex-end; gap:8px; }
  .msg-row.own { flex-direction:row-reverse; }
  .msg-bubble-avatar { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; }
  .msg-row:not(.own) .msg-bubble-avatar { background:linear-gradient(135deg,#1F618D,#2E86C1); color:#fff; }
  .msg-row.own .msg-bubble-avatar { background:linear-gradient(135deg,#17A589,#1ABC9C); color:#fff; }
  .msg-bubble { max-width:65%; padding:10px 14px; border-radius:14px; font-size:13px; line-height:1.5; color:#1A252F; background:#fff; border:1px solid #D6EAF8; border-bottom-left-radius:4px; }
  .msg-row.own .msg-bubble { background:linear-gradient(135deg,#1F618D,#2E86C1); color:#fff; border:none; border-bottom-right-radius:4px; border-bottom-left-radius:14px; }
  .msg-time { font-size:10px; color:#B0C4D8; margin-top:4px; }
  .msg-row.own .msg-time { color:rgba(255,255,255,0.6); text-align:right; }
  .typing-dots { display:flex; gap:4px; padding:6px 0; }
  .typing-dot { width:7px; height:7px; border-radius:50%; background:#AED6F1; animation:bounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay:0.2s; }
  .typing-dot:nth-child(3) { animation-delay:0.4s; }
  @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

  .msg-footer { padding:14px 16px; border-top:1px solid #EBF5FB; background:#fff; }
  .msg-input-row { display:flex; align-items:flex-end; gap:10px; }
  .msg-input-wrap { flex:1; background:#F8FCFF; border:1.5px solid #D6EAF8; border-radius:12px; padding:10px 14px; transition:all 0.2s; }
  .msg-input-wrap:focus-within { border-color:#1F618D; box-shadow:0 0 0 3px rgba(31,97,141,0.08); }
  .msg-input-wrap textarea { width:100%; border:none; background:none; outline:none; resize:none; font-size:13px; color:#1A252F; line-height:1.5; font-family:'Plus Jakarta Sans',sans-serif; min-height:20px; max-height:100px; }
  .msg-input-wrap textarea::placeholder { color:#B0C4D8; }
  .btn-send { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#1F618D,#2E86C1); border:none; color:#fff; font-size:18px; cursor:pointer; transition:all 0.2s; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .btn-send:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1F618D); transform:translateY(-1px); }
  .btn-send:disabled { opacity:0.5; cursor:not-allowed; }
  .no-chat { flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:12px; background:#F8FCFF; }
  .no-chat-icon { font-size:56px; }
  .no-chat h3 { font-size:16px; font-weight:700; color:#154360; }
  .no-chat p { font-size:13px; color:#8DAFC4; }
  .spin { width:14px; height:14px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

function fmt(dt) { return dt ? new Date(dt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" }) : ""; }
function fmtShort(dt) {
  if (!dt) return "";
  const d = new Date(dt), now = new Date();
  return now - d < 86400000 ? d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" });
}

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const activeConvRef = useRef(null);
  const msgEndRef = useRef(null);
  const typingTimer = useRef(null);

  const handleIncoming = (msg) => {
    if (activeConvRef.current?.userId === msg.senderId) {
      setMessages(ms => [...ms, { ...msg, isOwn: false }]);
      setIsTyping(false);
      clearTimeout(typingTimer.current);
    }
    setConversations(cs => cs.map(c =>
      c.userId === msg.senderId
        ? { ...c, lastMessage: msg.content, lastTime: msg.sentAt, unread: activeConvRef.current?.userId === msg.senderId ? 0 : (c.unread || 0) + 1 }
        : c
    ));
  };

  const { connected, error: signalRError, sendMessage: signalRSend } = useChatSignalR(handleIncoming);

  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // Swagger-də conversations endpoint yoxdur — User/GetAllPatients istifadə et
        const r = await axios.get(`${API}/api/User/GetAllPatients`, { headers: authHeader() });
        const users = Array.isArray(r.data) ? r.data : r.data?.data || [];
        const convs = users.map(u => ({
          userId: u.id || u.appUserId,
          name: u.name || u.fullName || u.userName || "Xəstə",
          role: "Xəstə",
          lastMessage: "",
          unread: 0,
        }));
        setConversations(convs);
      } catch { setConversations(mockConversations); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    const fetch = async () => {
      setMessages([]);
      try {
        const myId = localStorage.getItem("userId") || "";
        const r = await axios.get(
          `${API}/api/ChatMessage/history/${myId}/${activeConv.userId}`,
          { headers: authHeader() }
        );
        const msgs = Array.isArray(r.data) ? r.data : r.data?.data || [];
        setMessages(msgs.map(m => ({
          id: m.id, senderId: m.senderId,
          content: m.message || m.content,
          sentAt: m.sentAt || m.createdAt,
          isOwn: m.senderId === myId,
        })));
      } catch { setMessages(mockMessages[activeConv.userId] || []); }
    };
    fetch();
  }, [activeConv]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSelect = (conv) => {
    setActiveConv(conv); setIsTyping(false);
    setConversations(cs => cs.map(c => c.userId === conv.userId ? { ...c, unread: 0 } : c));
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    const text = input.trim(); setInput("");
    const tmp = { id: Date.now(), senderId: "me", content: text, sentAt: new Date().toISOString(), isOwn: true };
    setMessages(ms => [...ms, tmp]);
    setConversations(cs => cs.map(c => c.userId === activeConv.userId ? { ...c, lastMessage: text, lastTime: new Date().toISOString() } : c));
    setSending(true);
    try {
      const sent = await signalRSend(activeConv.userId, text);
      if (!sent) {
        const fd = new FormData();
        fd.append("ConsultationId", activeConv.consultationId || 0);
        fd.append("SenderId", localStorage.getItem("userId") || "");
        fd.append("ReceiverId", activeConv.userId || "");
        fd.append("Message", text);
        await axios.post(`${API}/api/ChatMessage`, fd, { headers: authHeader() });
      }
    } catch { } finally { setSending(false); }
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.unread || 0), 0);
  const filtered = conversations.filter(c => (c.userName || "").toLowerCase().includes(search.toLowerCase()));
  const badge = signalRError?.includes("Yenidən")
    ? { cls: "badge-reconnecting", dot: "dot-yellow", text: "Yenidən qoşulur..." }
    : connected ? { cls: "badge-connected", dot: "dot-green", text: "Real-time" }
    : { cls: "badge-disconnected", dot: "dot-red", text: "Əlaqə yoxdur" };

  return (
    <>
      <style>{styles}</style>
      <div className="pg-header">
        <div>
          <h1>Mesajlar {totalUnread > 0 && <span style={{ background: "#1F618D", color: "#fff", fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 20, marginLeft: 8 }}>{totalUnread}</span>}</h1>
          <p>İstifadəçilərlə yazışmalar</p>
        </div>
        <span className={`signalr-badge ${badge.cls}`}><span className={`dot ${badge.dot}`} /> {badge.text}</span>
      </div>

      <div className="chat-layout">
        <div className="conv-panel">
          <div className="conv-panel-head">
            <div className="conv-panel-title">Söhbətlər</div>
            <div className="conv-search"><span style={{ color: "#B0C4D8", fontSize: 13 }}>🔍</span><input placeholder="Axtar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          </div>
          <div className="conv-list">
            {loading ? <div style={{ textAlign: "center", padding: 30, color: "#8DAFC4" }}>⏳</div>
              : filtered.map(conv => (
                <div key={conv.userId} className={`conv-item ${activeConv?.userId === conv.userId ? "active" : ""}`} onClick={() => handleSelect(conv)}>
                  <div className="conv-avatar">{conv.avatar || conv.userName?.[0]}</div>
                  <div className="conv-info"><div className="conv-name">{conv.userName}</div><div className="conv-last">{conv.lastMessage || "..."}</div></div>
                  <div className="conv-meta"><span className="conv-time">{fmtShort(conv.lastTime)}</span>{conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}</div>
                </div>
              ))
            }
          </div>
        </div>

        {activeConv ? (
          <div className="msg-panel">
            <div className="msg-panel-head">
              <div className="msg-head-avatar">{activeConv.avatar || activeConv.userName?.[0]}</div>
              <div>
                <div className="msg-head-name">{activeConv.userName}</div>
                <div className={`msg-head-status ${connected ? "status-online" : "status-offline"}`}>{connected ? "● Online" : "○ Offline"}</div>
              </div>
            </div>
            <div className="msg-body">
              {messages.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#B0C4D8", fontSize: 13 }}>Hələ mesaj yoxdur</div>
                : <><div className="msg-date-sep">Bugün</div>
                  {messages.map(msg => (
                    <div key={msg.id} className={`msg-row ${msg.isOwn ? "own" : ""}`}>
                      <div className="msg-bubble-avatar">{msg.isOwn ? "A" : (activeConv.avatar || "?")}</div>
                      <div><div className="msg-bubble">{msg.content}</div><div className="msg-time">{fmt(msg.sentAt)}</div></div>
                    </div>
                  ))}
                  {isTyping && <div className="msg-row"><div className="msg-bubble-avatar">{activeConv.avatar || "?"}</div><div className="typing-dots"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div></div>}
                  <div ref={msgEndRef} /></>
              }
            </div>
            <div className="msg-footer">
              <div className="msg-input-row">
                <div className="msg-input-wrap">
                  <textarea placeholder="Mesaj yazın... (Enter göndər)" value={input}
                    onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} rows={1} />
                </div>
                <button className="btn-send" onClick={handleSend} disabled={!input.trim() || sending}>{sending ? <span className="spin" /> : "➤"}</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-chat"><div className="no-chat-icon">💬</div><h3>Söhbət seçin</h3><p>Sol tərəfdən söhbət seçərək başlayın</p></div>
        )}
      </div>
    </>
  );
}