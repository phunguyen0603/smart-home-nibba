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
      let verifiedToken = res.data?.token || res.data?.data?.token;

      if (verifiedToken) {
        localStorage.setItem("token", verifiedToken);
        if (onLogin) onLogin(res.data.user || res.data.data?.user);
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
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-900 transition-colors duration-500 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

      <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 transition-all duration-300">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105 hover:rotate-3">
             <span className="text-3xl text-white filter drop-shadow">🏠</span>
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">SmartHome</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">Giám sát tổ ấm của bạn từ xa</p>
        </div>

        {errorMsg && <div className="mb-6 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 px-4 py-3 rounded-xl shadow-sm text-center animate-fade-in">{errorMsg}</div>}
        {successMsg && <div className="mb-6 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3 rounded-xl shadow-sm text-center animate-fade-in">{successMsg}</div>}

        {/* Tab */}
        {tab !== "forgot" && (
          <div className="flex bg-gray-100/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-1 mb-8 shadow-inner border border-gray-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => switchTab("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ease-out ${tab === "login" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => switchTab("register")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ease-out ${tab === "register" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-[1.02]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Form Login */}
        {tab === "login" && (
          <form className="space-y-5 animate-fade-in" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5 ml-1">Email</label>
              <div className="relative group">
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="owner@home.com" required className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm group-hover:border-blue-400/50" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                 <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Mật khẩu</label>
                 <button type="button" onClick={() => { switchTab("forgot"); setForgotSent(false); }} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline transition-colors">Quên mật khẩu?</button>
              </div>
              <div className="relative group">
                <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="••••••••" required className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm group-hover:border-blue-400/50" />
              </div>
            </div>
            <div className="pt-2">
               <button type="submit" disabled={loading} className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 group">
                 {loading ? "Đang xử lý..." : "Đăng nhập"}
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-xl blur-sm mix-blend-overlay"></div>
               </button>
            </div>
          </form>
        )}

        {/* Form Register */}
        {tab === "register" && (
          <form className="space-y-4 animate-fade-in" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5 ml-1">Họ và tên</label>
              <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Gia đình anh Tuấn..." required className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5 ml-1">Email</label>
              <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="owner@home.com" required className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5 ml-1">Mật khẩu</label>
              <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="••••••••" required className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5 ml-1">Nhập lại Mật khẩu</label>
              <input name="confirm" value={formData.confirm} onChange={handleInputChange} type="password" placeholder="••••••••" required className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
            </div>
            <div className="pt-3">
               <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                 {loading ? "Đang xử lý..." : "Đăng ký"}
               </button>
            </div>
          </form>
        )}

        {/* Form Forgot Password */}
        {tab === "forgot" && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <div className="text-3xl mb-3 drop-shadow">🔑</div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Quên mật khẩu</h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">Mật khẩu mới sẽ được gửi riêng qua email của bạn</p>
            </div>
            {!forgotSent ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1.5 ml-1">Email liên kết</label>
                  <input type="email" placeholder="owner@home.com" className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" />
                </div>
                <button type="button" onClick={() => setForgotSent(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5">
                  Gửi link khôi phục
                </button>
              </>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-5 py-6 text-emerald-700 dark:text-emerald-400 text-center shadow-inner">
                <div className="text-2xl mb-2">✅</div>
                <p className="font-semibold text-sm">Đã gửi link khôi phục!</p>
                <p className="text-xs mt-1 opacity-80">Vui lòng kiểm tra email của bạn.</p>
              </div>
            )}
            <button type="button" onClick={() => switchTab("login")} className="w-full mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-center transition-colors">
               ← Quay trở lại Đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
