import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockOrders = [
  { id:1, shippingAddress:"Bakı, Nizami küç. 15",    totalAmount:25.40, status:3, createdAt:"2026-03-06T09:00:00", courierId:1 },
  { id:2, shippingAddress:"Bakı, Hüsü Hacıyev 8",   totalAmount:48.20, status:2, createdAt:"2026-03-07T10:00:00", courierId:null },
  { id:3, shippingAddress:"Bakı, İstiqlal küç. 3",   totalAmount:12.00, status:4, createdAt:"2026-03-05T14:00:00", courierId:2 },
  { id:4, shippingAddress:"Bakı, Neftçilər 22",      totalAmount:36.80, status:1, createdAt:"2026-03-08T08:30:00", courierId:null },
];

// Mock kuryer məkanı (API olmasa)
const MOCK_COURIER_LOCATION = { lat:40.4093, lng:49.8671, name:"Tural Əliyev", phone:"+994501112233" };

const ORDER_STATUS = {
  1:{ label:"Sifariş alındı",     cls:"s-pending",   icon:"📦", step:0 },
  2:{ label:"Aptekdə hazırlanır", cls:"s-confirmed",  icon:"⚗️",  step:1 },
  3:{ label:"Kuryer yoldadır",    cls:"s-shipped",    icon:"🚚", step:2 },
  4:{ label:"Çatdırıldı",         cls:"s-delivered",  icon:"✅", step:3 },
  5:{ label:"Ləğv edildi",        cls:"s-cancelled",  icon:"❌", step:-1 },
};

const STEPS = [
  { icon:"📦", label:"Sifariş Alındı" },
  { icon:"⚗️",  label:"Aptekdə Hazırlanır" },
  { icon:"🚚", label:"Kuryer Yoldadır" },
  { icon:"✅", label:"Çatdırıldı" },
];

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:16px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }
  .count-badge { display:inline-flex; align-items:center; background:#EAF2F8; border:1px solid #AED6F1; color:#1A5276; font-size:12px; font-weight:700; padding:2px 10px; border-radius:20px; margin-left:10px; }
  .orders-list { display:flex; flex-direction:column; gap:16px; }
  .order-card { background:#fff; border-radius:16px; border:1.5px solid #D6EAF8; overflow:hidden; transition:all 0.2s; }
  .order-card:hover { border-color:#AED6F1; box-shadow:0 6px 20px rgba(31,97,141,0.08); }
  .order-card.cancelled { border-color:#FADBD8; opacity:0.8; }
  .order-head { padding:14px 18px; display:flex; align-items:center; gap:14px; background:linear-gradient(135deg,#F8FCFF,#EBF5FB); border-bottom:1px solid #EBF5FB; flex-wrap:wrap; }
  .order-num { width:40px; height:40px; border-radius:11px; background:linear-gradient(135deg,#1F618D,#1A5276); display:flex; align-items:center; justify-content:center; color:#fff; font-size:14px; font-weight:800; flex-shrink:0; }
  .order-id { font-size:14px; font-weight:800; color:#154360; }
  .order-date { font-size:11px; color:#8DAFC4; }
  .order-amount { font-size:16px; font-weight:800; color:#1F618D; }
  .s-pill { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .s-pending   { background:#EAF2F8; color:#1A5276; }
  .s-confirmed { background:#EAF2F8; color:#D4AC0D; }
  .s-shipped   { background:#EBF5FB; color:#2E86C1; }
  .s-delivered { background:#EAF2F8; color:#1E8449; }
  .s-cancelled { background:#FDEDEC; color:#E74C3C; }
  .order-body { padding:16px 18px; }
  .order-address { display:flex; align-items:center; gap:7px; font-size:13px; color:#5D8AA8; margin-bottom:18px; background:#F8FCFF; border:1px solid #EBF5FB; padding:9px 13px; border-radius:9px; }

  /* STEPPER */
  .stepper-wrap { position:relative; margin-bottom:12px; }
  .stepper-line-bg   { position:absolute; top:18px; left:14px; right:14px; height:3px; background:#EBF5FB; border-radius:3px; z-index:0; }
  .stepper-line-fill { position:absolute; top:18px; left:14px; height:3px; background:linear-gradient(90deg,#1A5276,#1F618D); border-radius:3px; z-index:1; transition:width 0.6s ease; }
  .stepper-steps { display:flex; justify-content:space-between; position:relative; z-index:2; }
  .stepper-step { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; }
  .stepper-circle { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; border:2.5px solid #D6EAF8; background:#fff; transition:all 0.4s; }
  .stepper-circle.done   { background:linear-gradient(135deg,#1A5276,#1F618D); border-color:#1A5276; box-shadow:0 4px 12px rgba(31,97,141,0.3); }
  .stepper-circle.active { background:#fff; border-color:#1A5276; animation:stepPulse 1.5s infinite; }
  @keyframes stepPulse { 0%,100%{box-shadow:0 0 0 4px rgba(31,97,141,0.15)} 50%{box-shadow:0 0 0 8px rgba(31,97,141,0.08)} }
  .stepper-label { font-size:10px; font-weight:700; color:#8DAFC4; text-align:center; max-width:68px; line-height:1.3; }
  .stepper-label.done,.stepper-label.active { color:#1A5276; }

  /* MOTOR + XƏRİTƏ DÜYMƏSİ */
  .courier-moving {
    display:flex; align-items:center; gap:10px;
    background:linear-gradient(135deg,#EAF2F8,#F0FFF8);
    border:1.5px solid #AED6F1; border-radius:10px; padding:10px 14px; margin-top:4px;
  }
  .courier-moto { font-size:20px; animation:motoMove 1.5s ease-in-out infinite; }
  @keyframes motoMove { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }
  .courier-text { font-size:13px; font-weight:700; color:#1A5276; }
  .courier-sub  { font-size:11px; color:#8DAFC4; }
  .map-toggle-btn {
    margin-left:auto; display:flex; align-items:center; gap:5px;
    padding:7px 13px; border-radius:8px; font-size:12px; font-weight:800;
    font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.18s;
    border:1.5px solid #AED6F1; background:#fff; color:#1A5276;
  }
  .map-toggle-btn:hover { background:#EAF2F8; }
  .map-toggle-btn.active { background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; border-color:#1A5276; }

  /* XƏRİTƏ PANELİ */
  .map-panel {
    margin-top:12px; border-radius:12px; overflow:hidden;
    border:1.5px solid #AED6F1;
    animation:mapExpand 0.3s ease;
  }
  @keyframes mapExpand { from{opacity:0;transform:scaleY(0.95);transform-origin:top} to{opacity:1;transform:scaleY(1)} }
  .map-header {
    background:linear-gradient(135deg,#1A5276,#1F618D);
    padding:10px 14px; display:flex; align-items:center; gap:10px;
  }
  .map-header-title { font-size:13px; font-weight:800; color:#fff; flex:1; }
  .map-header-courier { font-size:11px; color:rgba(255,255,255,0.8); }
  .live-dot { width:8px; height:8px; border-radius:50%; background:#fff; animation:livePulse 1.5s infinite; }
  @keyframes livePulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,255,255,0.4)} 50%{opacity:0.6;box-shadow:0 0 0 5px rgba(255,255,255,0)} }
  .map-frame { width:100%; height:260px; border:none; display:block; }
  .map-footer { background:#F8FCFF; padding:8px 14px; display:flex; align-items:center; gap:6px; font-size:11px; color:#8DAFC4; border-top:1px solid #D6EAF8; }
  .map-footer strong { color:#1A5276; }

  /* SKELETON */
  .skel-list { display:flex; flex-direction:column; gap:16px; }
  .skel-card { background:#fff; border-radius:16px; border:1.5px solid #D6EAF8; }
  .skel-head-o { height:68px; background:#EBF5FB; }
  .skel-body-o { padding:16px 18px; display:flex; flex-direction:column; gap:10px; }
  .skel-line { height:12px; border-radius:6px; background:linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .skel-steps { display:flex; gap:12px; padding:0 18px 16px; }
  .skel-step-circle { width:36px; height:36px; border-radius:50%; background:linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; flex-shrink:0; }
  .empty-state { text-align:center; padding:60px; background:#fff; border-radius:14px; border:1.5px dashed #AED6F1; }
  .empty-state .ei { font-size:48px; margin-bottom:12px; }
  .empty-state h3 { font-size:16px; font-weight:700; color:#154360; margin-bottom:6px; }
  .empty-state p { font-size:13px; color:#5D8AA8; }

  /* TAM EKRAN XƏRİTƏ MODALI */
  .map-fullscreen-overlay {
    position:fixed; top:0; left:0; right:0; bottom:0;
    background:rgba(0,0,0,0.85); z-index:9999;
    display:flex; flex-direction:column;
    animation:fsIn 0.2s ease;
  }
  @keyframes fsIn { from{opacity:0} to{opacity:1} }
  .map-fs-header {
    background:linear-gradient(135deg,#0D2137,#1A5276);
    padding:14px 20px; display:flex; align-items:center; gap:12px;
    flex-shrink:0; box-shadow:0 2px 12px rgba(0,0,0,0.4);
  }
  .map-fs-title { font-size:15px; font-weight:800; color:#fff; flex:1; }
  .map-fs-courier { font-size:12px; color:rgba(255,255,255,0.75); }
  .map-fs-close {
    width:36px; height:36px; border-radius:10px;
    background:rgba(255,255,255,0.15); border:1.5px solid rgba(255,255,255,0.25);
    color:#fff; font-size:18px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all 0.18s; flex-shrink:0;
  }
  .map-fs-close:hover { background:rgba(255,255,255,0.25); }
  .map-fs-body { flex:1; position:relative; overflow:hidden; }
  .map-fs-frame { width:100%; height:100%; border:none; display:block; }
  .map-fs-footer {
    background:#0D2137; padding:10px 20px;
    display:flex; align-items:center; gap:8px;
    font-size:12px; color:#AED6F1; flex-shrink:0;
    border-top:1px solid rgba(255,255,255,0.1);
  }
  .map-fs-footer strong { color:#fff; }

  /* KİÇİK XƏRİTƏDƏKİ BÖYÜT DÜYMƏSİ */
  .map-expand-btn {
    display:flex; align-items:center; gap:5px;
    padding:5px 10px; border-radius:7px; font-size:11px; font-weight:700;
    background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3);
    color:#fff; cursor:pointer; transition:all 0.18s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }
  .map-expand-btn:hover { background:rgba(255,255,255,0.25); }
`;

// Leaflet yükləyici
function loadLeaflet() {
  return new Promise(resolve => {
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

// Mini xəritə komponenti — hər sifariş kartı üçün ayrıca
function CourierMapFullscreen({ orderId, courierId, deliveryAddress, courierInfo, onClose }) {
  const fsMapId  = `fsmap-${orderId}`;
  const mapRef   = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    let mapInstance = null;
    let intervalId  = null;

    const init = async () => {
      const L = await loadLeaflet();
      const el = document.getElementById(fsMapId);
      if (!el || mapRef.current) return;

      const startLat = courierInfo?.lat  || 40.4093;
      const startLng = courierInfo?.lng  || 49.8671;

      mapInstance = L.map(fsMapId, { zoomControl:true });
      mapRef.current = mapInstance;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:"© OpenStreetMap © CARTO", subdomains:"abcd", maxZoom:19,
      }).addTo(mapInstance);
      mapInstance.setView([startLat, startLng], 15);

      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(deliveryAddress+", Baku")}&format=json&limit=1`);
        const geoData = await geoRes.json();
        if (geoData[0]) {
          const dLat = parseFloat(geoData[0].lat);
          const dLng = parseFloat(geoData[0].lon);
          L.polyline([[startLat,startLng],[dLat,dLng]],{color:"#1F618D",weight:4,opacity:0.7,dashArray:"8,5"}).addTo(mapInstance);
          L.marker([dLat,dLng],{icon:L.divIcon({
            html:`<div style="background:#E74C3C;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.4)">📍</div>`,
            iconSize:[30,30],iconAnchor:[15,15],className:""
          })}).addTo(mapInstance).bindPopup(`<b>${deliveryAddress}</b>`);
        }
      } catch {}

      markerRef.current = L.marker([startLat, startLng], {
        icon: L.divIcon({
          html:`<div style="position:relative"><div style="width:50px;height:50px;background:linear-gradient(135deg,#1A5276,#1F618D);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;border:3px solid #fff;box-shadow:0 4px 16px rgba(31,97,141,0.5)">🛵</div><div style="position:absolute;top:-2px;right:-2px;width:14px;height:14px;background:#2ECC71;border-radius:50%;border:2px solid #fff"></div></div>`,
          iconSize:[50,50],iconAnchor:[25,25],className:""
        })
      }).addTo(mapInstance).bindPopup(`<b>🛵 ${courierInfo?.name||"Kuryer"}</b>`);

      intervalId = setInterval(async () => {
        try {
          const res = await axios.get(`${API}/api/Courier/${courierId}`, { headers: authHeader() });
          const d = res.data?.data || res.data;
          const lat = d.latitude || d.lat;
          const lng = d.longitude || d.lng;
          if (lat && lng && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstance.panTo([lat, lng], { animate:true, duration:0.8 });
          }
        } catch {}
      }, 8000);
    };

    init();
    return () => {
      clearInterval(intervalId);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markerRef.current = null;
    };
  }, []);

  return (
    <div className="map-fullscreen-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="map-fs-header">
        <div className="live-dot"/>
        <div style={{flex:1}}>
          <div className="map-fs-title">🛵 Tam Ekran — Canlı Kuryer İzləmə</div>
          <div className="map-fs-courier">{courierInfo?.name||"Kuryer"} · {courierInfo?.phone||""}</div>
        </div>
        <button className="map-fs-close" onClick={onClose}>✕</button>
      </div>
      <div className="map-fs-body">
        <div id={fsMapId} className="map-fs-frame"/>
      </div>
      <div className="map-fs-footer">
        <span>📍</span>
        <span>Çatdırılma ünvanı: <strong>{deliveryAddress}</strong></span>
        <span style={{marginLeft:"auto"}}>🔴 Canlı yayım • hər 8s yenilənir</span>
      </div>
    </div>
  );
}

function CourierMap({ orderId, courierId, deliveryAddress }) {
  const mapDivId = `map-${orderId}`;
  const mapRef   = useRef(null);
  const markerRef = useRef(null);
  const [courierInfo, setCourierInfo] = useState(null);
  const [lastPos, setLastPos]         = useState(null);
  const [fullscreen, setFullscreen]   = useState(false);

  const fetchCourierLocation = async () => {
    try {
      // Kuryer məkanı üçün endpoint cəhdi
      const res = await axios.get(`${API}/api/Courier/${courierId}`, { headers: authHeader() });
      const d = res.data?.data || res.data;
      const loc = {
        lat:  d.latitude  || d.lat  || MOCK_COURIER_LOCATION.lat + (Math.random()-0.5)*0.01,
        lng:  d.longitude || d.lng  || MOCK_COURIER_LOCATION.lng + (Math.random()-0.5)*0.01,
        name: d.appUserName || d.name || MOCK_COURIER_LOCATION.name,
        phone: d.phoneNumber || d.phone || MOCK_COURIER_LOCATION.phone,
      };
      setCourierInfo(loc);
      setLastPos(loc);
      return loc;
    } catch {
      // API yoxdursa mock
      const mock = {
        ...MOCK_COURIER_LOCATION,
        lat: MOCK_COURIER_LOCATION.lat + (Math.random()-0.5)*0.008,
        lng: MOCK_COURIER_LOCATION.lng + (Math.random()-0.5)*0.008,
      };
      setCourierInfo(mock);
      setLastPos(mock);
      return mock;
    }
  };

  useEffect(() => {
    let mapInstance = null;
    let intervalId  = null;

    const initMap = async () => {
      const L   = await loadLeaflet();
      const loc = await fetchCourierLocation();

      const el = document.getElementById(mapDivId);
      if (!el || mapRef.current) return;

      mapInstance = L.map(mapDivId, { zoomControl:false, dragging:true, scrollWheelZoom:false });
      mapRef.current = mapInstance;

      // Tünd xəritə
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:"© OpenStreetMap © CARTO", subdomains:"abcd", maxZoom:19,
      }).addTo(mapInstance);

      mapInstance.setView([loc.lat, loc.lng], 15);

      // Çatdırılma ünvanı marker-i
      try {
        // Ünvanı koordinata çevir (nominatim)
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(deliveryAddress+", Baku")}&format=json&limit=1`);
        const geoData = await geoRes.json();
        if (geoData[0]) {
          const destLat = parseFloat(geoData[0].lat);
          const destLng = parseFloat(geoData[0].lon);

          // Xətt
          L.polyline([[loc.lat, loc.lng],[destLat, destLng]], {
            color:"#1F618D", weight:3, opacity:0.6, dashArray:"6,4"
          }).addTo(mapInstance);

          // Ünvan marker-i
          L.marker([destLat, destLng], {
            icon: L.divIcon({
              html:`<div style="background:#E74C3C;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">📍</div>`,
              iconSize:[24,24], iconAnchor:[12,12], className:""
            })
          }).addTo(mapInstance).bindPopup(`<b>${deliveryAddress}</b>`);
        }
      } catch { /* ünvan tapılmasa da kuryer görünsün */ }

      // Kuryer marker-i
      const courierMarkerIcon = L.divIcon({
        html:`<div style="position:relative">
          <div style="width:40px;height:40px;background:linear-gradient(135deg,#1A5276,#1F618D);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 4px 12px rgba(31,97,141,0.4)">🛵</div>
          <div style="position:absolute;top:-2px;right:-2px;width:12px;height:12px;background:#2ECC71;border-radius:50%;border:2px solid #fff;animation:pulse 1.5s infinite"></div>
        </div>`,
        iconSize:[40,40], iconAnchor:[20,20], className:""
      });

      markerRef.current = L.marker([loc.lat, loc.lng], { icon: courierMarkerIcon })
        .addTo(mapInstance)
        .bindPopup(`<b>🛵 ${loc.name}</b><br/>${loc.phone}`);

      // Hər 8 saniyədə kuryer mövqeyini yenilə
      intervalId = setInterval(async () => {
        const newLoc = await fetchCourierLocation();
        if (markerRef.current) {
          markerRef.current.setLatLng([newLoc.lat, newLoc.lng]);
          mapInstance.panTo([newLoc.lat, newLoc.lng], { animate:true, duration:0.8 });
        }
      }, 8000);
    };

    initMap();

    return () => {
      clearInterval(intervalId);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markerRef.current = null;
    };
  }, [orderId]);

  return (
    <div className="map-panel">
      {fullscreen && (
        <CourierMapFullscreen
          orderId={orderId}
          courierId={courierId}
          deliveryAddress={deliveryAddress}
          courierInfo={courierInfo}
          onClose={() => setFullscreen(false)}
        />
      )}
      <div className="map-header">
        <div className="live-dot"/>
        <div style={{flex:1}}>
          <div className="map-header-title">🛵 Kuryer canlı izlənir</div>
          {courierInfo && <div className="map-header-courier">{courierInfo.name} · {courierInfo.phone}</div>}
        </div>
        <button className="map-expand-btn" onClick={() => setFullscreen(true)}>
          ⛶ Tam ekran
        </button>
      </div>
      <div id={mapDivId} className="map-frame"/>
      <div className="map-footer">
        <span>📍</span>
        <span>Çatdırılma ünvanı: <strong>{deliveryAddress}</strong></span>
        {lastPos && (
          <span style={{marginLeft:"auto"}}>🔄 {new Date().toLocaleTimeString("az-AZ",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>
        )}
      </div>
    </div>
  );
}

export default function PatientOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMaps, setOpenMaps] = useState({}); // hansi sifarişin xəritəsi açıqdır

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/Order`, { headers: authHeader() });
        setOrders(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch { setOrders(mockOrders); }
      finally { setLoading(false); }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleMap = (id) => setOpenMaps(m => ({ ...m, [id]: !m[id] }));

  const formatDate = dt => {
    if (!dt) return "";
    return new Date(dt).toLocaleDateString("az-AZ",{day:"2-digit",month:"2-digit",year:"numeric"}) + " " +
           new Date(dt).toLocaleTimeString("az-AZ",{hour:"2-digit",minute:"2-digit"});
  };

  const stepperFill = step => {
    if (step <= 0) return "0%";
    return `calc(${(step / (STEPS.length - 1)) * 100}% - 28px)`;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pg-header">
        <div>
          <h1>Sifarişlərim <span className="count-badge">{orders.length}</span></h1>
          <p>Dərman sifarişlərinizi canlı izləyin</p>
        </div>
      </div>

      {loading ? (
        <div className="skel-list">
          {[1,2,3].map(i=>(
            <div className="skel-card" key={i}>
              <div className="skel-head-o"/>
              <div className="skel-body-o">
                <div className="skel-line" style={{width:"70%"}}/>
                <div className="skel-steps">{[...Array(4)].map((_,j)=><div className="skel-step-circle" key={j}/>)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="ei">📦</div>
          <h3>Sifariş yoxdur</h3>
          <p>Reseptinizdəki dərmanları səbətə atıb sifariş verin</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const st = ORDER_STATUS[order.status] || ORDER_STATUS[1];
            const isCancelled = order.status === 5;
            const isShipping  = order.status === 3;
            const mapOpen     = openMaps[order.id];

            return (
              <div className={`order-card ${isCancelled?"cancelled":""}`} key={order.id}>
                <div className="order-head">
                  <div className="order-num">#{order.id}</div>
                  <div>
                    <div className="order-id">Sifariş #{order.id}</div>
                    <div className="order-date">📅 {formatDate(order.createdAt)}</div>
                  </div>
                  <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <span className={`s-pill ${st.cls}`}>{st.icon} {st.label}</span>
                    <div className="order-amount">{order.totalAmount} ₼</div>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-address"><span>📍</span><span>{order.shippingAddress}</span></div>

                  {!isCancelled && (
                    <div className="stepper-wrap">
                      <div className="stepper-line-bg"/>
                      <div className="stepper-line-fill" style={{width:stepperFill(st.step)}}/>
                      <div className="stepper-steps">
                        {STEPS.map((s,idx)=>{
                          const done = idx < st.step;
                          const active = idx === st.step;
                          return (
                            <div className="stepper-step" key={idx}>
                              <div className={`stepper-circle ${done?"done":""} ${active?"active":""}`}>
                                {done ? "✓" : s.icon}
                              </div>
                              <div className={`stepper-label ${done?"done":""} ${active?"active":""}`}>{s.label}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* STATUS 3: KURYER YOLDADIR */}
                      {isShipping && (
                        <div className="courier-moving">
                          <div className="courier-moto">🛵</div>
                          <div>
                            <div className="courier-text">Kuryer yoldadır!</div>
                            <div className="courier-sub">Dərmanınız çatdırılır...</div>
                          </div>
                          {/* XƏRİTƏ AÇ/BAĞLA DÜYMƏSİ */}
                          <button
                            className={`map-toggle-btn ${mapOpen?"active":""}`}
                            onClick={()=>toggleMap(order.id)}>
                            {mapOpen ? "🗺️ Xəritəni bağla" : "🗺️ Kuryer haradadır?"}
                          </button>
                        </div>
                      )}

                      {/* MİNİ XƏRİTƏ */}
                      {isShipping && mapOpen && (
                        <CourierMap
                          orderId={order.id}
                          courierId={order.courierId}
                          deliveryAddress={order.shippingAddress}
                        />
                      )}
                    </div>
                  )}

                  {isCancelled && (
                    <div style={{background:"#FDF2F2",border:"1px solid #FADBD8",borderRadius:9,padding:"10px 14px",fontSize:13,color:"#C0392B",display:"flex",alignItems:"center",gap:8}}>
                      ❌ Bu sifariş ləğv edilib
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}