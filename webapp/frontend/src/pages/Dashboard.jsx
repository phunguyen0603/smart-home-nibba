import { useState, useEffect } from "react";
import { socket, apiClient } from "../config";

export default function Dashboard() {
  const [sensorState, setSensorState] = useState({
    temperature: { label: "Nhiệt độ", value: "--", icon: "🌡️", status: "normal", note: "Đang tải...", unit: "°C" },
    humidity: { label: "Độ ẩm", value: "--", icon: "💧", status: "normal", note: "Đang tải...", unit: "%" },
    light: { label: "Ánh sáng", value: "--", icon: "☀️", status: "normal", note: "Đang tải...", unit: "lux" },
  });

  const [deviceState, setDeviceState] = useState({
    led: { label: "Đèn LED", icon: "💡", status: false },
    fan: { label: "Quạt", icon: "🌀", status: false },
    servo: { label: "Cửa chính", icon: "🚪", status: false },
    relay: { label: "Relay", icon: "⚡", status: false },
  });

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [sensorRes, alertRes] = await Promise.all([
          apiClient.get("/sensor/latest").catch(() => null),
          apiClient.get("/alert?limit=5").catch(() => null)
        ]);

        if (sensorRes && sensorRes.data) {
          const { temperature, humidity, light } = sensorRes.data;
          setSensorState((prev) => ({
            ...prev,
            ...(temperature && {
              temperature: {
                ...prev.temperature,
                value: temperature.value,
                unit: temperature.unit || "°C",
                status: temperature.value > 35 ? "warning" : "normal",
                note: temperature.value > 35 ? "Cảnh báo cao" : "Bình thường",
              }
            }),
            ...(humidity && {
              humidity: {
                ...prev.humidity,
                value: humidity.value,
                unit: humidity.unit || "%",
                status: humidity.value > 80 ? "warning" : "normal",
                note: humidity.value > 80 ? "Độ ẩm cao" : "Bình thường",
              }
            }),
            ...(light && {
              light: {
                ...prev.light,
                value: light.value,
                unit: light.unit || "lux",
                status: "normal",
                note: "Bình thường",
              }
            })
          }));
        }

        if (alertRes && alertRes.data && alertRes.data.alerts) {
          setRecentAlerts(alertRes.data.alerts);
        }
      } catch (error) {
        console.error("Lỗi nạp dữ liệu ban đầu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    socket.on("sensor-data", (data) => {
      setSensorState((prev) => {
        if (!prev[data.type]) return prev;
        const next = { ...prev };
        let statusStr = "normal";
        let noteStr = "Bình thường";

        if (data.type === "temperature" && Number(data.value) > 35) { statusStr = "warning"; noteStr = "Vượt ngưỡng!"; }
        if (data.type === "humidity" && Number(data.value) > 80) { statusStr = "warning"; noteStr = "Vượt ngưỡng!"; }

        next[data.type] = {
          ...next[data.type],
          value: data.value,
          unit: data.unit || next[data.type].unit,
          status: statusStr,
          note: noteStr
        };
        return next;
      });
    });

    socket.on("device-status", (data) => {
      setDeviceState((prev) => {
        if (!prev[data.device]) return prev;
        const next = { ...prev };
        next[data.device] = {
           ...next[data.device],
           status: String(data.value) === "1"
        };
        return next;
      });
    });

    socket.on("new-alert", (alert) => {
      setRecentAlerts((prev) => [alert, ...prev].slice(0, 5));
    });

    return () => {
      socket.off("sensor-data");
      socket.off("device-status");
      socket.off("new-alert");
    };
  }, []);

  const sensorDataArray = Object.values(sensorState);
  const devicesArray = Object.entries(deviceState).map(([id, info]) => ({ id, ...info }));

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">Tổng quan</h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
           </span>
           Đang cập nhật thời gian thực qua socket
        </p>
      </div>

      {/* Sensor Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Chỉ số môi trường</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {sensorDataArray.map((s, idx) => (
            <div key={idx} className={`relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:shadow-black/20 ${s.status === "warning" ? "border-orange-400/50 dark:border-orange-500/50 shadow-orange-500/10" : "border-gray-200 dark:border-gray-700/50"}`}>
              {/* Background Glow */}
              <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-colors duration-500 ${s.status === "warning" ? "bg-orange-500" : "bg-blue-500"}`}></div>
              
              <div className="relative flex items-center justify-between">
                <span className="text-3xl filter drop-shadow-md">{s.icon}</span>
                <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold shadow-sm ${s.status === "warning" ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 animate-pulse" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"}`}>
                  {s.status === "warning" ? "Cảnh báo" : "Bình thường"}
                </span>
              </div>
              
              <div className="mt-6">
                 {loading ? (
                    <div className="h-10 bg-gray-200 dark:bg-gray-700/50 rounded-lg w-2/3 animate-pulse" />
                 ) : (
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight drop-shadow-sm">
                      {s.value}<span className="text-2xl text-gray-500 dark:text-gray-400 ml-1">{s.value !== "--" ? s.unit : ""}</span>
                    </p>
                 )}
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">{s.label}</p>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Device Status */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Trạng thái thiết bị</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {devicesArray.map((d) => (
            <div key={d.id} className="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-gray-100 dark:border-gray-700/50 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-500/30">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 opacity-50 rounded-2xl -z-10 transition-opacity"></div>
              <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110 drop-shadow-md">{d.icon}</div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{d.label}</p>
              <div className="mt-4 flex justify-center">
                 <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm transition-colors duration-300 ${d.status ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30" : "bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400 border border-gray-200 dark:border-gray-600/50"}`}>
                   <span className={`w-1.5 h-1.5 rounded-full ${d.status ? "bg-blue-500" : "bg-gray-400"}`}></span> 
                   {d.status ? "Đang bật" : "Đang tắt"}
                 </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pl-1">
           <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Cảnh báo gần đây</h2>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 ${i === 0 ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${a.type === "stranger" ? "bg-rose-100 dark:bg-rose-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}>
                  {a.type === "temperature" || a.type === "humidity" ? "🌡️" : "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate pr-4">
                    {a.message}
                  </p>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                     {new Date(a.createdAt || new Date()).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit'})}
                  </p>
                </div>
                {i === 0 && <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full whitespace-nowrap">Mới nhất</span>}
              </div>
            ))
          ) : (
            <div className="px-5 py-8 flex flex-col items-center text-center">
              <span className="text-4xl filter grayscale opacity-50 mb-3">🛡️</span>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Không có cảnh báo nào gần đây.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
