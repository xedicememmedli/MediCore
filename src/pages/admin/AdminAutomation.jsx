import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const styles = `
  .pg-header { margin-bottom:24px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p  { font-size:13px; color:#5D8AA8; }

  /* ROBOT KARTLARI */
  .robot-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
  @media (max-width:1100px) { .robot-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:600px)  { .robot-grid { grid-template-columns:1fr 1fr; } }

  .robot-card {
    background:#fff; border-radius:16px; border:1.5px solid #D6EAF8;
    padding:20px; position:relative; overflow:hidden; transition:all 0.2s;
  }
  .robot-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(21,67,96,0.1); }
  .robot-card.online  { border-color:#A9DFBF; }
  .robot-card.warning { border-color:#F9E79F; }
  .robot-card.error   { border-color:#FADBD8; animation:cardPulse 2s infinite; }
  @keyframes cardPulse { 0%,100%{box-shadow:0 0 0 0 rgba(231,76,60,0.2)} 50%{box-shadow:0 0 0 8px rgba(231,76,60,0)} }

  /* EKG XƏTTİ */
  .ekg-wrap { height:36px; margin-bottom:14px; overflow:hidden; }
  .ekg-svg { width:100%; height:100%; }
  .ekg-line { fill:none; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
  .ekg-line.online  { stroke:#17A589; }
  .ekg-line.warning { stroke:#E67E22; }
  .ekg-line.error   { stroke:#E74C3C; }

  .robot-icon-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .robot-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
  .ri-mail    { background:linear-gradient(135deg,#EBF5FB,#D6EAF8); }
  .ri-time    { background:linear-gradient(135deg,#E8FAF8,#D5F5E3); }
  .ri-clean   { background:linear-gradient(135deg,#FEF9E7,#FDFAE0); }
  .ri-finance { background:linear-gradient(135deg,#F0F4FF,#E8ECFF); }

  .robot-name  { font-size:13px; font-weight:800; color:#154360; }
  .robot-role  { font-size:11px; color:#8DAFC4; margin-top:1px; }

  .robot-status-row { display:flex; align-items:center; gap:7px; margin-bottom:10px; }
  .status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .sd-online  { background:#17A589; box-shadow:0 0 6px rgba(23,165,137,0.5); animation:dotBlink 2s infinite; }
  .sd-warning { background:#E67E22; }
  .sd-error   { background:#E74C3C; box-shadow:0 0 6px rgba(231,76,60,0.5); animation:dotBlink 1s infinite; }
  @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .status-text { font-size:11px; font-weight:700; }
  .st-online  { color:#17A589; }
  .st-warning { color:#E67E22; }
  .st-error   { color:#E74C3C; }

  .robot-stat  { font-size:22px; font-weight:800; color:#154360; margin-bottom:3px; }
  .robot-desc  { font-size:11px; color:#8DAFC4; line-height:1.5; }
  .robot-last  { font-size:10px; color:#B0C4D8; margin-top:8px; }

  /* ERROR BANNER */
  .error-banner {
    background:linear-gradient(135deg,#FDEDEC,#FDF2F2);
    border:1.5px solid #FADBD8; border-radius:12px; padding:14px 18px;
    display:flex; align-items:center; gap:12px; margin-bottom:20px;
    animation:slideDown 0.3s ease;
  }
  @keyframes slideDown { from{transform:translateY(-10px);opacity:0} to{transform:translateY(0);opacity:1} }
  .error-banner-icon { font-size:22px; }
  .error-banner-text { flex:1; font-size:13px; font-weight:700; color:#C0392B; }
  .error-banner-close { background:none; border:none; cursor:pointer; font-size:16px; color:#E74C3C; padding:4px; }

  /* TERMİNAL */
  .terminal-wrap {
    background:#0D1117; border-radius:16px; overflow:hidden;
    border:1.5px solid #21262D; box-shadow:0 16px 48px rgba(0,0,0,0.3);
  }
  .terminal-topbar {
    display:flex; align-items:center; gap:8px; padding:12px 16px;
    background:#161B22; border-bottom:1px solid #21262D;
  }
  .tb-dot { width:12px; height:12px; border-radius:50%; }
  .tb-red    { background:#FF5F57; }
  .tb-yellow { background:#FEBC2E; }
  .tb-green  { background:#28C840; }
  .tb-title  { margin-left:8px; font-size:12px; font-weight:700; color:#8B949E; font-family:monospace; }

  .terminal-body { padding:16px; min-height:260px; max-height:400px; overflow-y:auto; }
  .terminal-body::-webkit-scrollbar { width:3px; }
  .terminal-body::-webkit-scrollbar-thumb { background:#30363D; border-radius:3px; }

  .t-line { display:flex; align-items:flex-start; gap:10px; margin-bottom:8px; font-family:'Courier New',monospace; font-size:12px; line-height:1.5; animation:tFade 0.3s ease; }
  @keyframes tFade { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  .t-time  { color:#6E7681; flex-shrink:0; }
  .t-msg   { flex:1; }
  .t-msg.ok      { color:#3FB950; }
  .t-msg.warn    { color:#D29922; }
  .t-msg.err     { color:#F85149; }
  .t-msg.info    { color:#58A6FF; }
  .t-badge { padding:1px 6px; border-radius:4px; font-size:10px; font-weight:800; margin-left:8px; }
  .tb-ok   { background:rgba(63,185,80,0.15); color:#3FB950; }
  .tb-fail { background:rgba(248,81,73,0.15); color:#F85149; }
  .tb-info { background:rgba(88,166,255,0.15); color:#58A6FF; }

  .cursor { display:inline-block; width:8px; height:14px; background:#58A6FF; margin-left:4px; animation:blink 1s infinite; vertical-align:middle; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* STATİSTİK */
  .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
  @media (max-width:700px) { .stats-row { grid-template-columns:1fr 1fr; } }
  .stat-mini { background:#fff; border:1.5px solid #D6EAF8; border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px; }
  .sm-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .sm-val { font-size:20px; font-weight:800; color:#154360; }
  .sm-label { font-size:11px; color:#8DAFC4; font-weight:600; }
`;

// EKG SVG path generatoru
function generateEkgPath(status, width=200, height=36) {
  const points = [];
  const freq = status==="error" ? 0.3 : 1;
  for (let x=0; x<=width; x+=4) {
    const phase = (x / width) * Math.PI * 6 * freq;
    let y;
    if (status === "error") {
      y = height/2 + Math.sin(phase)*12 + (Math.random()-0.5)*4;
    } else if (status === "warning") {
      y = height/2 + Math.sin(phase)*8 + Math.sin(phase*3)*3;
    } else {
      // Normal EKG dalğası
      const norm = (x % 40) / 40;
      if (norm < 0.1)      y = height/2;
      else if (norm < 0.15) y = height/2 - 4;
      else if (norm < 0.2)  y = height/2 + 8;
      else if (norm < 0.25) y = height/2 - 14;
      else if (norm < 0.3)  y = height/2 - 2;
      else if (norm < 0.35) y = height/2 + 5;
      else                  y = height/2;
    }
    points.push(`${x},${y}`);
  }
  return "M" + points.join(" L");
}

function EkgLine({ status }) {
  const [path, setPath] = useState(() => generateEkgPath(status));
  useEffect(() => {
    const t = setInterval(() => setPath(generateEkgPath(status)), 800);
    return () => clearInterval(t);
  }, [status]);
  return (
    <div className="ekg-wrap">
      <svg viewBox="0 0 200 36" className="ekg-svg" preserveAspectRatio="none">
        <path className={`ekg-line ${status}`} d={path}/>
      </svg>
    </div>
  );
}

const ROBOTS = [
  { id:"mail",    icon:"✉️",  iconCls:"ri-mail",    name:"Mail Botu",    role:"Kommunikasiya Robotu",  statKey:"mailsSent",   statLabel:"bu gün göndərildi",     desc:"Xəstələrə randevu xatırlatmaları göndərir" },
  { id:"time",    icon:"🕒",  iconCls:"ri-time",    name:"Zaman Botu",   role:"Status Yeniləyicisi",   statKey:"updated",     statLabel:"son 1 saatda yeniləndi", desc:"Vaxtı bitmiş randevuları arxivləyir" },
  { id:"clean",   icon:"🧹",  iconCls:"ri-clean",   name:"Təmizlik Botu",role:"Məlumat Optimallaşdırıcı",statKey:"cleaned",  statLabel:"passiv data silindi",    desc:"Köhnəlmiş səbət məlumatlarını təmizləyir" },
  { id:"finance", icon:"📊",  iconCls:"ri-finance", name:"Maliyyə Botu", role:"Hesabat Generatoru",    statKey:"reports",     statLabel:"hesabat hazırlandı",     desc:"Günlük maliyyə hesabatları hazırlayır" },
];

// Terminal logları üçün mock generator
const BOT_MSGS = [
  { bot:"mail",    type:"ok",   msg:"Dr. Əliyevə yeni xəstə bildirişi göndərildi" },
  { bot:"time",    type:"ok",   msg:"ID#405 randevusu 'Aktiv'dən 'Bitdi' statusuna keçirildi" },
  { bot:"clean",   type:"ok",   msg:"Səbətdə 24 saatdır unudulmuş 3 dərman silindi" },
  { bot:"finance", type:"ok",   msg:"Günlük hesabat hazırlandı, arxivləndi" },
  { bot:"mail",    type:"ok",   msg:"15 xəstəyə sabahkı randevu xatırlatması göndərildi" },
  { bot:"time",    type:"warn", msg:"ID#412 randevusu 30 dəq ərzində başlamalıdır" },
  { bot:"clean",   type:"ok",   msg:"Vaxtı bitmiş 12 sessiya təmizləndi" },
  { bot:"finance", type:"info", msg:"Aylıq gəlir hesabatı hazırlanır..." },
  { bot:"mail",    type:"ok",   msg:"Xəstə #88 təhlil nəticəsi barədə məlumatlandırıldı" },
  { bot:"time",    type:"ok",   msg:"3 konsultasiya 'Tamamlandı' statusuna keçirildi" },
];

const BOT_ICONS = { mail:"✉️", time:"🕒", clean:"🧹", finance:"📊" };
const TYPE_CLS  = { ok:"ok", warn:"warn", err:"err", info:"info" };
const TYPE_BADGE = { ok:"tb-ok", warn:"tb-fail", err:"tb-fail", info:"tb-info" };
const TYPE_LABEL = { ok:"UĞURLU 🟢", warn:"DİQQƏT 🟡", err:"XƏTA 🔴", info:"MƏLUMAT 🔵" };

export default function AdminAutomation() {
  const [robotStatuses, setRobotStatuses] = useState({
    mail:"online", time:"online", clean:"online", finance:"warning"
  });
  const [robotStats, setRobotStats] = useState({
    mailsSent:145, updated:12, cleaned:30, reports:2
  });
  const [logs, setLogs] = useState([]);
  const [errorBanner, setErrorBanner] = useState(null);
  const terminalRef = useRef(null);
  const logIdRef = useRef(0);

  const addLog = (entry) => {
    const id = ++logIdRef.current;
    const time = new Date().toLocaleTimeString("az-AZ", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
    setLogs(l => [...l.slice(-49), { id, time, ...entry }]);
  };

  useEffect(() => {
    // Başlanğıc logları
    BOT_MSGS.slice(0, 4).forEach((m, i) => {
      setTimeout(() => addLog(m), i * 300);
    });

    // Avtomatik log axını
    let idx = 4;
    const interval = setInterval(() => {
      if (idx < BOT_MSGS.length) {
        addLog(BOT_MSGS[idx]);
        idx++;
      } else {
        idx = 0; // Dövr edir
      }
    }, 2500);

    // Bəzən xəta simulyasiyası
    const errTimer = setTimeout(() => {
      setRobotStatuses(s => ({ ...s, mail:"error" }));
      setErrorBanner("Mail Bot-un SMTP serveri ilə əlaqəsi kəsildi!");
      addLog({ bot:"mail", type:"err", msg:"SMTP server bağlantısı kəsildi! Yenidən qoşulma cəhdi..." });
      setTimeout(() => {
        setRobotStatuses(s => ({ ...s, mail:"online" }));
        setErrorBanner(null);
        addLog({ bot:"mail", type:"ok", msg:"SMTP server bağlantısı yenidən quruldu" });
      }, 8000);
    }, 15000);

    return () => { clearInterval(interval); clearTimeout(errTimer); };
  }, []);

  // Terminal avtomatik aşağı diyirlənsin
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Canlı stat artımı
  useEffect(() => {
    const t = setInterval(() => {
      setRobotStats(s => ({
        ...s,
        mailsSent: s.mailsSent + (Math.random() > 0.7 ? 1 : 0),
        updated: s.updated + (Math.random() > 0.8 ? 1 : 0),
      }));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <h1>🤖 Avtomatlaşdırma Mərkəzi</h1>
        <p>Arxa planda işləyən AI botlar və canlı sistem axını</p>
      </div>

      {/* ERROR BANNER */}
      {errorBanner && (
        <div className="error-banner">
          <div className="error-banner-icon">🚨</div>
          <div className="error-banner-text">Diqqət! {errorBanner}</div>
          <button className="error-banner-close" onClick={()=>setErrorBanner(null)}>✕</button>
        </div>
      )}

      {/* STATİSTİK */}
      <div className="stats-row">
        <div className="stat-mini">
          <div className="sm-icon" style={{background:"#E8FAF8"}}>📧</div>
          <div><div className="sm-val">{robotStats.mailsSent}</div><div className="sm-label">Bu gün göndərilən mail</div></div>
        </div>
        <div className="stat-mini">
          <div className="sm-icon" style={{background:"#EBF5FB"}}>🔄</div>
          <div><div className="sm-val">{robotStats.updated}</div><div className="sm-label">Yenilənən randevu</div></div>
        </div>
        <div className="stat-mini">
          <div className="sm-icon" style={{background:"#FEF9E7"}}>🧹</div>
          <div><div className="sm-val">{robotStats.cleaned}</div><div className="sm-label">Silinən köhnə data</div></div>
        </div>
      </div>

      {/* ROBOT KARTLARI */}
      <div className="robot-grid">
        {ROBOTS.map(bot => {
          const st = robotStatuses[bot.id];
          const statVal = robotStats[bot.statKey];
          return (
            <div key={bot.id} className={`robot-card ${st}`}>
              <EkgLine status={st} />
              <div className="robot-icon-row">
                <div className={`robot-icon ${bot.iconCls}`}>{bot.icon}</div>
                <div>
                  <div className="robot-name">{bot.name}</div>
                  <div className="robot-role">{bot.role}</div>
                </div>
              </div>
              <div className="robot-status-row">
                <div className={`status-dot sd-${st}`}/>
                <span className={`status-text st-${st}`}>
                  {st==="online"?"Aktiv":st==="warning"?"Diqqət":"Xəta"}
                </span>
              </div>
              <div className="robot-stat">{statVal}</div>
              <div className="robot-desc">{bot.statLabel}<br/><span style={{color:"#B0C4D8"}}>{bot.desc}</span></div>
              <div className="robot-last">⏱ Son fəaliyyət: az əvvəl</div>
            </div>
          );
        })}
      </div>

      {/* TERMİNAL */}
      <div className="terminal-wrap">
        <div className="terminal-topbar">
          <div className="tb-dot tb-red"/>
          <div className="tb-dot tb-yellow"/>
          <div className="tb-dot tb-green"/>
          <span className="tb-title">medicore-automation-hub — bash</span>
        </div>
        <div className="terminal-body" ref={terminalRef}>
          {logs.map(log => (
            <div key={log.id} className="t-line">
              <span className="t-time">[{log.time}]</span>
              <span className={`t-msg ${TYPE_CLS[log.type]||"info"}`}>
                {BOT_ICONS[log.bot]} {log.bot?.toUpperCase()} BOT: {log.msg}
                <span className={`t-badge ${TYPE_BADGE[log.type]||"tb-info"}`}>
                  {TYPE_LABEL[log.type]}
                </span>
              </span>
            </div>
          ))}
          <div className="t-line">
            <span className="t-time">[{new Date().toLocaleTimeString("az-AZ",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}]</span>
            <span className="t-msg info">sistem hazır<div className="cursor"/></span>
          </div>
        </div>
      </div>
    </>
  );
}
