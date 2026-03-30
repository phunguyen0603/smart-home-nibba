import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:3000";

const socket = io(BACKEND_URL);

const triggerLabel = {
  ir_sensor: "Cảm biến hồng ngoại",
  remote: "Remote IR",
  webapp: "Webapp",
};

export default function History() {
  const [tab, setTab] = useState("door");

  const [doorLogs, setDoorLogs] = useState([]);
  const [doorPage, setDoorPage] = useState(1);
  const [doorPages, setDoorPages] = useState(1);

  const [sensorLogs, setSensorLogs] = useState([]);
  const [sensorPage, setSensorPage] = useState(1);
  const [sensorPages, setSensorPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const limit = 15;

  // Chuyển mảng sensor logs thành dạng {time, date, temperature, humidity, light}
  const formatSensorLogs = (logs) => {
    const grouped = {};

    logs.forEach((log) => {
      // Nhóm theo phút, ví dụ: "2026-03-30T09:04"
      const d = new Date(log.createdAt);
      const timeKey = d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

      if (!grouped[timeKey]) {
        grouped[timeKey] = {
          time: d.toLocaleTimeString("vi-VN"),
          date: d.toLocaleDateString("vi-VN"),
        };
      }

      if (log.type === "temperature") grouped[timeKey].temperature = log.value;
      if (log.type === "humidity") grouped[timeKey].humidity = log.value;
      if (log.type === "light") grouped[timeKey].light = log.value;
    });

    // Trả về mảng sorted theo thời gian giảm dần
    return Object.values(grouped).sort(
      (a, b) =>
        new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time),
    );
  };

  const fetchLogs = async (tab, page = 1) => {
    try {
      setLoading(true);

      if (tab === "sensor") {
        const res = await fetch(
          `${BACKEND_URL}/api/sensor/history?limit=${limit}&page=${page}`,
        );

        const data = await res.json();

        setSensorLogs(data.data || []);
      }

      if (tab === "door") {
        const res = await fetch(
          `${BACKEND_URL}/api/door?limit=${limit}&page=${page}`,
        );
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu door");
        const data = await res.json();
        setDoorLogs(data.data || []);
        setDoorPage(data.page || 1);
        setDoorPages(data.pages || 1);
      }
    } catch (err) {
      console.error(err);
      if (tab === "sensor") setSensorLogs([]);
      else setDoorLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "sensor") fetchLogs("sensor", sensorPage);
    else fetchLogs("door", doorPage);
  }, [tab]);

  useEffect(() => {
    socket.on("new-sensor", (data) => {
      console.log("Realtime sensor:", data);

      // cách đơn giản: reload lại
      fetchLogs(tab);
    });

    return () => {
      socket.off("new-sensor");
    };
  }, [tab]);

  const handlePageChange = (direction) => {
    if (tab === "sensor") {
      const newPage =
        direction === "next"
          ? Math.min(sensorPage + 1, sensorPages)
          : Math.max(sensorPage - 1, 1);
      fetchLogs("sensor", newPage);
    } else {
      const newPage =
        direction === "next"
          ? Math.min(doorPage + 1, doorPages)
          : Math.max(doorPage - 1, 1);
      fetchLogs("door", newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Lịch sử</h1>
        <p className="text-sm text-gray-500 mt-1">Log hoạt động của hệ thống</p>
      </div>

      {/* Tab */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("door")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "door" ? "bg-white text-blue-600 shadow" : "text-gray-500"
          }`}
        >
          🚪 Log cửa
        </button>
        <button
          onClick={() => setTab("sensor")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "sensor" ? "bg-white text-blue-600 shadow" : "text-gray-500"
          }`}
        >
          📊 Log sensor
        </button>
      </div>

      {loading && <p className="text-gray-400">Đang tải dữ liệu...</p>}

      {/* Door Log */}
      {tab === "door" && !loading && (
        <div>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            {doorLogs.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">Chưa có log cửa</p>
            ) : (
              doorLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <span className="text-xl">
                    {log.action === "open" ? "🔓" : "🔒"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {log.action === "open" ? "Mở cửa" : "Đóng cửa"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {triggerLabel[log.trigger]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-2">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={doorPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              {doorPage} / {doorPages}
            </span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={doorPage === doorPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Sensor Log */}
      {tab === "sensor" && !loading && (
        <div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {sensorLogs.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">
                Chưa có log sensor
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Thời gian</th>
                    <th className="px-4 py-3 text-center">🌡️ Nhiệt độ</th>
                    <th className="px-4 py-3 text-center">💧 Độ ẩm</th>
                    <th className="px-4 py-3 text-center">☀️ Ánh sáng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sensorLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">
                        <p>
                          {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center font-medium text-orange-600">
                        {log.temperature ?? "-"}°C
                      </td>

                      <td className="px-4 py-3 text-center font-medium text-blue-600">
                        {log.humidity ?? "-"}%
                      </td>

                      <td className="px-4 py-3 text-center font-medium text-yellow-600">
                        {log.light ?? "-"} lux
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-2">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={sensorPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              {sensorPage} / {sensorPages}
            </span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={sensorPage === sensorPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
