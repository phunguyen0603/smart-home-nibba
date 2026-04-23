import { useState, useEffect } from "react";
import { socket, apiClient } from "../config";

const typeConfig = {
  temperature: { icon: "🌡️", label: "Nhiệt độ", color: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30" },
  human: { icon: "👤", label: "Người", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30" },
  stranger: { icon: "⚠️", label: "Người lạ", color: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30 animate-pulse" },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    apiClient.get("/alert?limit=20")
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          setAlerts(res.data.data);
          setSelectedIds([]);
        } else if (Array.isArray(res.data)) {
          setAlerts(res.data);
          setSelectedIds([]);
        } else {
           setAlerts([]);
        }
      }).catch(() => setAlerts([]));
  }, []);

  useEffect(() => {
    socket.on("new-alert", (alert) => {
      setAlerts((prev) => {
        if (prev.find((a) => a._id === alert._id)) return prev;
        return [alert, ...prev].slice(0, 50);
      });
    });
    return () => socket.off("new-alert");
  }, []);

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

  const filtered = filter === "all" ? normalizedAlerts : normalizedAlerts.filter((a) => a.type === filter);
  const unreadCount = normalizedAlerts.filter((a) => !a.is_read).length;

  const markRead = async (id) => {
    try {
      await apiClient.put(`/alert/${id}/read`);
      setAlerts((prev) => prev.map((a) => ((a._id || a.id) === id ? { ...a, is_read: true } : a)));
      socket.emit("alert-read");
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await apiClient.put("/alert/read-all");
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      socket.emit("alert-read");
    } catch (err) { console.error(err); }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa các cảnh báo này?")) return;
    try {
      await Promise.all(selectedIds.map((id) => apiClient.delete(`/alert/${id}`)));
      setAlerts((prev) => prev.filter((a) => !selectedIds.includes(a._id || a.id)));
      socket.emit("alert-deleted", selectedIds.length);
      setSelectedIds([]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">Danh sách cảnh báo</h1>
           <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
             {unreadCount > 0 ? (
               <><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>Có {unreadCount} cảnh báo chưa đọc</>
             ) : (
               <><span className="text-emerald-500">✅</span> Đã đọc tất cả cảnh báo</>
             )}
           </p>
        </div>
        <div className="flex gap-4">
           {unreadCount > 0 && (
             <button onClick={markAllRead} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors">
               Đánh dấu đã đọc tất cả
             </button>
           )}
           {selectedIds.length > 0 && (
             <button onClick={deleteSelected} className="px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-all flex items-center gap-2">
               <span>🗑️</span> Xóa ({selectedIds.length})
             </button>
           )}
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex gap-3">
        {["all", "temperature", "human", "stranger"].map((f) => (
          <button key={f} onClick={() => { setFilter(f); setSelectedIds([]); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out border shadow-sm
              ${filter === f ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 shadow-blue-500/30 transform scale-105" 
                             : "bg-white/70 dark:bg-slate-800/70 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 backdrop-blur-md"}`}
          >
            {f === "all" ? "🔭 Tất cả" : f === "temperature" ? "🌡️ Nhiệt độ" : f === "stranger" ? "⚠️ Người lạ" : "👤 Người"}
          </button>
        ))}
      </div>

      {/* List content */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700/50">
         {filtered.length === 0 ? (
           <div className="py-12 flex flex-col items-center">
             <span className="text-5xl opacity-50 grayscale mb-4">📭</span>
             <p className="text-gray-500 dark:text-gray-400 font-medium">Không có cảnh báo nào trong danh mục này.</p>
           </div>
         ) : (
           filtered.map((a) => {
             const config = typeConfig[a.type] || { icon: "🔔", label: "Khác", color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200" };
             return (
               <div key={a.id} className={`group flex items-start gap-4 px-6 py-5 transition-all duration-300 cursor-pointer ${!a.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-gray-50 dark:hover:bg-slate-700/30"}`}>
                 {/* Selection Box */}
                 <div className="pt-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelect(a.id)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-slate-700 focus:ring-offset-slate-800 cursor-pointer transition-all" />
                 </div>
                 
                 {/* Content Wrapper */}
                 <div onClick={() => { setSelected(a); markRead(a.id); }} className="flex 1 items-start gap-5 min-w-0 w-full pl-2">
                    <div className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${config.color}`}>{config.label}</span>
                         {!a.is_read && <span className="bg-gradient-to-r from-rose-500 to-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm animate-pulse">Mới</span>}
                      </div>
                      <p className="text-[15px] font-bold text-gray-800 dark:text-gray-100 mt-1.5 line-clamp-2 pr-4 leading-snug">{a.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                         <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><span>🕒</span> {a.time} - {a.date}</span>
                         {a.image_url && <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800 font-mono">📸 Có ảnh đính kèm</span>}
                      </div>
                    </div>
                 </div>
               </div>
             )
           })
         )}
      </div>

      {/* Modern Modal Viewer */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4" onClick={() => setSelected(null)}>
           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg border border-white/10 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                   <div className="text-3xl bg-gray-100 dark:bg-slate-700 p-3 rounded-2xl">{typeConfig[selected.type]?.icon || "🔔"}</div>
                   <div>
                     <h2 className="text-xl font-black text-gray-900 dark:text-white">Chi tiết cảnh báo</h2>
                     <p className="text-xs font-semibold uppercase text-gray-500">{selected.date} • {selected.time}</p>
                   </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-slate-600 transition-colors">✕</button>
              </div>
              <div className="bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-700 p-4 rounded-xl mb-6">
                 <p className="text-[15px] font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{selected.message}</p>
              </div>
              {selected.image_url && (
                <div className="border-4 border-gray-100 dark:border-slate-700 p-1 rounded-2xl shadow-inner">
                  <img src={selected.image_url} alt="Security Camera" className="rounded-xl w-full object-cover" />
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
