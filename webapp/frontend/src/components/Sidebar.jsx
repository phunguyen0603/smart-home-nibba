import { NavLink } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/control", label: "Control", icon: "🎛️" },
  { path: "/alerts", label: "Alerts", icon: "🔔", badge: 3 },
  { path: "/history", label: "History", icon: "📋" },
];

const adminItems = [{ path: "/admin", label: "Manage Users", icon: "👥" }];

export default function Sidebar() {
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
            {!collapsed && item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {item.badge}
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
