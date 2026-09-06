import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useChatSignalR } from "../../hooks/useChatSignalR";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const jsonHeader = () => ({ ...authHeader(), "Content-Type": "application/json" });

const mockConversations = [
  { userId: "d1", userName: "Dr. Əli Həsənov",    lastMessage: "Dərmanı mütəmadi qəbul edin", lastTime: "2026-03-06T11:00:00", unread: 1, avatar: "Ə", role: "Həkim" },
  { userId: "d2", userName: "Dr. Günel Quliyeva", lastMessage: "Salam, necə hiss edirsiniz?",  lastTime: "2026-03-05T14:00:00", unread: 1, avatar: "G", role: "Həkim" },
];
const mockMessages = {
  d1: [
    { id: 1, senderId: "d1", content: "Salam, necə hiss edirsiniz?",  sentAt: "2026-03-06T10:00:00", isOwn: false },
    { id: 2, senderId: "me", content: "Əlhamdülillah, yaxşılaşıram", sentAt: "2026-03-06T10:05:00", isOwn: true },
    { id: 3, senderId: "d1", content: "Dərmanı mütəmadi qəbul edin", sentAt: "2026-03-06T11:00:00", isOwn: false },
  ],
  d2: [{ id: 4, senderId: "d2", content: "Salam, necə hiss edirsiniz?", sentAt: "2026-03-05T14:00:00", isOwn: false }],
};

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; gap:16px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }
  .signalr-badge { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; }
  .badge-connected    { background:#EAF2F8; color:#1A5276; border:1px solid #AED6F1; }
  .badge-disconnected { background:#FDEDEC; color:#E74C3C; border:1px solid #FADBD8; }
  .badge-reconnecting { background:#EAF2F8; color:#D4AC0D; border:1px solid #F9E79F; }
  .dot { width:7px; height:7px; border-radius:50%; display:inline-block; }
  .dot-green  { background:#1A5276; }
  .dot-red    { background:#E74C3C; }
  .dot-yellow { background:#D4AC0D; animation:pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .chat-layout { display:grid; grid-template-columns:260px 1fr; height:calc(100vh - 120px); background:#fff; border-radius:16px; border:1.5px solid #D6EAF8; overflow:hidden; }
  .conv-panel { border-right:1px solid #EBF5FB; display:flex; flex-direction:column; background:#FAFCFE; }
  .conv-panel-head { padding:16px 14px 12px; border-bottom:1px solid #EBF5FB; }
  .conv-panel-title { font-size:14px; font-weight:800; color:#154360; margin-bottom:10px; }
  .conv-search { display:flex; align-items:center; gap:7px; background:#fff; border:1.5px solid #D6EAF8; border-radius:9px; padding:8px 12px; }
  .conv-search:focus-within { border-color:#1A5276; }
  .conv-search input { border:none; background:none; outline:none; font-size:13px; color:#1A252F; width:100%; font-family:'Plus Jakarta Sans',sans-serif; }
  .conv-list { flex:1; overflow-y:auto; }
  .conv-item { display:flex; align-items:center; gap:10px; padding:11px 14px; cursor:pointer; transition:all 0.15s; border-bottom:1px solid #F4FAFD; }
  .conv-item:hover { background:#EAF2F8; }
  .conv-item.active { background:#EAF2F8; border-right:3px solid #1A5276; }
  .conv-avatar { width:40px; height:40px; border-radius:11px; background:linear-gradient(135deg,#1A5276,#1F618D); display:flex; align-items:center; justify-content:center; color:#fff; font-size:15px; font-weight:800; flex-shrink:0; }
  .conv-info { flex:1; min-width:0; }
  .conv-role { font-size:10px; color:#1A5276; font-weight:600; margin-bottom:1px; }
  .conv-name { font-size:13px; font-weight:700; color:#154360; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .conv-last { font-size:11px; color:#8DAFC4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .conv-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
  .conv-time { font-size:10px; color:#B0C4D8; }
  .unread-badge { background:#1A5276; color:#fff; font-size:10px; font-weight:800; min-width:18px; height:18px; padding:0 4px; border-radius:9px; display:flex; align-items:center; justify-content:center; }

  .msg-panel { display:flex; flex-direction:column; height:100%; }
  .msg-panel-head { padding:14px 18px; border-bottom:1px solid #EBF5FB; display:flex; align-items:center; gap:12px; background:linear-gradient(135deg,#F8FCFF,#EAF2F8); }
  .msg-head-avatar { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,#1A5276,#1F618D); display:flex; align-items:center; justify-content:center; color:#fff; font-size:15px; font-weight:800; }
  .msg-head-name { font-size:14px; font-weight:800; color:#154360; }
  .msg-head-role { font-size:11px; font-weight:600; }
  .status-online { color:#1A5276; } .status-offline { color:#B0C4D8; }

  .msg-body { flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:12px; background:#F8FCFF; }
  .msg-date-sep { display:flex; align-items:center; gap:10px; color:#B0C4D8; font-size:11px; font-weight:600; }
  .msg-date-sep::before,.msg-date-sep::after { content:''; flex:1; height:1px; background:#EBF5FB; }
  .msg-row { display:flex; align-items:flex-end; gap:8px; }
  .msg-row.own { flex-direction:row-reverse; }
  .msg-bubble-avatar { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; }
  .msg-row:not(.own) .msg-bubble-avatar { background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; }
  .msg-row.own .msg-bubble-avatar { background:linear-gradient(135deg,#1F618D,#2E86C1); color:#fff; }
  .msg-bubble { max-width:65%; padding:10px 14px; border-radius:14px; font-size:13px; line-height:1.5; color:#1A252F; background:#fff; border:1px solid #D6EAF8; border-bottom-left-radius:4px; }
  .msg-row.own .msg-bubble { background:linear-gradient(135deg,#1F618D,#2E86C1); color:#fff; border:none; border-bottom-right-radius:4px; border-bottom-left-radius:14px; }
  .msg-time { font-size:10px; color:#B0C4D8; margin-top:4px; }
  .msg-row.own .msg-time { color:rgba(255,255,255,0.6); text-align:right; }
  .typing-dots { display:flex; gap:4px; padding:6px 0; }
  .typing-dot { width:7px; height:7px; border-radius:50%; background:#AED6F1; animation:bounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay:0.2s; }
  .typing-dot:nth-child(3) { animation-delay:0.4s; }
  @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

  .msg-footer { padding:12px 14px; border-top:1px solid #EBF5FB; background:#fff; }
  .msg-input-row { display:flex; align-items:flex-end; gap:10px; }
  .msg-input-wrap { flex:1; background:#F8FCFF; border:1.5px solid #D6EAF8; border-radius:12px; padding:10px 14px; }
  .msg-input-wrap:focus-within { border-color:#1A5276; }
  .msg-input-wrap textarea { width:100%; border:none; background:none; outline:none; resize:none; font-size:13px; color:#1A252F; line-height:1.5; font-family:'Plus Jakarta Sans',sans-serif; min-height:20px; max-height:100px; }
  .msg-input-wrap textarea::placeholder { color:#B0C4D8; }
  .btn-send { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#1A5276,#1F618D); border:none; color:#fff; font-size:18px; cursor:pointer; transition:all 0.2s; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .btn-send:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1A5276); transform:translateY(-1px); }
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

export default function PatientChat() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const activeConvRef = useRef(null);

  // Söhbət seçiləndə tarixçəni yüklə
  const loadHistory = async (conv) => {
    if (!conv?.userId) return;
    const myId = localStorage.getItem("userId") || "";
    try {
      const res = await axios.get(
        `${API}/api/ChatMessage/history/${myId}/${conv.userId}`,
        { headers: authHeader() }
      );
      const msgs = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const mapped = msgs.map(m => ({
        id: m.id,
        senderId: m.senderId,
        content: m.message || m.content,
        sentAt: m.sentAt || m.createdAt,
        isOwn: m.senderId === myId,
      }));
      setMessages(prev => ({ ...prev, [conv.userId]: mapped }));
    } catch { /* mock data qalır */ }
  };
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
      try { const r = await axios.get(`${API}/api/Chat/conversations`, { headers: authHeader() }); setConversations(Array.isArray(r.data) ? r.data : r.data?.data || []); }
      catch { setConversations(mockConversations); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    const fetch = async () => {
      setMessages([]);
      try { const r = await axios.get(`${API}/api/Chat/messages/${activeConv.userId}`, { headers: authHeader() }); setMessages(Array.isArray(r.data) ? r.data : r.data?.data || []); }
      catch { setMessages(mockMessages[activeConv.userId] || []); }
    };
    fetch();
  }, [activeConv]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSelect = (conv) => {
    setActiveConv(conv); loadHistory(conv); setIsTyping(false);
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
          <h1>Mesajlar {totalUnread > 0 && <span style={{ background: "#1A5276", color: "#fff", fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 20, marginLeft: 8 }}>{totalUnread}</span>}</h1>
          <p>Həkimlərinizlə yazışmalar</p>
        </div>
        <span className={`signalr-badge ${badge.cls}`}><span className={`dot ${badge.dot}`} /> {badge.text}</span>
      </div>

      <div className="chat-layout">
        <div className="conv-panel">
          <div className="conv-panel-head">
            <div className="conv-panel-title">Həkimlərim</div>
            <div className="conv-search"><span style={{ color: "#B0C4D8", fontSize: 13 }}>🔍</span><input placeholder="Axtar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          </div>
          <div className="conv-list">
            {loading ? <div style={{ textAlign: "center", padding: 30, color: "#8DAFC4" }}>⏳</div>
              : filtered.map(conv => (
                <div key={conv.userId} className={`conv-item ${activeConv?.userId === conv.userId ? "active" : ""}`} onClick={() => handleSelect(conv)}>
                  <div className="conv-avatar">{conv.avatar || conv.userName?.[0]}</div>
                  <div className="conv-info">
                    <div className="conv-role">{conv.role || "Həkim"}</div>
                    <div className="conv-name">{conv.userName}</div>
                    <div className="conv-last">{conv.lastMessage || "..."}</div>
                  </div>
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
                <div className={`msg-head-role ${connected ? "status-online" : "status-offline"}`}>
                  {connected ? "● Online" : "○ Offline"}
                </div>
              </div>
            </div>
            <div className="msg-body">
              {messages.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#B0C4D8", fontSize: 13 }}>Hələ mesaj yoxdur</div>
                : <><div className="msg-date-sep">Bugün</div>
                  {messages.map(msg => (
                    <div key={msg.id} className={`msg-row ${msg.isOwn ? "own" : ""}`}>
                      <div className="msg-bubble-avatar">{msg.isOwn ? "S" : (activeConv.avatar || "H")}</div>
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
          <div className="no-chat"><div className="no-chat-icon">💬</div><h3>Həkim seçin</h3><p>Həkiminizlə yazışmağa başlayın</p></div>
        )}
      </div>
    </>
  );
}