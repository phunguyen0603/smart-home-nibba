import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { socket, apiClient } from "../config";

const navItems = [
  { path: "/dashboard", label: "Tổng quan", icon: "📊" },
  { path: "/control", label: "Điều khiển", icon: "🎛️" },
  { path: "/alerts", label: "Cảnh báo", icon: "🔔" },
  { path: "/history", label: "Lịch sử", icon: "📋" },
  { path: "/face", label: "Face Management", icon: "👤" },
];

const adminItems = [
  { path: "/admin", label: "Quản lý Người dùng", icon: "👥" },
];

export default function Sidebar({ onLogout, isDarkMode, toggleTheme, user }) {
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [unreadFaces, setUnreadFaces] = useState(0);

  const fetchUnknownFacesCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await apiClient.get("/camera/stranger-faces", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const faces = Array.isArray(res.data?.data?.images)
        ? res.data.data.images
        : [];
      const seenIds = JSON.parse(
        localStorage.getItem("seenStrangerIds") || "[]",
      );
      const currentIds = faces.map((f) => f.public_id);
      const prunedSeenIds = seenIds.filter((id) => currentIds.includes(id));

      if (location.pathname === "/face") {
        localStorage.setItem("seenStrangerIds", JSON.stringify(currentIds));
        setUnreadFaces(0);
      } else {
        const unreadCount = currentIds.filter(
          (id) => !prunedSeenIds.includes(id),
        ).length;
        setUnreadFaces(unreadCount);
        localStorage.setItem("seenStrangerIds", JSON.stringify(prunedSeenIds));
      }
    } catch (err) {
      console.error(err);
      setUnreadFaces(0);
    }
  };

  const fetchUnread = () => {
    apiClient
      .get("/alert/unread")
      .then((res) => setUnread(res.data?.unread || 0))
      .catch(() => setUnread(0));
  };

  // useEffect(() => {
  //   fetchUnread(); // gọi sớm lúc mount

  //   const handleNewAlert = () => fetchUnread();
  //   const handleAlertRead = () => fetchUnread();
  //   const handleAlertDeleted = (deletedCount) => {
  //     setUnread((prev) => Math.max(prev - deletedCount, 0));
  //   };

  //   socket.on("new-alert", handleNewAlert);
  //   socket.on("alert-read", handleAlertRead);
  //   socket.on("alert-deleted", handleAlertDeleted);

  //   return () => {
  //     socket.off("new-alert", handleNewAlert);
  //     socket.off("alert-read", handleAlertRead);
  //     socket.off("alert-deleted", handleAlertDeleted);
  //   };
  // }, []);

  useEffect(() => {
    fetchUnread();
    fetchUnknownFacesCount();

    const handleNewAlert = () => fetchUnread();

    const handleCameraEvent = () => {
      fetchUnknownFacesCount();
    };

    socket.on("new-alert", handleNewAlert);
    socket.on("camera:new-event", handleCameraEvent);

    return () => {
      socket.off("new-alert", handleNewAlert);
      socket.off("camera:new-event", handleCameraEvent);
    };
  }, [location.pathname]);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`flex flex-col h-screen bg-gray-900 dark:bg-black text-white transition-all duration-300 relative z-20 shadow-2xl shadow-black/50 ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {!collapsed && (
          <span className="text-lg font-bold tracking-wide italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            🏠 SmartHome
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white text-xl ml-auto hover:bg-gray-800 p-1 rounded-lg transition-colors"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {user?.role !== "admin" &&
          navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 text-sm font-medium border border-transparent hover:-translate-y-0.5 hover:shadow-lg
              ${isActive ? "bg-blue-600/90 text-white shadow-blue-500/30 border-blue-500/50" : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-100 hover:border-gray-700"}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && (
                <span className="flex-1 tracking-wide">{item.label}</span>
              )}
              {!collapsed && item.path === "/alerts" && unread > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md shadow-red-500/40 animate-pulse">
                  {unread}
                </span>
              )}
              {!collapsed && item.path === "/face" && unreadFaces > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md animate-pulse">
                  {unreadFaces}
                </span>
              )}
              {collapsed && item.path === "/alerts" && unread > 0 && (
                <span className="absolute ml-6 -mt-4 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900 z-10">
                  {unread}
                </span>
              )}
              {collapsed && item.path === "/face" && unreadFaces > 0 && (
                <span className="absolute ml-6 -mt-4 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900 z-10">
                  {unreadFaces}
                </span>
              )}
            </NavLink>
          ))}

        {user?.role === "admin" &&
          adminItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 text-sm font-medium border border-transparent hover:-translate-y-0.5 hover:shadow-lg
              ${isActive ? "bg-indigo-600/90 text-white shadow-indigo-500/30 border-indigo-500/50" : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-100 hover:border-gray-700"}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && (
                <span className="tracking-wide">{item.label}</span>
              )}
            </NavLink>
          ))}
      </nav>

      {/* Utilities / Toggle Theme */}
      <div className="px-4 py-3">
        <button
          onClick={toggleTheme}
          title={isDarkMode ? "Giao diện Sáng" : "Giao diện Tối"}
          className={`flex items-center justify-center w-full py-2 rounded-xl border transition-all duration-300 gap-3 
            ${isDarkMode ? "border-gray-800 bg-gray-900 hover:bg-gray-800 text-yellow-300" : "border-gray-700 bg-gray-800 hover:bg-gray-700 text-blue-300"}`}
        >
          <span className="text-lg">{isDarkMode ? "🌙" : "🌞"}</span>
          {!collapsed && (
            <span className="text-xs font-semibold text-gray-300">
              {isDarkMode ? "Giao diện Tối" : "Giao diện Sáng"}
            </span>
          )}
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-5 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-3 relative group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/30 border border-blue-400/30">
            A
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-100 truncate">
                {user?.name || "User"}
              </p>
              <button
                onClick={onLogout}
                className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline transition-colors mt-0.5 truncate flex items-center gap-1"
              >
                <span>🚪</span> Đăng xuất
              </button>
            </div>
          )}
          {collapsed && (
            <div className="absolute left-full ml-4 hidden group-hover:flex items-center">
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 shadow-lg text-xs font-bold transition-transform hover:scale-105"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
