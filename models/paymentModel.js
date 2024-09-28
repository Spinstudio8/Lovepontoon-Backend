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
    enum: ["pending", "confirmed", "failed"],
    default: "pending",
  },
  datePayed: {
    type: Date,
    default: Date.now,
  },
  // expiresIn: Date,
  // paymentStatus: {
  //   type: String,
  //   enum: ["active", "expired"],
  // },
  paymentId: String,
  transactionId: String,
});

// Update expiresIn field when creating or updating a payment
// paymentSchema.pre("save", function (next) {
//   if (!this.expiresIn) {
//     // Set expiresIn to 30 days from the current date
//     this.expiresIn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
//   }
//   next();
// });

// Method to check if payment has expired
// paymentSchema.methods.hasExpired = function () {
//   return this.expiresIn && this.expiresIn < Date.now();
// };

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
