const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide the Reservation name"],
  },
  price: {
    type: Number,
    required: [true, "Please provide the price"],
  },
  time: {
    type: String,
    enum: {
      values: ["morning", "afternoon", "evening", "all_day"],
      message: "Time must be either morning, afternoon, evening, or all_day",
    },
    required: [true, "Please provide the reservation time"],
  },
  clock: {
    type: String,
    required: [true, "Please provide the reservation time"],
  },
  date: {
    type: Date,
    required: [true, "Please provide the reservation date"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
});

// Optional: To prevent duplicate reservations based on date and time
reservationSchema.index({ date: 1, time: 1 }, { unique: true });

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;
