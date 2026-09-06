import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Mock data
const mockResults = [
  {
    id: 1,
    testName: "Ümumi Qan Analizi",
    testDate: "2026-03-01T09:00:00",
    status: "Hazır",
    doctorName: "Dr. Əli Həsənov",
    details: [
      { id: 1, name: "Hemoglobin", value: 13.5, unit: "g/dL", refMin: 12, refMax: 17, prevValue: 14.2 },
      { id: 2, name: "Leykositlər", value: 7.2, unit: "10³/μL", refMin: 4, refMax: 10, prevValue: 6.8 },
      { id: 3, name: "Trombositlər", value: 220, unit: "10³/μL", refMin: 150, refMax: 400, prevValue: 215 },
      { id: 4, name: "Eritrositlər", value: 4.1, unit: "10⁶/μL", refMin: 3.8, refMax: 5.2, prevValue: 4.3 },
    ],
  },
  {
    id: 2,
    testName: "Biokimyəvi Analiz",
    testDate: "2026-02-15T10:30:00",
    status: "Hazır",
    doctorName: "Dr. Günel Quliyeva",
    details: [
      { id: 5, name: "Qlükoza", value: 5.8, unit: "mmol/L", refMin: 3.9, refMax: 6.1, prevValue: 5.2 },
      { id: 6, name: "Xolesterin", value: 6.2, unit: "mmol/L", refMin: 0, refMax: 5.2, prevValue: 5.8 },
      { id: 7, name: "Kreatinin", value: 88, unit: "μmol/L", refMin: 60, refMax: 110, prevValue: 90 },
      { id: 8, name: "ALT", value: 42, unit: "U/L", refMin: 0, refMax: 40, prevValue: 35 },
      { id: 9, name: "AST", value: 28, unit: "U/L", refMin: 0, refMax: 40, prevValue: 30 },
    ],
  },
];

// Bədən üzvü ilə analiz adı arasında əlaqə
const ORGAN_MAP = {
  Hemoglobin: "blood",
  Leykositlər: "blood",
  Trombositlər: "blood",
  Eritrositlər: "blood",

  Xolesterin: "heart",
  Qlükoza: "pancreas",
  Kreatinin: "kidney",

  ALT: "liver",
  AST: "liver",
  Bilirubin: "liver",

  TSH: "thyroid",
  T4: "thyroid",
};

const ORGAN_LABELS = {
  heart: "❤️ Ürək",
  blood: "🩸 Qan",
  liver: "🟤 Qaraciyər",
  kidney: "🫘 Böyrək",
  thyroid: "🔬 Qalxanabənzər",
};

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:16px; flex-wrap:wrap; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }

  .body-map-section { background:#fff; border:1.5px solid #D6EAF8; border-radius:16px; padding:22px; margin-bottom:22px; }
  .body-map-title { font-size:15px; font-weight:800; color:#154360; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .body-map-layout { display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap; }
  .body-figure { position:relative; flex-shrink:0; }
  .body-svg { width:160px; height:300px; }

  .organ-spot {
    position:absolute;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:14px;
    cursor:pointer;
    transition:all 0.3s;
    border:2px solid transparent;
    user-select:none;
  }

  .organ-spot.normal  { background:rgba(31,97,141,0.15); border-color:rgba(31,97,141,0.3); }
  .organ-spot.warning { background:rgba(241,196,15,0.18); border-color:rgba(212,172,13,0.45); animation:warnPulse 2s infinite; }
  .organ-spot.danger  { background:rgba(231,76,60,0.2); border-color:rgba(231,76,60,0.5); animation:dangerPulse 1.5s infinite; }

  @keyframes warnPulse {
    0%,100% { box-shadow:0 0 0 0 rgba(241,196,15,0.28); }
    50% { box-shadow:0 0 0 8px rgba(241,196,15,0); }
  }

  @keyframes dangerPulse {
    0%,100% { box-shadow:0 0 0 0 rgba(231,76,60,0.4); }
    50% { box-shadow:0 0 0 10px rgba(231,76,60,0); }
  }

  .body-legend { flex:1; min-width:220px; }
  .body-legend-title { font-size:12px; font-weight:800; color:#5D8AA8; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:10px; }
  .legend-row { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:9px; margin-bottom:6px; cursor:pointer; transition:all 0.18s; border:1.5px solid transparent; }
  .legend-row:hover { background:#F8FCFF; }
  .legend-row.active { background:#EAF2F8; border-color:#AED6F1; }
  .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .legend-dot.normal  { background:#1A5276; }
  .legend-dot.warning { background:#D4AC0D; }
  .legend-dot.danger  { background:#E74C3C; }
  .legend-name { flex:1; font-size:13px; font-weight:700; color:#154360; }
  .legend-status { font-size:11px; font-weight:800; }
  .legend-status.normal  { color:#1A5276; }
  .legend-status.warning { color:#D4AC0D; }
  .legend-status.danger  { color:#E74C3C; }

  .result-list { display:flex; flex-direction:column; gap:14px; }
  .result-card { background:#fff; border:1.5px solid #D6EAF8; border-radius:14px; overflow:hidden; transition:all 0.2s; }
  .result-card:hover { border-color:#AED6F1; box-shadow:0 4px 16px rgba(31,97,141,0.08); }
  .result-head { display:flex; align-items:center; gap:14px; padding:16px 20px; cursor:pointer; }
  .result-icon { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#EAF2F8,#D6EAF8); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .result-info { flex:1; }
  .result-name { font-size:14px; font-weight:800; color:#154360; margin-bottom:3px; }
  .result-meta { font-size:12px; color:#8DAFC4; }
  .result-status-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:800; }
  .rb-ready { background:#EAF2F8; color:#1A5276; }
  .result-chevron { font-size:12px; color:#B0C4D8; transition:transform 0.2s; }
  .result-chevron.open { transform:rotate(180deg); }

  .result-details { border-top:1px solid #EBF5FB; padding:16px 20px; }
  .detail-table { width:100%; border-collapse:collapse; }
  .detail-table th { text-align:left; font-size:10px; font-weight:800; color:#8DAFC4; letter-spacing:0.5px; text-transform:uppercase; padding:8px 10px; background:#F8FCFF; border-bottom:1px solid #EBF5FB; }
  .detail-table td { padding:11px 10px; font-size:13px; border-bottom:1px solid #F4FAFD; }
  .detail-table tr:last-child td { border-bottom:none; }
  .detail-table tr:hover td { background:#FAFFFD; }
  .val-cell { font-weight:800; font-size:15px; }
  .val-cell.normal  { color:#1A5276; }
  .val-cell.warning { color:#D4AC0D; }
  .val-cell.danger  { color:#E74C3C; }
  .ref-range { font-size:11px; color:#8DAFC4; }

  .trend-badge { display:inline-flex; align-items:center; gap:3px; font-size:11px; font-weight:800; padding:2px 7px; border-radius:20px; }
  .trend-up   { background:#EAF2F8; color:#1A5276; }
  .trend-down { background:#FDEDEC; color:#E74C3C; }
  .trend-same { background:#EBF5FB; color:#5D8AA8; }

  .progress-bar-wrap { width:80px; height:6px; background:#EBF5FB; border-radius:3px; overflow:hidden; }
  .progress-bar-fill { height:100%; border-radius:3px; transition:width 0.5s ease; }
  .pb-normal  { background:linear-gradient(90deg,#1A5276,#1F618D); }
  .pb-warning { background:linear-gradient(90deg,#D4AC0D,#F1C40F); }
  .pb-danger  { background:linear-gradient(90deg,#E74C3C,#C0392B); }

  .skel-line { height:12px; border-radius:6px; background:linear-gradient(90deg,#EBF5FB 25%,#D6EAF8 50%,#EBF5FB 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; margin-bottom:8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .empty-state { text-align:center; padding:60px; background:#fff; border-radius:14px; border:1.5px dashed #AED6F1; }
  .empty-state .ei { font-size:48px; margin-bottom:12px; }
  .empty-state h3 { font-size:16px; font-weight:700; color:#154360; margin-bottom:6px; }
  .empty-state p { font-size:13px; color:#5D8AA8; }
`;

function getStatus(val, min, max) {
  if (val < min || val > max) {
    const over = val > max ? (val - max) / max : (min - val) / min;
    return over > 0.2 ? "danger" : "warning";
  }
  return "normal";
}

function getProgressPct(val, min, max) {
  const range = max - min;
  const pos = val - min;
  return Math.min(100, Math.max(0, (pos / range) * 100));
}

function getTrend(val, prev) {
  if (!prev) return null;
  const diff = ((val - prev) / prev * 100).toFixed(1);
  if (Math.abs(diff) < 1) return { cls: "trend-same", icon: "→", label: "Dəyişməyib" };
  return diff > 0
    ? { cls: "trend-up", icon: "⬆", label: `+${diff}%` }
    : { cls: "trend-down", icon: "⬇", label: `${diff}%` };
}

const ORGAN_POSITIONS = {
  thyroid:  { top: "15%", left: "43%", w: 24, h: 24 },
  heart:    { top: "30%", left: "43%", w: 28, h: 28 },
  liver:    { top: "40%", left: "56%", w: 26, h: 26 },
  blood:    { top: "46%", left: "33%", w: 26, h: 26 },
  pancreas: { top: "46%", left: "44%", w: 22, h: 22 },
  kidney:   { top: "52%", left: "57%", w: 24, h: 24 },
};

function getOrganIcon(organ, status) {
  if (status === "warning") return "⚠️";
  if (status === "danger") {
    switch (organ) {
      case "heart":
        return "❤️";
      case "blood":
        return "🩸";
      case "liver":
        return "🟤";
      case "kidney":
        return "🫘";
      case "thyroid":
        return "🔬";
    }
  }

  switch (organ) {
    case "heart":
      return "❤️";
    case "blood":
      return "🩸";
    case "liver":
      return "🟤";
    case "kidney":
      return "🫘";
    case "thyroid":
      return "🔬";

  }
}

// Sadə bədən SVG
function BodyFigure({ organStatuses, onOrganClick, activeOrgan }) {
  return (
    <div className="body-figure" style={{ position: "relative", width: 160, height: 300 }}>
      <svg viewBox="0 0 80 160" className="body-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="12" r="10" fill="#D6EAF8" stroke="#AED6F1" strokeWidth="1" />
        <rect x="36" y="21" width="8" height="6" rx="2" fill="#D6EAF8" />
        <rect x="22" y="27" width="36" height="48" rx="8" fill="#EBF5FB" stroke="#AED6F1" strokeWidth="1" />
        <rect x="8" y="28" width="13" height="38" rx="6" fill="#D6EAF8" transform="rotate(-5 8 28)" />
        <rect x="59" y="28" width="13" height="38" rx="6" fill="#D6EAF8" transform="rotate(5 59 28)" />
        <rect x="25" y="74" width="14" height="48" rx="6" fill="#D6EAF8" transform="rotate(3 25 74)" />
        <rect x="41" y="74" width="14" height="48" rx="6" fill="#D6EAF8" transform="rotate(-3 41 74)" />
      </svg>

      {Object.entries(ORGAN_POSITIONS).map(([organ, pos]) => {
        const st = organStatuses[organ] || "normal";
        const isActive = activeOrgan === organ;

        return (
          <div
            key={organ}
            className={`organ-spot ${st}`}
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.w,
              height: pos.h,
              fontSize: 12,
              transform: isActive ? "scale(1.4)" : "scale(1)",
              zIndex: isActive ? 10 : 1,
            }}
            onClick={() => onOrganClick(organ)}
            title={ORGAN_LABELS[organ]}
          >
            {getOrganIcon(organ, st)}
          </div>
        );
      })}
    </div>
  );
}

export default function PatientLabResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [activeOrgan, setActiveOrgan] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/LabResult`, { headers: authHeader() });
        const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];

        if (arr.length > 0) {
          const withDetails = await Promise.all(
            arr.map(async (r) => {
              try {
                const dRes = await axios.get(`${API}/api/LabResultDetail?labResultId=${r.id}`, {
                  headers: authHeader(),
                });
                return { ...r, details: Array.isArray(dRes.data) ? dRes.data : dRes.data?.data || [] };
              } catch {
                return { ...r, details: [] };
              }
            })
          );
          setResults(withDetails);
        } else {
          setResults(mockResults);
        }
      } catch {
        setResults(mockResults);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const organStatuses = {};
  results.forEach((r) => {
    (r.details || []).forEach((d) => {
      const organ = ORGAN_MAP[d.name];
      if (!organ) return;

      const st = getStatus(d.value, d.refMin, d.refMax);

      if (!organStatuses[organ] || st === "danger" || (st === "warning" && organStatuses[organ] === "normal")) {
        organStatuses[organ] = st;
      }
    });
  });

  const filteredResults = activeOrgan
    ? results
        .map((r) => ({
          ...r,
          details: (r.details || []).filter((d) => ORGAN_MAP[d.name] === activeOrgan),
        }))
        .filter((r) => r.details.length > 0)
    : results;

  const formatDate = (dt) =>
    new Date(dt).toLocaleDateString("az-AZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>🔬 Lab Nəticələri</h1>
          <p>Analiz nəticələriniz və sağlamlıq göstəriciləriniz</p>
        </div>
      </div>

      {loading ? (
        <div style={{ background: "#fff", borderRadius: 14, padding: 22, border: "1.5px solid #D6EAF8" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skel-line" />
          ))}
        </div>
      ) : (
        <>
          <div className="body-map-section">
            <div className="body-map-title">🫀 İnteraktiv Sağlamlıq Xəritəsi</div>

            <div className="body-map-layout">
              <BodyFigure
                organStatuses={organStatuses}
                onOrganClick={(o) => setActiveOrgan(activeOrgan === o ? null : o)}
                activeOrgan={activeOrgan}
              />

              <div className="body-legend">
                <div className="body-legend-title">Üzv statusları</div>

                {Object.entries(ORGAN_LABELS).map(([organ, label]) => {
                  const st = organStatuses[organ] || "normal";
                  const statusLabels = { normal: "Normal", warning: "Diqqət", danger: "Problem" };

                  return (
                    <div
                      key={organ}
                      className={`legend-row ${activeOrgan === organ ? "active" : ""}`}
                      onClick={() => setActiveOrgan(activeOrgan === organ ? null : organ)}
                    >
                      <div className={`legend-dot ${st}`} />
                      <div className="legend-name">{label}</div>
                      <div className={`legend-status ${st}`}>{statusLabels[st]}</div>
                    </div>
                  );
                })}

                {activeOrgan && (
                  <div style={{ marginTop: 10, fontSize: 11, color: "#8DAFC4", fontStyle: "italic" }}>
                    Filtr aktiv: {ORGAN_LABELS[activeOrgan]} •
                    <button
                      onClick={() => setActiveOrgan(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1A5276",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 11,
                        marginLeft: 4,
                      }}
                    >
                      Təmizlə ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="empty-state">
              <div className="ei">🔬</div>
              <h3>Nəticə yoxdur</h3>
              <p>Hələ analiz nəticəniz yoxdur</p>
            </div>
          ) : (
            <div className="result-list">
              {filteredResults.map((res) => (
                <div className="result-card" key={res.id}>
                  <div className="result-head" onClick={() => setExpanded(expanded === res.id ? null : res.id)}>
                    <div className="result-icon">🧪</div>

                    <div className="result-info">
                      <div className="result-name">{res.testName}</div>
                      <div className="result-meta">
                        📅 {formatDate(res.testDate)} · {res.doctorName}
                      </div>
                    </div>

                    <span className="result-status-badge rb-ready">✅ {res.status || "Hazır"}</span>
                    <span className={`result-chevron ${expanded === res.id ? "open" : ""}`}>▼</span>
                  </div>

                  {expanded === res.id && (
                    <div className="result-details">
                      <table className="detail-table">
                        <thead>
                          <tr>
                            <th>Göstərici</th>
                            <th>Nəticə</th>
                            <th>Ref. Norma</th>
                            <th>Trend</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(res.details || []).map((d) => {
                            const st = getStatus(d.value, d.refMin, d.refMax);
                            const trend = getTrend(d.value, d.prevValue);
                            const pct = getProgressPct(d.value, d.refMin, d.refMax);

                            return (
                              <tr key={d.id}>
                                <td style={{ fontWeight: 700, color: "#154360" }}>{d.name}</td>
                                <td>
                                  <div className={`val-cell ${st}`}>
                                    {d.value} <span style={{ fontSize: 11, fontWeight: 600 }}>{d.unit}</span>
                                  </div>
                                  <div className="progress-bar-wrap" style={{ marginTop: 4 }}>
                                    <div className={`progress-bar-fill pb-${st}`} style={{ width: `${pct}%` }} />
                                  </div>
                                </td>
                                <td>
                                  <div className="ref-range">
                                    {d.refMin} – {d.refMax} {d.unit}
                                  </div>
                                </td>
                                <td>
                                  {trend && <span className={`trend-badge ${trend.cls}`}>{trend.icon} {trend.label}</span>}
                                </td>
                                <td>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 800,
                                      padding: "3px 9px",
                                      borderRadius: 20,
                                      background:
                                        st === "normal"
                                          ? "#EAF2F8"
                                          : st === "warning"
                                          ? "#FCF3CF"
                                          : "#FDEDEC",
                                      color:
                                        st === "normal"
                                          ? "#1A5276"
                                          : st === "warning"
                                          ? "#D4AC0D"
                                          : "#E74C3C",
                                    }}
                                  >
                                    {st === "normal" ? "Normaldır" : st === "warning" ? "Diqqət" : "Problem"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}