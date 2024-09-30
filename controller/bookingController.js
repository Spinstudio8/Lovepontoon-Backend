const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.find();

  res.status(200).json({
    status: "success",
    totalBookings: booking.length,
    data: {
      booking,
    },
  });
});

exports.deleteBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);

  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.getTotalMorningBookings = catchAsync(async (req, res, next) => {
  // Query to count the number of users who are part of the diaspora
  const morningBookingCount = await Booking.countDocuments({
    reservationTime: "Morning Pool Experience",
  });

  res.status(200).json({
    status: "success",
    totalBookings: morningBookingCount,
  });
});

exports.getTotalAfternoonBookings = catchAsync(async (req, res, next) => {
  // Query to count the number of users who are part of the diaspora
  const afternoonBookingCount = await Booking.countDocuments({
    reservationTime: "Afternoon Pool Experience",
  });

  res.status(200).json({
    status: "success",
    totalBookings: afternoonBookingCount,
  });
});

exports.getTotalNightBookings = catchAsync(async (req, res, next) => {
  // Query to count the number of users who are part of the diaspora
  const nightBookingCount = await Booking.countDocuments({
    reservationTime: "Night Pool Experience",
  });

  res.status(200).json({
    status: "success",
    totalBookings: nightBookingCount,
  });
});

exports.getTotalAllDayBookings = catchAsync(async (req, res, next) => {
  // Query to count the number of users who are part of the diaspora
  const alldayBookingCount = await Booking.countDocuments({
    reservationTime: "All-Day Pool Experience",
  });

  res.status(200).json({
    status: "success",
    totalBookings: alldayBookingCount,
  });
});
