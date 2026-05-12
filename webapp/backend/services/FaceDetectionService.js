const axios = require("axios");

const BASE_URL = "https://nomnom788-face-detection.hf.space";

const FaceDetectionService = {
  getAllUnknownFaces: async () => {
    const response = await axios.get(`${BASE_URL}/get-all`, {
      headers: {
        "Detect-Secret-Key": process.env.DETECT_SECRET_KEY,
      },
    });

    return response.data;
  },

  addKnownFace: async (imageUrl, publicId, personName) => {
    try {
      console.log("ADDING FACE:");
      console.log("imageUrl:", imageUrl);
      console.log("publicId:", publicId);
      console.log("personName:", personName);
      console.log("SECRET:", process.env.DETECT_SECRET_KEY);

      const response = await axios.post(
        `${BASE_URL}/add`,
        {
          image_url: imageUrl,
          public_id: publicId,
          name: personName,
        },
        {
          headers: {
            "Upload-Secret-Key": process.env.DETECT_SECRET_KEY,
          },
        },
      );

      console.log("HF RESPONSE:", response.data);

      return response.data;
    } catch (err) {
      console.error("HF ERROR STATUS:", err.response?.status);
      console.error("HF ERROR DATA:", err.response?.data);
      console.error("HF ERROR MESSAGE:", err.message);

      throw err;
    }
  },
};

module.exports = FaceDetectionService;
