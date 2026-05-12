const CameraEvent = require("../database/models/CameraEventSchema");

const CameraService = {
  createEvent: async (imageUrl) => {
    const event = await CameraEvent.create({
      imageUrl,
    });

    return event;
  },

  getHistory: async (limit = 50, page = 1) => {
    const events = await CameraEvent.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return events;
  },

  getEventById: async (id) => {
    const event = await CameraEvent.findById(id);

    return event;
  },

  deleteEvent: async (id) => {
    const event = await CameraEvent.findByIdAndDelete(id);

    return event;
  },
};

module.exports = CameraService;
