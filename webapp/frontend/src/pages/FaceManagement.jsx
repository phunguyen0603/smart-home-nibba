import { useEffect, useState } from "react";
import { socket, apiClient } from "../config";

export default function FaceManagement() {
  const [activeTab, setActiveTab] = useState("unknown");
  const [unknownFaces, setUnknownFaces] = useState([]);
  const [selectedFace, setSelectedFace] = useState(null);
  const [personName, setPersonName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [knownFaces, setKnownFaces] = useState([]);

  const fetchKnownFaces = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await apiClient.get("/camera/known-faces", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("KNOWN FACE RESPONSE:", response.data);

      const faces = Array.isArray(response.data?.data?.images)
        ? response.data.data.images
        : [];

      setKnownFaces(faces);
    } catch (err) {
      console.error("Load known faces failed:", err);
    }
  };

  const fetchStrangerFaces = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await apiClient.get("/camera/stranger-faces", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("UNKNOWN FACE RESPONSE:", response.data);

      const faces = Array.isArray(response.data?.data?.images)
        ? response.data.data.images
        : [];

      setUnknownFaces(faces);
    } catch (err) {
      console.error("Load unknown faces failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrangerFaces();
    fetchKnownFaces();

    socket.on("camera:new-event", () => {
      fetchStrangerFaces();
      fetchKnownFaces();
    });

    return () => {
      socket.off("camera:new-event");
    };
  }, []);

  const handleAddKnownFace = async () => {
    if (!selectedFace || !personName.trim()) {
      if (knownFaces.length >= 10) {
        alert("Maximum 10 known faces. Please delete one first.");
        return;
      }
      alert("Please enter person name");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      await apiClient.post(
        "/camera/add-known-face",
        {
          imageUrl: selectedFace.url,
          publicId: "",
          name: personName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Known face added successfully");

      setPersonName("");
      setSelectedFace(null);
      setActiveTab("unknown");

      fetchStrangerFaces();
      fetchKnownFaces();
    } catch (err) {
      console.error("FULL ERROR:", err);
      console.error("ERROR RESPONSE:", err.response?.data);

      alert(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Add known face failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Face Management
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Quản lý người lạ và thêm người quen vào hệ thống AI.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("unknown")}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === "unknown"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Unknown Faces
        </button>

        <button
          onClick={() => setActiveTab("add")}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === "add"
              ? "bg-green-500 text-white shadow-lg"
              : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Add Known Face
        </button>

        <button
          onClick={() => setActiveTab("known")}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === "known"
              ? "bg-purple-500 text-white shadow-lg"
              : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Known Faces
        </button>
      </div>

      {activeTab === "known" && (
        <div>
          {knownFaces.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có người quen nào.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {knownFaces.map((face, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm"
                >
                  <img
                    src={face.url}
                    alt="Known Face"
                    className="w-full h-72 object-cover"
                  />

                  <div className="p-5">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Known Person
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");

                          await apiClient.delete("/camera/delete-known", {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Upload-Secret-Key": "test",
                            },
                            data: {
                              public_id: face.public_id,
                            },
                          });

                          fetchKnownFaces();
                        } catch (err) {
                          console.error(err);
                          alert("Delete known failed");
                        }
                      }}
                      className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold transition-all"
                    >
                      Delete
                    </button>
                    <p className="text-xs text-gray-400 mt-1">
                      {face.created_at
                        ? new Date(face.created_at).toLocaleString("vi-VN")
                        : "No timestamp"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "unknown" && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : unknownFaces.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center border border-gray-100 dark:border-slate-700">
              <div className="text-5xl mb-4">🛡️</div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Không có người lạ nào được phát hiện.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {unknownFaces.map((face, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={face.url}
                    alt="Unknown Face"
                    className="w-full h-72 object-cover"
                  />

                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Unknown Person
                      </p>

                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {face.created_at
                          ? new Date(face.created_at).toLocaleString("vi-VN")
                          : "No timestamp"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFace(face);
                        setActiveTab("add");
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-semibold transition-all"
                    >
                      Add As Known Face
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");

                          await apiClient.delete("/camera/delete-stranger", {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Upload-Secret-Key": "test",
                            },
                            data: {
                              public_id: face.public_id,
                            },
                          });

                          fetchStrangerFaces();
                        } catch (err) {
                          console.error(err);
                          alert("Delete stranger failed");
                        }
                      }}
                      className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "add" && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
          {selectedFace ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add Known Face
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Thêm khuôn mặt này vào danh sách người quen.
                </p>
              </div>

              <img
                src={selectedFace.url}
                alt="Selected Face"
                className="w-full rounded-2xl max-h-[500px] object-cover border border-gray-200 dark:border-slate-700"
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Person Name
                </label>

                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Ví dụ: Mom, Dad, Kiet..."
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={handleAddKnownFace}
                disabled={submitting || knownFaces.length >= 10}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all"
              >
                {submitting ? "Adding..." : "Add To Known Faces"}
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">👤</div>

              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Chọn một người lạ từ tab Unknown Faces trước.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
