import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiClient, socket } from "./config";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Control from "./pages/Control";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import FaceManagement from "./pages/FaceManagement";

// Layout với Sidebar
function AppLayout({ onLogout, isDarkMode, toggleTheme, user }) {
  const isAdmin = user?.role === "admin";
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar
        onLogout={onLogout}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        user={user}
      />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/control" element={<Control />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/history" element={<History />} />

              {/* FACE MANAGEMENT */}
              <Route path="/face" element={<FaceManagement />} />

              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // QUẢN LÝ DARK MODE MẠNH MẼ (lưu localstorage và can thiệp body class)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Ưu tiên load từ local, nếu không có check system preference
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialMode = storedTheme === "dark" || (!storedTheme && prefersDark);

    setIsDarkMode(initialMode);
    if (initialMode) document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    // Xác thực token với backend lấy thông tin user
    apiClient
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => setIsChecking(false));
  }, []);

  useEffect(() => {
    if (user && user.id) {
      const lockEvent = `user-locked-${user.id}`;
      const deleteEvent = `user-deleted-${user.id}`;

      const handleKick = () => {
        alert(
          "Tài khoản của bạn đã bị khóa hoặc xóa bởi Admin. Phiên làm việc đã kết thúc.",
        );
        handleLogout();
      };

      socket.on(lockEvent, handleKick);
      socket.on(deleteEvent, handleKick);

      return () => {
        socket.off(lockEvent, handleKick);
        socket.off(deleteEvent, handleKick);
      };
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 text-gray-500 font-medium">
        Đang tải cấu hình an ninh...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              user?.role === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/dashboard" />
              )
            ) : (
              <Login
                onLogin={(u) => {
                  setUser(u);
                  setIsAuthenticated(true);
                }}
              />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppLayout
                onLogout={handleLogout}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                user={user}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
