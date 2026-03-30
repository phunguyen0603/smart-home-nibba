import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:3000";
const socket = io(BACKEND_URL);

const typeConfig = {
  temperature: {
    icon: "🌡️",
    label: "Nhiệt độ",
    color: "bg-orange-100 text-orange-600",
  },
  human: {
    icon: "👤",
    label: "Người",
    color: "bg-blue-100 text-blue-600",
  },
  stranger: {
    icon: "⚠️",
    label: "Người lạ",
    color: "bg-red-100 text-red-600",
  },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // ✅ Fetch API
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/alert?limit=20`)
      .then((res) => res.json())
      .then((resData) => {
        if (Array.isArray(resData.data)) {
          setAlerts(resData.data);
          setSelectedIds([]); // ✅ thêm dòng này
        } else {
          setAlerts([]);
        }
      })
      .catch(() => setAlerts([]));
  }, []);

  // ✅ Realtime socket
  useEffect(() => {
    socket.on("new-alert", (alert) => {
      setAlerts((prev) => {
        // tránh duplicate
        if (prev.find((a) => a._id === alert._id)) return prev;

        return [alert, ...prev].slice(0, 50); // limit 50
      });
    });

    return () => {
      socket.off("new-alert");
    };
  }, []);

  // ✅ Normalize data
  const normalizedAlerts = alerts.map((a) => {
    const d = new Date(a.createdAt || Date.now());

    return {
      id: a._id || a.id,
      type: a.type || "temperature",
      message: a.message || "Cảnh báo",
      time: d.toLocaleTimeString("vi-VN"),
      date: d.toLocaleDateString("vi-VN"),
      is_read: a.is_read ?? false,
      image_url: a.image_url || null,
    };
  });

  const filtered =
    filter === "all"
      ? normalizedAlerts
      : normalizedAlerts.filter((a) => a.type === filter);

  const unreadCount = normalizedAlerts.filter((a) => !a.is_read).length;

  const markRead = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/alert/${id}/read`, {
        method: "PUT",
      });

      setAlerts((prev) =>
        prev.map((a) => ((a._id || a.id) === id ? { ...a, is_read: true } : a)),
      );
      socket.emit("alert-read");
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/alert/read-all`, {
        method: "PUT",
      });

      // update UI sau khi backend OK
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      socket.emit("alert-read");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm("Bạn có chắc muốn xóa các cảnh báo đã chọn?")) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${BACKEND_URL}/api/alert/${id}`, { method: "DELETE" }),
        ),
      );

      // update UI Alerts
      setAlerts((prev) =>
        prev.filter((a) => !selectedIds.includes(a._id || a.id)),
      );

      socket.emit("alert-deleted", selectedIds.length); // gửi số lượng alert đã xóa

      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cảnh báo</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} cảnh báo chưa đọc`
              : "Tất cả đã đọc"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}

        {selectedIds.length > 0 && (
          <button
            onClick={deleteSelected}
            className="text-sm text-red-600 hover:underline"
          >
            Xóa ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "temperature", "human"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setSelectedIds([]); // ✅ reset
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
          >
            {f === "all"
              ? "Tất cả"
              : f === "temperature"
                ? "🌡️ Nhiệt độ"
                : "👤 Người"}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-3">
            Chưa có cảnh báo {filter !== "all" && filter}
          </p>
        ) : (
          filtered.map((a) => {
            const config = typeConfig[a.type] || {
              icon: "⚠️",
              label: "Khác",
              color: "bg-gray-100 text-gray-600",
            };

            return (
              <div
                key={a.id}
                className={`flex items-start gap-4 px-4 py-4 hover:bg-gray-50 transition-colors
    ${!a.is_read ? "bg-blue-50" : ""}`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.includes(a.id)}
                  onChange={() => toggleSelect(a.id)}
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Click content */}
                <div
                  onClick={() => {
                    setSelected(a);
                    markRead(a.id);
                  }}
                  className="flex items-start gap-4 flex-1 cursor-pointer"
                >
                  <span className="text-2xl mt-0.5">{config.icon}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}
                      >
                        {config.label}
                      </span>

                      {!a.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>

                    <p className="text-sm text-gray-800 mt-1">{a.message}</p>

                    <p className="text-xs text-gray-400 mt-1">
                      {a.date} — {a.time}
                    </p>
                  </div>

                  {a.image_url && (
                    <span className="text-xs text-blue-500">📷 Có ảnh</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">Chi tiết cảnh báo</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>

            <p className="text-sm">{selected.message}</p>

            <p className="text-xs text-gray-400 mt-2">
              {selected.date} — {selected.time}
            </p>

            {selected.image_url && (
              <img
                src={selected.image_url}
                alt="Camera"
                className="mt-3 rounded"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
