import { useState } from "react";
import * as FaIcons from "react-icons/fa";

const initialDevices = [
  { id: "led", label: "Đèn LED", icon: <FaIcons.FaLightbulb size={24} color="f6d73b" />, status: true },
  { id: "fan", label: "Quạt", icon: <FaIcons.FaFan size={24} color="#3b82f6" />, status: false },
  { id: "door", label: "Cửa chính", icon: "🚪", status: false },
  { id: "relay", label: "Relay", icon: "⚡", status: true },
];

export default function Control() {
  const [devices, setDevices] = useState(initialDevices);

  const toggle = (id) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: !d.status } : d)),
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
          Điều khiển
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1.5">
          Điều khiển thiết bị điện trong nhà
        </p>
      </div>

      {/* Notice */}
      <div className="bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-medium text-blue-700 dark:text-blue-300">
          <span className="text-xl">💡</span>
          <p>Lệnh điều khiển sẽ được gửi qua nền tảng Adafruit IO và thực thi trên Yolo:Bit.</p>
        </div>
      </div>

      {/* Device Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {devices.map((d) => (
          <div
            key={d.id}
            className="group relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/20"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 opacity-50 rounded-2xl pointer-events-none"></div>
             
             <div className="flex items-center gap-5 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-colors duration-300 ${d.status ? "bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-500/20 dark:to-indigo-500/10" : "bg-gray-100 dark:bg-gray-700/50"}`}>
                {d.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{d.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2.5 w-2.5">
                    {d.status && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${d.status ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
                  </span>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${d.status ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`}>
                    {d.status ? "Đang bật" : "Đang tắt"}
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Toggle Switch */}
            <button
               onClick={() => toggle(d.id)}
               className={`relative shrink-0 w-16 h-8 rounded-full border-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/30 z-10
                 ${d.status ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500 shadow-lg shadow-blue-500/40" : "bg-gray-200 border-gray-200 dark:bg-slate-700 dark:border-slate-700"}`}
            >
               <span 
                 className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-bounce 
                 ${d.status ? "left-[34px]" : "left-0.5"}`} 
               />
            </button>
          </div>
        ))}
      </div>

      {/* Global Controls */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={() => setDevices((prev) => prev.map((d) => ({ ...d, status: true })))}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Bật tất cả
        </button>
        <button
          onClick={() => setDevices((prev) => prev.map((d) => ({ ...d, status: false })))}
          className="flex-1 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Tắt tất cả
        </button>
      </div>
    </div>
  );
}
