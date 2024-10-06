const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, "Please provide a date"],
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  age: {
    type: String,
    required: [true, "Please provide your age"],
  },
  gender: {
    type: String,
    required: [true, "Please provide your gender"],
  },
  noOfGuests: {
    type: Number,
    required: [true, "Please provide the number of guests"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide your phone number"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  amount: {
    type: Number,
    required: [true, "Please provide an amount"],
  },
  status: {
    type: String,
    enum: ["pending", "booked", "failed", "refunded"],
    default: "pending",
  },
  datePayed: {
    type: Date,
    default: Date.now,
  },
  bookType: {
    type: String,
    required: true,
  },
  paymentId: String,
  transactionId: String,
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
