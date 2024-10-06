const Reservation = require("../models/reservationModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getReservation = catchAsync(async (req, res, next) => {
  const reservation = await Reservation.find();

  res.status(200).json({
    status: "success",
    data: {
      reservation,
    },
  });
});

exports.getReservationById = catchAsync(async (req, res, next) => {
  const reservation = await Reservation.findById(req.params.id);

  res.status(200).json({
    status: "success",
    data: {
      reservation,
    },
  });
});

exports.createReservation = catchAsync(async (req, res, next) => {
  const { name, price, time, photo } = req.body;

  const newReservation = await Reservation.create({
    name,
    price,
    time,
    photo,
  });

  res.status(201).json({
    status: "success",
    data: {
      reservation: newReservation,
    },
  });
});

exports.updateReservation = catchAsync(async (req, res, next) => {
  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!reservation) {
    return next(new AppError("No reservation found with that ID", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      reservation,
    },
  });
});
