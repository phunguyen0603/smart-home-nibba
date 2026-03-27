import { useState } from "react";

export default function Login() {
  const [tab, setTab] = useState("login"); // "login" | "register" | "forgot"
  const [forgotSent, setForgotSent] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏠</div>
          <h1 className="text-2xl font-bold text-gray-800">SmartHome</h1>
          <p className="text-sm text-gray-500 mt-1">
            Hệ thống giám sát nhà thông minh
          </p>
        </div>

        {/* Tab — ẩn khi ở màn forgot */}
        {tab !== "forgot" && (
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors
                ${tab === "login" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors
                ${tab === "register" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Form Login */}
        {tab === "login" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="owner@home.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-right mt-1">
                <button
                  onClick={() => {
                    setTab("forgot");
                    setForgotSent(false);
                  }}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Đăng nhập
            </button>
          </div>
        )}

        {/* Form Register */}
        {tab === "register" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="owner@home.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Đăng ký
            </button>
          </div>
        )}

        {/* Form Forgot Password */}
        {tab === "forgot" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">🔑</div>
              <h2 className="text-lg font-semibold text-gray-800">
                Quên mật khẩu
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Nhập email để nhận link đặt lại mật khẩu
              </p>
            </div>

            {!forgotSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="owner@home.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setForgotSent(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Gửi link đặt lại
                </button>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 text-center">
                ✅ Đã gửi link đặt lại mật khẩu về email của bạn!
              </div>
            )}

            <button
              onClick={() => setTab("login")}
              className="w-full text-sm text-gray-500 hover:text-gray-700 text-center"
            >
              ← Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
