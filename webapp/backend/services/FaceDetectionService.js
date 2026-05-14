const axios = require("axios");

const BASE_URL = "https://nomnom788-face-detection.hf.space";

const detectHeaders = {
  "Detect-Secret-Key": process.env.DETECT_SECRET_KEY,
};

const uploadHeaders = {
  "Upload-Secret-Key": process.env.DETECT_SECRET_KEY,
};

const FaceDetectionService = {
  // =========================================
  // STRANGER FACES
  // =========================================
  getAllStrangerFaces: async () => {
    const response = await axios.get(`${BASE_URL}/get-all/stranger`, {
      headers: detectHeaders,
    });

    return response.data;
  },

  // =========================================
  // KNOWN FACES
  // =========================================
  getAllKnownFaces: async () => {
    const response = await axios.get(`${BASE_URL}/get-all/known-face`, {
      headers: detectHeaders,
    });

    return response.data;
  },

  // =========================================
  // ADD KNOWN FACE
  // =========================================
  addKnownFace: async (imageUrl) => {
    const response = await axios.post(
      `${BASE_URL}/add`,
      {
        image_url: imageUrl,
      },
      {
        headers: uploadHeaders,
      },
    );

    return response.data;
  },

  // =========================================
  // DELETE STRANGER
  // =========================================
  deleteStrangerFace: async (publicId) => {
    const response = await axios.delete(`${BASE_URL}/delete`, {
      headers: uploadHeaders,
      data: {
        public_id: publicId,
      },
    });

    return response.data;
  },

  // =========================================
  // DELETE KNOWN
  // =========================================
  deleteKnownFace: async (publicId) => {
    const response = await axios.delete(`${BASE_URL}/delete-known`, {
      headers: uploadHeaders,
      data: {
        public_id: publicId,
      },
    });

    return response.data;
  },

  // =========================================
  // RECOGNIZE
  // =========================================
  recognizeFaces: async () => {
    const response = await axios.get(`${BASE_URL}/recognize`, {
      headers: detectHeaders,
    });

    return response.data;
  },
};

module.exports = FaceDetectionService;
