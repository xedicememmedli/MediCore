// src/components/SkeletonLoader.jsx
// İstifadə: import { SkeletonCard, SkeletonTable, SkeletonList, SkeletonDashboard } from '../../components/SkeletonLoader';

const skeletonStyles = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .sk-base {
    background: linear-gradient(90deg, #EBF5FB 25%, #D6EAF8 50%, #EBF5FB 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 6px;
  }
  .sk-wrap { display: flex; flex-direction: column; gap: 12px; }

  /* CARD SKELETON */
  .sk-card {
    background: #fff;
    border: 1.5px solid #D6EAF8;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .sk-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
  .sk-avatar { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; }
  .sk-title  { height: 14px; width: 55%; }
  .sk-sub    { height: 11px; width: 35%; margin-top: 4px; }
  .sk-line   { height: 12px; }
  .sk-line-short { height: 12px; width: 70%; }
  .sk-line-xs    { height: 10px; width: 45%; }

  /* STAT CARD */
  .sk-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
  .sk-stat-card {
    background: #fff;
    border: 1.5px solid #D6EAF8;
    border-radius: 14px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .sk-stat-icon { width: 40px; height: 40px; border-radius: 10px; }
  .sk-stat-val  { height: 22px; width: 60%; margin-top: 4px; }
  .sk-stat-lbl  { height: 10px; width: 80%; }

  /* TABLE SKELETON */
  .sk-table { background: #fff; border: 1.5px solid #D6EAF8; border-radius: 14px; overflow: hidden; }
  .sk-table-head { padding: 14px 18px; background: #F8FCFF; border-bottom: 1px solid #EBF5FB; display: flex; gap: 16px; }
  .sk-th { height: 11px; }
  .sk-table-row { padding: 14px 18px; display: flex; gap: 16px; align-items: center; border-bottom: 1px solid #F4FAFD; }
  .sk-table-row:last-child { border-bottom: none; }
  .sk-td { height: 12px; }
  .sk-td-sm { height: 10px; width: 40%; }

  /* LIST SKELETON */
  .sk-list-item {
    background: #fff;
    border: 1.5px solid #D6EAF8;
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .sk-dot { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; }
  .sk-list-content { flex: 1; display: flex; flex-direction: column; gap: 7px; }

  /* PAGE HEADER SKELETON */
  .sk-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .sk-header-title { height: 20px; width: 200px; }
  .sk-header-sub   { height: 12px; width: 140px; margin-top: 6px; }
  .sk-btn-placeholder { height: 36px; width: 120px; border-radius: 10px; }
`;

// ── Tək kart skeleti ──────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }) {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div className="sk-card">
        <div className="sk-card-header">
          <div className="sk-base sk-avatar" />
          <div style={{ flex: 1 }}>
            <div className="sk-base sk-title" />
            <div className="sk-base sk-sub" />
          </div>
        </div>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`sk-base ${i === lines - 1 ? "sk-line-short" : "sk-line"}`} />
        ))}
      </div>
    </>
  );
}

// ── Stat kartları skeleti (dashboard üçün) ───────────────────────
export function SkeletonStats({ count = 4 }) {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div className="sk-stat-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div className="sk-stat-card" key={i}>
            <div className="sk-base sk-stat-icon" />
            <div className="sk-base sk-stat-val" />
            <div className="sk-base sk-stat-lbl" />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Cədvəl skeleti ───────────────────────────────────────────────
export function SkeletonTable({ rows = 5, cols = 4 }) {
  const widths = ["30%", "20%", "25%", "15%", "10%"];
  return (
    <>
      <style>{skeletonStyles}</style>
      <div className="sk-table">
        <div className="sk-table-head">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="sk-base sk-th" style={{ flex: 1 }} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div className="sk-table-row" key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="sk-base sk-td" style={{ flex: 1, width: widths[c] }} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Siyahı skeleti ───────────────────────────────────────────────
export function SkeletonList({ count = 4 }) {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div className="sk-wrap">
        {Array.from({ length: count }).map((_, i) => (
          <div className="sk-list-item" key={i}>
            <div className="sk-base sk-dot" />
            <div className="sk-list-content">
              <div className="sk-base sk-line" style={{ width: `${55 + (i % 3) * 15}%` }} />
              <div className="sk-base sk-line-xs" />
            </div>
            <div className="sk-base" style={{ width: 60, height: 26, borderRadius: 20 }} />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Tam dashboard skeleti ────────────────────────────────────────
export function SkeletonDashboard() {
  return (
    <>
      <style>{skeletonStyles}</style>
      {/* Greeting card */}
      <div style={{ background: "#1F618D", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
        <div className="sk-base" style={{ height: 22, width: "40%", background: "rgba(255,255,255,0.2)", backgroundSize: "600px 100%" }} />
        <div className="sk-base" style={{ height: 14, width: "60%", marginTop: 10, background: "rgba(255,255,255,0.15)", backgroundSize: "600px 100%" }} />
      </div>
      {/* Stat cards */}
      <SkeletonStats count={4} />
      {/* Two column cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    </>
  );
}

// ── Səhifə başlığı skeleti ───────────────────────────────────────
export function SkeletonPageHeader() {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div className="sk-page-header">
        <div>
          <div className="sk-base sk-header-title" />
          <div className="sk-base sk-header-sub" />
        </div>
        <div className="sk-base sk-btn-placeholder" />
      </div>
    </>
  );
}

// ── Default export (sadəcə sətir skeleti) ───────────────────────
export default function SkeletonLines({ count = 4 }) {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div className="sk-wrap">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`sk-base ${i === count - 1 ? "sk-line-short" : "sk-line"}`} />
        ))}
      </div>
    </>
  );
}