import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/control", label: "Control", icon: "🎛️" },
  { path: "/alerts", label: "Alerts", icon: "🔔" },
  { path: "/history", label: "History", icon: "📋" },
];

const adminItems = [{ path: "/admin", label: "Manage Users", icon: "👥" }];

export default function Sidebar() {
  const [unread, setUnread] = useState(0);

  const fetchUnread = () => {
    fetch("http://localhost:3000/api/alert/unread")
      .then((res) => res.json())
      .then((data) => setUnread(data.unread || 0))
      .catch(() => setUnread(0));
  };

  useEffect(() => {
    const handleNewAlert = () => fetchUnread();
    const handleAlertRead = () => fetchUnread();

    const handleAlertDeleted = (deletedCount) => {
      setUnread((prev) => Math.max(prev - deletedCount, 0)); // trừ trực tiếp
    };

    socket.on("new-alert", handleNewAlert);
    socket.on("alert-read", handleAlertRead);
    socket.on("alert-deleted", handleAlertDeleted);

    return () => {
      socket.off("new-alert", handleNewAlert);
      socket.off("alert-read", handleAlertRead);
      socket.off("alert-deleted", handleAlertDeleted);
    };
  }, []);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
        {!collapsed && (
          <span className="text-lg font-bold tracking-wide">🏠 SmartHome</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white text-xl ml-auto"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
              ${isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && item.path === "/alerts" && unread > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unread}
              </span>
            )}
            {collapsed && item.badge && (
              <span className="absolute ml-6 -mt-4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="border-t border-gray-700 my-3" />

        {adminItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
              ${isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
            K
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Chủ nhà</p>
              <p className="text-xs text-gray-400 truncate">owner@home.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
