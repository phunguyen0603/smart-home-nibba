import { useState } from "react";

const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "a@home.com",
    role: "user",
    is_active: true,
    created: "01/01/2026",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "b@home.com",
    role: "user",
    is_active: true,
    created: "05/02/2026",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "c@home.com",
    role: "user",
    is_active: false,
    created: "10/03/2026",
  },
  {
    id: 4,
    name: "Admin System",
    email: "admin@home.com",
    role: "admin",
    is_active: true,
    created: "01/01/2026",
  },
];

export default function Admin() {
  const [users, setUsers] = useState(mockUsers);

  const toggleActive = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u)),
    );
    // TODO: Bổ sung code gọi apiClient.patch('/admin/users/:id') khi nào backend có route
  };

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    // TODO: Bổ sung code gọi apiClient.delete
  };

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
           Quản lý Người dùng
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
           Hệ thống có {users.length} tài khoản thành viên
        </p>
      </div>

      {/* User Table Dashboard */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-blue-50/50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-black uppercase text-[11px] tracking-widest">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Người dùng</th>
                <th className="px-6 py-4 text-center">Quyền hạn</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Ngày tạo</th>
                <th className="px-6 py-4 text-center rounded-tr-2xl">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md transform group-hover:scale-110 transition-transform">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100">{u.name}</p>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold shadow-sm border
                      ${u.role === "admin" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30" : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600/50"}`}
                    >
                      {u.role === "admin" ? "Admin" : "Người dùng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold shadow-sm border flex items-center justify-center w-fit mx-auto gap-1.5
                      ${u.is_active ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {u.is_active ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 font-semibold">
                    {u.created}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => toggleActive(u.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all hover:-translate-y-0.5 shadow-sm
                          ${
                            u.is_active
                              ? "border-orange-300 dark:border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                              : "border-emerald-300 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                          }`}
                      >
                        {u.is_active ? "Khóa" : "Mở khóa"}
                      </button>
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 font-bold transition-all shadow-sm hover:-translate-y-0.5"
                        >
                          Xóa
                        </button>
                      ) : (
                        <span className="text-xs px-3 py-1.5 text-gray-400 italic">Không thể xóa</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
