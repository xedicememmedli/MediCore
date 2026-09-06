// src/components/ErrorBoundary.jsx
// İstifadə: <ErrorBoundary><YourComponent /></ErrorBoundary>
import { Component } from "react";

const styles = `
  .eb-wrap {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 320px; padding: 40px; text-align: center;
    background: #fff; border-radius: 16px;
    border: 1.5px solid #FADBD8;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .eb-icon { font-size: 52px; margin-bottom: 16px; }
  .eb-title { font-size: 18px; font-weight: 800; color: #154360; margin-bottom: 8px; }
  .eb-sub { font-size: 13px; color: #5D8AA8; margin-bottom: 20px; max-width: 340px; line-height: 1.6; }
  .eb-detail {
    font-size: 11px; color: #E74C3C; background: #FDEDEC;
    border-radius: 8px; padding: 8px 14px; margin-bottom: 20px;
    font-family: monospace; max-width: 400px; word-break: break-word;
  }
  .eb-btn {
    padding: 10px 20px; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    color: #fff; font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.18s;
  }
  .eb-btn:hover { background: linear-gradient(135deg, #154360, #1F618D); }
`;

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <style>{styles}</style>
          <div className="eb-wrap">
            <div className="eb-icon">⚠️</div>
            <div className="eb-title">Bir xəta baş verdi</div>
            <div className="eb-sub">
              Bu səhifə yüklənərkən problem yarandı. Zəhmət olmasa yenidən cəhd edin.
            </div>
            {this.state.error && (
              <div className="eb-detail">{this.state.error.message}</div>
            )}
            <button className="eb-btn" onClick={() => this.setState({ hasError: false, error: null })}>
              🔄 Yenidən cəhd et
            </button>
          </div>
        </>
      );
    }
    return this.props.children;
  }
}