import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiClient } from "./config";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Control from "./pages/Control";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

// Layout với Sidebar
function AppLayout({ onLogout }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/control" element={<Control />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    // Xác thực token với backend lấy thông tin user
    apiClient.get("/auth/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => {
         localStorage.removeItem("token");
         setIsAuthenticated(false);
      })
      .finally(() => setIsChecking(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  }

  if (isChecking) {
    return <div className="h-screen flex items-center justify-center text-gray-500 font-medium">Đang kiểm tra đăng nhập...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route
          path="/*"
          element={isAuthenticated ? <AppLayout onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
