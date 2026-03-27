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
    name: "Admin",
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
    // TODO: Gọi API PATCH /api/admin/users/:id
  };

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    // TODO: Gọi API DELETE /api/admin/users/:id
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản</h1>
        <p className="text-sm text-gray-500 mt-1">
          {users.length} tài khoản trong hệ thống
        </p>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Người dùng</th>
              <th className="px-4 py-3 text-center">Role</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Ngày tạo</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium
                    ${u.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium
                    ${u.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                  >
                    {u.is_active ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {u.created}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => toggleActive(u.id)}
                      className={`text-xs px-2 py-1 rounded-lg border transition-colors
                        ${
                          u.is_active
                            ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                            : "border-green-300 text-green-600 hover:bg-green-50"
                        }`}
                    >
                      {u.is_active ? "Khóa" : "Mở khóa"}
                    </button>
                    {u.role !== "admin" && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-xs px-2 py-1 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
