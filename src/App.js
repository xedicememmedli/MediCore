import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

// ─── LAZY LOADING ────────────────────────────────────────────────────────────
const LoginPage          = lazy(() => import("./pages/LoginPage"));
const RegisterPage       = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage  = lazy(() => import("./pages/ResetPasswordPage"));
const NotFoundPage       = lazy(() => import("./pages/NotFoundPage"));
const AdminLayout        = lazy(() => import("./pages/admin/AdminLayout"));
const DoctorLayout       = lazy(() => import("./pages/doctor/DoctorLayout"));
const PatientLayout      = lazy(() => import("./pages/patient/PatientLayout"));
const CourierLayout      = lazy(() => import("./pages/courier/CourierLayout"));

// ─── LOADING FALLBACK ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:"100vh", flexDirection:"column", gap:16,
      background:"#EAF2F8", fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      <div style={{
        width:52, height:52, borderRadius:14,
        background:"linear-gradient(135deg,#1F618D,#2E86C1)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:26, boxShadow:"0 8px 24px rgba(31,97,141,0.25)",
        animation:"mcPulse 1.5s ease-in-out infinite",
      }}>🏥</div>
      <div style={{fontSize:15, fontWeight:700, color:"#1F618D"}}>MediCore yüklənir...</div>
      <div style={{display:"flex", gap:6}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{
            width:8, height:8, borderRadius:"50%",
            background:"#1F618D", opacity:0.4,
            animation:`mcDot 1.2s ease-in-out ${i*0.2}s infinite`,
          }}/>
        ))}
      </div>
      <style>{`
        @keyframes mcPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes mcDot{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-6px);opacity:1}}
      `}</style>
    </div>
  );
}

const isAuthenticated = () => !!localStorage.getItem("token");
const getRole = () => localStorage.getItem("role") || "";

// ─── AXIOS İNTERCEPTOR ───────────────────────────────────────────────────────
function AxiosInterceptor() {
  const navigate = useNavigate();
  useEffect(() => {
    const id = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login?expired=1", { replace: true });
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, [navigate]);
  return null;
}

function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (role) {
    const userRole = getRole().toLowerCase();
    if (userRole !== role.toLowerCase()) return <Navigate to={`/${userRole}`} replace />;
  }
  return children;
}

function RootRedirect() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const role = getRole().toLowerCase();
  switch (role) {
    case "admin":   return <Navigate to="/admin"   replace />;
    case "doctor":  return <Navigate to="/doctor"  replace />;
    case "patient": return <Navigate to="/patient" replace />;
    case "courier": return <Navigate to="/courier" replace />;
    default:        return <Navigate to="/login"   replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AxiosInterceptor />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/"                element={<RootRedirect />} />
          <Route path="/admin/*"   element={<ProtectedRoute role="Admin">  <AdminLayout />  </ProtectedRoute>} />
          <Route path="/doctor/*"  element={<ProtectedRoute role="Doctor"> <DoctorLayout /> </ProtectedRoute>} />
          <Route path="/patient/*" element={<ProtectedRoute role="Patient"><PatientLayout /></ProtectedRoute>} />
          <Route path="/courier/*" element={<ProtectedRoute role="Courier"><CourierLayout /></ProtectedRoute>} />
          <Route path="*"          element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}