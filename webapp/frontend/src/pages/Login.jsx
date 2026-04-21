import { useState } from "react";
import { apiClient } from "../config";

export default function Login({ onLogin }) {
  const [tab, setTab] = useState("login"); // "login" | "register" | "forgot"
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email: formData.email, password: formData.password });
      
      // Định dạng tuỳ thuộc vào backend, thường trả token ở res.data.token hoặc res.data.data.token
      let verifiedToken = res.data?.token || res.data?.data?.token;

      if (verifiedToken) {
        localStorage.setItem("token", verifiedToken);
        if (onLogin) onLogin();
      } else {
        setErrorMsg("Không trích xuất được token đăng nhập. Vui lòng thử lại.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (formData.password !== formData.confirm) {
        setErrorMsg("Mật khẩu xác nhận không khớp");
        return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/register", { name: formData.name, email: formData.email, password: formData.password });
      setSuccessMsg("Đăng ký thành công! Vui lòng đăng nhập.");
      setTab("login");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (newTab) => {
     setTab(newTab);
     setErrorMsg("");
     setSuccessMsg("");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏠</div>
          <h1 className="text-2xl font-bold text-gray-800">SmartHome</h1>
          <p className="text-sm text-gray-500 mt-1">Hệ thống giám sát nhà thông minh</p>
        </div>

        {errorMsg && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 text-center rounded">{errorMsg}</div>}
        {successMsg && <div className="mb-4 text-sm text-green-600 bg-green-50 p-2 text-center rounded">{successMsg}</div>}

        {/* Tab */}
        {tab !== "forgot" && (
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => switchTab("login")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === "login" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => switchTab("register")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === "register" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Form Login */}
        {tab === "login" && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="owner@home.com" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="••••••••" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="text-right mt-1">
                <button type="button" onClick={() => { switchTab("forgot"); setForgotSent(false); }} className="text-xs text-blue-500 hover:underline">Quên mật khẩu?</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
        )}

        {/* Form Register */}
        {tab === "register" && (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Nguyễn Văn A" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="owner@home.com" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="••••••••" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input name="confirm" value={formData.confirm} onChange={handleInputChange} type="password" placeholder="••••••••" required className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>
        )}

        {/* Form Forgot Password */}
        {tab === "forgot" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">🔑</div>
              <h2 className="text-lg font-semibold text-gray-800">Quên mật khẩu</h2>
              <p className="text-sm text-gray-500 mt-1">Nhập email để nhận link đặt lại</p>
            </div>
            {!forgotSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" placeholder="owner@home.com" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="button" onClick={() => setForgotSent(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Gửi link đặt lại
                </button>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 text-center">
                ✅ Đã gửi link đặt lại mật khẩu về email của bạn!
              </div>
            )}
            <button type="button" onClick={() => switchTab("login")} className="w-full text-sm text-gray-500 hover:text-gray-700 text-center">
              ← Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
