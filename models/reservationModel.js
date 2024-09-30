const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: {
      values: [
        "Morning Pool Experience",
        "Afternoon Pool Experience",
        "Night Pool Experience",
        "All-Day Pool Experience",
      ],
      message:
        "Name must be either Morning Pool Experience, Afternoon Pool Experience, Night Pool Experience, All-Day Pool Experience ",
    },
    required: [true, "Please provide the Reservation name"],
  },
  price: {
    type: Number,
    required: [true, "Please provide the price"],
  },
  time: {
    type: String,
    required: [true, "Please provide the reservation time"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
});

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;
