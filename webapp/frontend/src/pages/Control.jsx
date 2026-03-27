import { useState } from "react";
import * as FaIcons from "react-icons/fa";

const initialDevices = [
  {
    id: "led",
    label: "Đèn LED",
    icon: <FaIcons.FaLightbulb size={24} color="f6d73b" />,
    status: true,
    type: "toggle",
  },
  {
    id: "fan",
    label: "Quạt",
    icon: <FaIcons.FaFan size={24} color="#3b82f6" />,
    status: false,
    type: "toggle",
  },
  { id: "door", label: "Cửa chính", icon: "🚪", status: false, type: "toggle" },
  { id: "relay", label: "Relay", icon: "⚡", status: true, type: "toggle" },
];

export default function Control() {
  const [devices, setDevices] = useState(initialDevices);

  const toggle = (id) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: !d.status } : d)),
    );
    // TODO: Gọi API gửi lệnh lên Adafruit IO
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Điều khiển thiết bị
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Điều khiển từ xa qua webapp
        </p>
      </div>

      {/* Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        💡 Lệnh điều khiển sẽ được gửi qua Adafruit IO đến Yolo:Bit
      </div>

      {/* Device Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {devices.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${d.status ? "bg-blue-100" : "bg-gray-100"}`}
              >
                {d.icon}
              </div>
              <div>
                <p className="font-medium text-gray-800">{d.label}</p>
                <p
                  className={`text-xs mt-0.5 ${d.status ? "text-green-600" : "text-gray-400"}`}
                >
                  {d.status ? "Đang bật" : "Đang tắt"}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => toggle(d.id)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none
                ${d.status ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-[4px] left-[4px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
  ${d.status ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* All On/Off */}
      <div className="flex gap-3">
        <button
          onClick={() =>
            setDevices((prev) => prev.map((d) => ({ ...d, status: true })))
          }
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Bật tất cả
        </button>
        <button
          onClick={() =>
            setDevices((prev) => prev.map((d) => ({ ...d, status: false })))
          }
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Tắt tất cả
        </button>
      </div>
    </div>
  );
}
