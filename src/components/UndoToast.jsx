import { useState, useEffect, useRef } from "react";

const styles = `
  .undo-container {
    position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
    z-index:9999; display:flex; flex-direction:column; gap:10px; align-items:center;
    pointer-events:none;
  }
  .undo-toast {
    display:flex; align-items:center; gap:12px;
    background:#1A252F; color:#fff;
    padding:13px 18px; border-radius:12px;
    min-width:320px; max-width:460px;
    box-shadow:0 8px 32px rgba(0,0,0,0.25);
    pointer-events:all;
    animation:toastSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
    position:relative; overflow:hidden;
  }
  .undo-toast.leaving {
    animation:toastSlideDown 0.25s ease forwards;
  }
  @keyframes toastSlideUp   { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes toastSlideDown { from{transform:translateY(0);opacity:1}   to{transform:translateY(20px);opacity:0} }

  /* Progress xətti */
  .undo-progress {
    position:absolute; bottom:0; left:0; height:3px;
    background:linear-gradient(90deg,#E67E22,#F39C12);
    border-radius:0 0 0 12px;
    transition:width linear;
  }

  .undo-icon { font-size:18px; flex-shrink:0; }
  .undo-text { flex:1; }
  .undo-main { font-size:13px; font-weight:700; color:#fff; margin-bottom:2px; }
  .undo-sub  { font-size:11px; color:rgba(255,255,255,0.55); }
  .undo-btn {
    padding:7px 14px; background:linear-gradient(135deg,#E67E22,#F39C12);
    border:none; border-radius:8px; color:#fff; font-size:12px; font-weight:800;
    font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; flex-shrink:0;
    transition:all 0.18s; white-space:nowrap;
  }
  .undo-btn:hover { background:linear-gradient(135deg,#D35400,#E67E22); transform:scale(1.04); }
  .undo-close {
    width:24px; height:24px; border-radius:6px; background:rgba(255,255,255,0.1);
    border:none; color:rgba(255,255,255,0.6); font-size:12px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:all 0.15s;
  }
  .undo-close:hover { background:rgba(255,255,255,0.2); color:#fff; }
`;

const DURATION = 5000; // 5 saniyə

// Global toast manager
let globalSetToasts = null;
let toastIdCounter = 0;

export function showUndoToast({ message, subText, onUndo, onExpire }) {
  if (!globalSetToasts) return;
  const id = ++toastIdCounter;
  globalSetToasts(ts => [...ts, { id, message, subText, onUndo, onExpire, createdAt: Date.now() }]);
}

export function UndoToastContainer() {
  const [toasts, setToasts] = useState([]);
  const [leaving, setLeaving] = useState(new Set());

  useEffect(() => { globalSetToasts = setToasts; return () => { globalSetToasts = null; }; }, []);

  const removeToast = (id, undone=false) => {
    setLeaving(s => new Set([...s, id]));
    setTimeout(() => {
      setToasts(ts => {
        const t = ts.find(x => x.id===id);
        if (t && !undone && t.onExpire) t.onExpire();
        return ts.filter(x => x.id!==id);
      });
      setLeaving(s => { const n=new Set(s); n.delete(id); return n; });
    }, 280);
  };

  const handleUndo = (id) => {
    const t = toasts.find(x => x.id===id);
    if (t?.onUndo) t.onUndo();
    removeToast(id, true);
  };

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map(t => {
      const elapsed = Date.now() - t.createdAt;
      const remaining = Math.max(0, DURATION - elapsed);
      return setTimeout(() => removeToast(t.id, false), remaining);
    });
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="undo-container">
        {toasts.map(t => {
          const elapsed = Date.now() - t.createdAt;
          const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
          return (
            <div key={t.id} className={`undo-toast ${leaving.has(t.id)?"leaving":""}`}>
              <div className="undo-progress" style={{width:`${pct}%`, transitionDuration:`${DURATION}ms`}}/>
              <div className="undo-icon">🗑️</div>
              <div className="undo-text">
                <div className="undo-main">{t.message}</div>
                {t.subText && <div className="undo-sub">{t.subText}</div>}
              </div>
              {t.onUndo && (
                <button className="undo-btn" onClick={()=>handleUndo(t.id)}>↩ Geri qaytar</button>
              )}
              <button className="undo-close" onClick={()=>removeToast(t.id, false)}>✕</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
