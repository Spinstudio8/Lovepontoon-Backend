const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Please provide the user name"],
  },
  date: {
    type: Date,
    required: [true, "Please provide a date"],
    default: function () {
      return moment().format("DD MMM, YYYY");
    },
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
  },
  reservationTime: {
    type: String,
    required: [true, "Please provide reservation time"],
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
