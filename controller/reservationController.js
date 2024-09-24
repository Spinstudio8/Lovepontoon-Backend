const Reservation = require("../models/reservationModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getReservation = catchAsync(async (req, res, next) => {
  const { date } = req.query;
  let filter = {};

  if (date) {
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);
    filter.date = reservationDate;
  }

  const reservations = await Reservation.find(filter);

  res.status(200).json({
    status: "success",
    results: reservations.length,
    data: {
      reservations,
    },
  });
});



exports.createReservation = catchAsync(async (req, res, next) => {
  const { name, price, time, photo, date, clock } = req.body;

  if (!date) {
    return next(new AppError("Please provide the reservation date", 400));
  }

  // Convert date to start of the day for consistency
  const reservationDate = new Date(date);
  reservationDate.setHours(0, 0, 0, 0);

  // Fetch existing reservations for the given date
  const existingReservations = await Reservation.find({
    date: reservationDate,
  });

  // Check for conflicts based on the new reservation's time
  if (time === "all_day") {
    if (existingReservations.length > 0) {
      return next(
        new AppError(
          "Cannot book an all-day reservation because other reservations exist for this date.",
          400
        )
      );
    }
  } else {
    // Check if an all-day reservation already exists
    const allDayExists = existingReservations.some(
      (resv) => resv.time === "all_day"
    );
    if (allDayExists) {
      return next(
        new AppError(
          "Cannot book a specific time reservation because an all-day reservation exists for this date.",
          400
        )
      );
    }

    // Check if any specific time reservation already exists
    const specificTimeExists = existingReservations.some(
      (resv) => resv.time === time
    );

    // Additionally, if you want to allow only one specific time reservation per day,
    // regardless of which time slot it is, uncomment the following lines:
    /*
    if (existingReservations.length > 0) {
      return next(
        new AppError(
          "Cannot book a specific time reservation because another reservation exists for this date.",
          400
        )
      );
    }
    */

    // If you want to allow only one reservation per day regardless of time,
    // you can use the above check instead of checking for specific time existence.

    if (specificTimeExists) {
      return next(
        new AppError(
          `Cannot book a ${time} reservation because it has already been booked for this date.`,
          400
        )
      );
    }
  }

  // If all checks pass, create the reservation
  const newReservation = await Reservation.create({
    name,
    price,
    time,
    photo,
    date: reservationDate,
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
