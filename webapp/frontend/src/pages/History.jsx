import { useState, useEffect } from "react";
import { socket, apiClient } from "../config";

const triggerLabel = {
  ir_sensor: "Cảm biến hồng ngoại",
  remote: "Remote",
  webapp: "Từ Webapp",
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

  const fetchLogs = async (typeTab, page = 1) => {
    try {
      setLoading(true);
      if (typeTab === "sensor") {
        const res = await apiClient.get(
          `/sensor/history?limit=${limit}&page=${page}`,
        );
        setSensorLogs(res.data?.data || []);
      } else if (typeTab === "door") {
        const res = await apiClient.get(`/door?limit=${limit}&page=${page}`);
        setDoorLogs(res.data?.data || []);
        setDoorPage(res.data?.pagination?.page || 1);
        setDoorPages(res.data?.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
      if (typeTab === "sensor") setSensorLogs([]);
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
    const handleSensorUpdate = () => {
      if (tab === "sensor") {
        fetchLogs("sensor", sensorPage);
      }
    };

    const handleDoorUpdate = () => {
      if (tab === "door") {
        setDoorPage(1);
        fetchLogs("door", 1);
      }
    };

    socket.on("sensor-data", handleSensorUpdate);
    socket.on("door-log-updated", handleDoorUpdate);

    return () => {
      socket.off("sensor-data", handleSensorUpdate);
      socket.off("door-log-updated", handleDoorUpdate);
    };
  }, [tab, sensorPage, doorPage]);

  const handlePageChange = (direction) => {
    if (tab === "sensor") {
      const newPage =
        direction === "next"
          ? Math.min(sensorPage + 1, sensorPages)
          : Math.max(sensorPage - 1, 1);
      setSensorPage(newPage);
      fetchLogs("sensor", newPage);
    } else {
      const newPage =
        direction === "next"
          ? Math.min(doorPage + 1, doorPages)
          : Math.max(doorPage - 1, 1);
      setDoorPage(newPage);
      fetchLogs("door", newPage);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
          Lịch sử
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
          Xem lịch sử hoạt động cửa và dữ liệu cảm biến môi trường
        </p>
      </div>

      {/* Elegant Toggle Tabs */}
      <div className="flex bg-gray-200/50 dark:bg-slate-800 p-1.5 rounded-xl w-fit shadow-inner border border-gray-300/30 dark:border-slate-700/50">
        <button
          onClick={() => setTab("door")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ease-out 
            ${tab === "door" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/30"}`}
        >
          🚪 Lịch sử mở cửa
        </button>
        <button
          onClick={() => setTab("sensor")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ease-out 
            ${tab === "sensor" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/30"}`}
        >
          📊 Lịch sử cảm biến
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6 gap-3 text-blue-500">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
          </span>
          <span className="font-bold text-sm">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Door Log Interface */}
      {tab === "door" && !loading && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-slate-700/50 divide-y divide-gray-100 dark:divide-slate-700/50 overflow-hidden">
            {doorLogs.length === 0 ? (
              <div className="px-6 py-10 flex flex-col items-center">
                <span className="text-4xl opacity-50 grayscale mb-3">🚪</span>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Chưa có lịch sử mở hoặc đóng cửa.
                </p>
              </div>
            ) : (
              doorLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div
                    className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-xl shadow-inner border 
                    ${log.action === "open" ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600" : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"}`}
                  >
                    <span>{log.action === "open" ? "🔓" : "🔒"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[15px] font-extrabold truncate ${log.action === "open" ? "text-blue-700 dark:text-blue-400" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      {log.action === "open" ? "Mở cửa" : "Đóng cửa"}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-gray-200/50 dark:bg-gray-900 border border-gray-300/50 dark:border-gray-600 uppercase text-[10px]">
                        {triggerLabel[log.trigger] || log.trigger}
                      </span>
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-900 px-2.5 py-1 rounded-md shadow-sm">
                      {new Date(log.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                      {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl backdrop-blur-md border border-gray-200 dark:border-slate-700 w-full md:w-fit mx-auto">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={doorPage === 1}
              className="px-5 py-2 text-sm font-bold bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg shadow disabled:opacity-30 disabled:shadow-none hover:bg-gray-50 dark:hover:bg-slate-600 transition-all border border-gray-100 dark:border-slate-600"
            >
              Trang trước
            </button>
            <span className="px-6 text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {doorPage} / {doorPages}
            </span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={doorPage === doorPages}
              className="px-5 py-2 text-sm font-bold bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg shadow disabled:opacity-30 disabled:shadow-none hover:bg-gray-50 dark:hover:bg-slate-600 transition-all border border-gray-100 dark:border-slate-600"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {/* Sensor Log Table View */}
      {tab === "sensor" && !loading && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-lg border border-gray-100 dark:border-slate-700/50 rounded-2xl overflow-hidden">
            {sensorLogs.length === 0 ? (
              <div className="px-6 py-10 flex flex-col items-center">
                <span className="text-4xl opacity-50 grayscale mb-3">📡</span>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Chưa có dữ liệu cảm biến nào được ghi nhận.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-blue-50/50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-black uppercase text-[11px] tracking-widest">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-2xl">Thời gian</th>
                      <th className="px-6 py-4 text-center">Nhiệt độ (🌡️)</th>
                      <th className="px-6 py-4 text-center">Độ ẩm (💧)</th>
                      <th className="px-6 py-4 text-center rounded-tr-2xl">
                        Ánh sáng (☀️)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                    {sensorLogs.map((log, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-100 font-bold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm inline-block">
                            {new Date(log.createdAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              },
                            )}
                          </span>
                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 ml-3">
                            {new Date(log.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="text-base font-black text-orange-600 dark:text-orange-400">
                            {log.temperature ?? "--"}°C
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="text-base font-black text-blue-600 dark:text-blue-400">
                            {log.humidity ?? "--"}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="text-base font-black text-yellow-600 dark:text-yellow-400">
                            {log.light ?? "--"} lux
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl backdrop-blur-md border border-gray-200 dark:border-slate-700 w-full md:w-fit mx-auto">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={sensorPage === 1}
              className="px-5 py-2 text-sm font-bold bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg shadow disabled:opacity-30 disabled:shadow-none hover:bg-gray-50 dark:hover:bg-slate-600 transition-all border border-gray-100 dark:border-slate-600"
            >
              Trang trước
            </button>
            <span className="px-6 text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {sensorPage} / {sensorPages}
            </span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={sensorPage === sensorPages}
              className="px-5 py-2 text-sm font-bold bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg shadow disabled:opacity-30 disabled:shadow-none hover:bg-gray-50 dark:hover:bg-slate-600 transition-all border border-gray-100 dark:border-slate-600"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
