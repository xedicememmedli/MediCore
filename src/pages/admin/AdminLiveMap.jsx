import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Mock kuryerlər (API cavab verməsə)
const MOCK_COURIERS = [
  { id:1, name:"Tural Əliyev",  phone:"+994501112233", status:"active",   lat:40.4093, lng:49.8671, orderId:101, orderAddress:"Nizami küç. 15" },
  { id:2, name:"Rauf Quliyev",  phone:"+994552223344", status:"active",   lat:40.3953, lng:49.8441, orderId:105, orderAddress:"İnşaatçılar pr. 8" },
  { id:3, name:"Elnur Hüseynov",phone:"+994703334455", status:"idle",     lat:40.4213, lng:49.8821, orderId:null, orderAddress:null },
  { id:4, name:"Kamran Babayev",phone:"+994604445566", status:"inactive", lat:40.3813, lng:49.8321, orderId:null, orderAddress:null },
];

const STATUS_CFG = {
  active:   { label:"Çatdırır",  color:"#17A589", bg:"#E8FAF8", border:"#A9DFBF", dot:"#17A589" },
  idle:     { label:"Boş",       color:"#D4AC0D", bg:"#FEF9E7", border:"#F9E79F", dot:"#F1C40F" },
  inactive: { label:"Offline",   color:"#8DAFC4", bg:"#EBF5FB", border:"#D6EAF8", dot:"#B0C4D8" },
};

const styles = `
  .pg-header { margin-bottom:20px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p  { font-size:13px; color:#5D8AA8; }

  .map-layout { display:grid; grid-template-columns:300px 1fr; gap:16px; height:calc(100vh - 160px); min-height:500px; }
  @media (max-width:900px) { .map-layout { grid-template-columns:1fr; height:auto; } }

  /* SOL PANEL */
  .courier-panel { display:flex; flex-direction:column; gap:0; background:#fff; border:1.5px solid #D6EAF8; border-radius:14px; overflow:hidden; }
  .cp-head { padding:14px 16px; border-bottom:1px solid #EBF5FB; background:#F8FCFF; }
  .cp-title { font-size:13px; font-weight:800; color:#154360; display:flex; align-items:center; justify-content:space-between; }
  .cp-refresh { width:28px; height:28px; border-radius:8px; background:#EBF5FB; border:none; cursor:pointer; font-size:14px; transition:all 0.2s; }
  .cp-refresh:hover { background:#D6EAF8; transform:rotate(180deg); }
  .cp-list { flex:1; overflow-y:auto; }
  .cp-list::-webkit-scrollbar { width:3px; }
  .cp-list::-webkit-scrollbar-thumb { background:#D6EAF8; border-radius:3px; }

  .courier-item { padding:12px 14px; border-bottom:1px solid #F4FAFD; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; gap:10px; }
  .courier-item:hover { background:#F8FCFF; }
  .courier-item.selected { background:#E8FAF8; border-left:3px solid #17A589; }
  .courier-item.selected { padding-left:11px; }
  .ci-ava { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:800; color:#fff; flex-shrink:0; background:linear-gradient(135deg,#1F618D,#2E86C1); }
  .ci-info { flex:1; min-width:0; }
  .ci-name { font-size:12px; font-weight:800; color:#154360; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ci-order { font-size:10px; color:#8DAFC4; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ci-status { flex-shrink:0; }
  .status-pill { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:800; border:1px solid; }
  .sp-dot { width:6px; height:6px; border-radius:50%; }

  /* LIVE BADGE */
  .live-badge { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; color:#17A589; }
  .live-dot { width:8px; height:8px; border-radius:50%; background:#17A589; animation:livePulse 1.5s infinite; }
  @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(23,165,137,0.4)} 50%{box-shadow:0 0 0 6px rgba(23,165,137,0)} }

  /* XƏRİTƏ */
  .map-container { border-radius:14px; overflow:hidden; border:1.5px solid #D6EAF8; position:relative; }
  #leaflet-map { width:100%; height:100%; }

  /* SELECTED INFO */
  .selected-info {
    position:absolute; bottom:16px; left:50%; transform:translateX(-50%);
    background:#fff; border-radius:14px; border:1.5px solid #D6EAF8;
    padding:14px 18px; min-width:280px; max-width:360px;
    box-shadow:0 8px 24px rgba(21,67,96,0.12); z-index:1000;
    animation:infoSlide 0.25s ease;
  }
  @keyframes infoSlide { from{transform:translateX(-50%) translateY(10px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
  .si-name { font-size:14px; font-weight:800; color:#154360; margin-bottom:6px; display:flex; align-items:center; gap:8px; }
  .si-row  { display:flex; align-items:center; gap:8px; font-size:12px; color:#5D8AA8; margin-bottom:4px; }
  .si-row strong { color:#154360; font-weight:700; }
  .si-close { position:absolute; top:10px; right:12px; background:none; border:none; cursor:pointer; font-size:16px; color:#8DAFC4; }

  /* STATS ROW */
  .map-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px; }
  .ms-card { background:#fff; border:1.5px solid #D6EAF8; border-radius:12px; padding:12px 14px; display:flex; align-items:center; gap:10px; }
  .ms-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; }
  .ms-val { font-size:18px; font-weight:800; color:#154360; }
  .ms-label { font-size:10px; color:#8DAFC4; font-weight:600; text-transform:uppercase; letter-spacing:0.3px; }

  .skel-line { height:12px; border-radius:6px; background:linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

// Leaflet-i CDN-dən yüklə
function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

// Kuryer üçün özel marker ikonu
function courierIcon(L, status, selected=false) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.inactive;
  const size = selected ? 44 : 36;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="20" fill="${cfg.color}" opacity="${selected?1:0.85}" stroke="white" stroke-width="3"/>
      ${selected ? `<circle cx="22" cy="22" r="20" fill="none" stroke="${cfg.color}" stroke-width="3" opacity="0.4">
        <animate attributeName="r" from="20" to="30" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite"/>
      </circle>` : ""}
      <text x="22" y="28" text-anchor="middle" font-size="18" fill="white">🛵</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    className: "",
  });
}

export default function AdminLiveMap() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const mapRef   = useRef(null);
  const leafRef  = useRef(null);
  const markersRef = useRef({});

  const fetchCouriers = async () => {
    try {
      const res = await axios.get(`${API}/api/Courier`, { headers: authHeader() });
      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Koordinat məlumatı da gəlirsə istifadə et
      const withCoords = arr.map((c, i) => ({
        ...c,
        lat: c.latitude  || c.lat  || MOCK_COURIERS[i % MOCK_COURIERS.length].lat,
        lng: c.longitude || c.lng  || MOCK_COURIERS[i % MOCK_COURIERS.length].lng,
        status: c.isOnline || c.status === "active" ? "active"
               : c.status === "idle" ? "idle" : "inactive",
      }));
      setCouriers(withCoords.length > 0 ? withCoords : MOCK_COURIERS);
    } catch {
      setCouriers(MOCK_COURIERS);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  // Xəritəni qur
  useEffect(() => {
    loadLeaflet().then(L => {
      if (mapRef.current && !leafRef.current) {
        // Bakı mərkəzi
        leafRef.current = L.map("leaflet-map", {
          center: [40.4093, 49.8671],
          zoom: 13,
          zoomControl: true,
        });

        // Dark tile (neon efekti üçün)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: "© OpenStreetMap © CARTO",
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(leafRef.current);
      }
    });
    return () => {
      if (leafRef.current) {
        leafRef.current.remove();
        leafRef.current = null;
      }
    };
  }, []);

  // Marker-ları yenilə
  useEffect(() => {
    if (!leafRef.current || couriers.length === 0) return;

    const L = window.L;
    if (!L) return;

    couriers.forEach(c => {
      const isSelected = selected?.id === c.id;
      const icon = courierIcon(L, c.status, isSelected);

      if (markersRef.current[c.id]) {
        markersRef.current[c.id].setLatLng([c.lat, c.lng]);
        markersRef.current[c.id].setIcon(icon);
      } else {
        const marker = L.marker([c.lat, c.lng], { icon })
          .addTo(leafRef.current)
          .on("click", () => setSelected(c));

        // Tooltip
        marker.bindTooltip(
          `<div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;padding:4px 2px">
            🛵 ${c.name}<br/>
            <span style="color:${STATUS_CFG[c.status]?.color||'#888'};font-size:10px">${STATUS_CFG[c.status]?.label||''}</span>
          </div>`,
          { direction:"top", offset:[0,-20], className:"leaflet-tooltip-custom" }
        );
        markersRef.current[c.id] = marker;
      }
    });
  }, [couriers, selected]);

  // Seçilən kuryer dəyişəndə marker-ı yenilə
  useEffect(() => {
    const L = window.L;
    if (!L || !leafRef.current) return;
    Object.keys(markersRef.current).forEach(id => {
      const c = couriers.find(x => String(x.id) === String(id));
      if (!c) return;
      markersRef.current[id].setIcon(courierIcon(L, c.status, selected?.id === c.id));
    });
    if (selected && leafRef.current) {
      leafRef.current.panTo([selected.lat, selected.lng], { animate: true, duration: 0.5 });
    }
  }, [selected]);

  // İlk yükləmə + hər 10 saniyədə yenilə
  useEffect(() => {
    fetchCouriers();
    const t = setInterval(fetchCouriers, 10000);
    return () => clearInterval(t);
  }, []);

  const activeCouriers  = couriers.filter(c => c.status==="active");
  const idleCouriers    = couriers.filter(c => c.status==="idle");
  const offlineCouriers = couriers.filter(c => c.status==="inactive");

  const initial = name => (name||"K").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <h1>🗺️ Canlı Kuryer Xəritəsi</h1>
        <p>Bakı şəhərindəki bütün kuryer hərəkətləri real vaxtda</p>
      </div>

      {/* STATİSTİKA */}
      <div className="map-stats">
        <div className="ms-card">
          <div className="ms-icon" style={{background:"#E8FAF8"}}>🛵</div>
          <div><div className="ms-val">{activeCouriers.length}</div><div className="ms-label">Aktiv Kuryer</div></div>
        </div>
        <div className="ms-card">
          <div className="ms-icon" style={{background:"#FEF9E7"}}>⏳</div>
          <div><div className="ms-val">{idleCouriers.length}</div><div className="ms-label">Boş Kuryer</div></div>
        </div>
        <div className="ms-card">
          <div className="ms-icon" style={{background:"#EBF5FB"}}>📦</div>
          <div><div className="ms-val">{activeCouriers.length}</div><div className="ms-label">Aktiv Sifariş</div></div>
        </div>
      </div>

      <div className="map-layout">
        {/* SOL — KURYER SİYAHISI */}
        <div className="courier-panel">
          <div className="cp-head">
            <div className="cp-title">
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div className="live-dot"/>
                <span>Kuryerlər ({couriers.length})</span>
              </div>
              <button className="cp-refresh" onClick={fetchCouriers} title="Yenilə">🔄</button>
            </div>
            {lastUpdate && (
              <div style={{fontSize:10,color:"#B0C4D8",marginTop:4}}>
                Son yeniləmə: {lastUpdate.toLocaleTimeString("az-AZ",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
              </div>
            )}
          </div>

          <div className="cp-list">
            {loading ? (
              <div style={{padding:14}}>
                {[1,2,3].map(i=><div key={i} className="skel-line" style={{marginBottom:8}}/>)}
              </div>
            ) : couriers.map(c => {
              const cfg = STATUS_CFG[c.status] || STATUS_CFG.inactive;
              return (
                <div key={c.id}
                  className={`courier-item ${selected?.id===c.id?"selected":""}`}
                  onClick={() => setSelected(selected?.id===c.id ? null : c)}>
                  <div className="ci-ava">{initial(c.name)}</div>
                  <div className="ci-info">
                    <div className="ci-name">{c.name}</div>
                    <div className="ci-order">
                      {c.orderId ? `📦 Sifariş #${c.orderId} · ${c.orderAddress||""}` : "Boşdur"}
                    </div>
                  </div>
                  <div className="ci-status">
                    <span className="status-pill" style={{background:cfg.bg,borderColor:cfg.border,color:cfg.color}}>
                      <span className="sp-dot" style={{background:cfg.dot}}/>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ — XƏRİTƏ */}
        <div className="map-container" ref={mapRef}>
          <div id="leaflet-map" style={{width:"100%",height:"100%"}}/>

          {/* SEÇİLƏN KURYER BİLGİSİ */}
          {selected && (
            <div className="selected-info">
              <button className="si-close" onClick={()=>setSelected(null)}>✕</button>
              <div className="si-name">
                🛵 {selected.name}
                <span className="status-pill" style={{
                  background: STATUS_CFG[selected.status]?.bg,
                  borderColor: STATUS_CFG[selected.status]?.border,
                  color: STATUS_CFG[selected.status]?.color,
                  fontSize:10
                }}>
                  <span className="sp-dot" style={{background:STATUS_CFG[selected.status]?.dot}}/>
                  {STATUS_CFG[selected.status]?.label}
                </span>
              </div>
              <div className="si-row">📱 <strong>{selected.phone || "—"}</strong></div>
              {selected.orderId && (
                <div className="si-row">📦 Sifariş <strong>#{selected.orderId}</strong> · {selected.orderAddress}</div>
              )}
              <div className="si-row">
                📍 <strong>
                  {typeof selected.lat==="number" ? selected.lat.toFixed(4) : "—"},
                  {typeof selected.lng==="number" ? selected.lng.toFixed(4) : "—"}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
