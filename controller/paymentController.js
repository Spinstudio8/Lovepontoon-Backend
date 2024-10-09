const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const catchAsync = require("../utils/catchAsync");
const Reservation = require("../models/reservationModel");
const Payment = require("../models/paymentModel");
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");

exports.getAllUsersPayments = catchAsync(async (req, res, next) => {
  const { search, state, sort, page, limit, status, timeRange } = req.query;

  // Search and filtering
  const queryObj = {};

  // Search by name, email, etc.
  if (search) {
    queryObj.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by state if provided
  if (state) {
    queryObj.state = state;
  }

  // Filter by status, defaulting to 'booked'
  queryObj.status = status || "booked";

  // Time range filter
  const now = new Date();
  if (timeRange === "last-24hrs") {
    queryObj.datePayed = {
      $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    };
  } else if (timeRange === "last-7days") {
    queryObj.datePayed = {
      $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    };
  } else if (timeRange === "last-30days") {
    queryObj.datePayed = {
      $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
  } else if (timeRange === "last-12months") {
    queryObj.datePayed = {
      $gte: new Date(now.setFullYear(now.getFullYear() - 1)),
    };
  }

  // Query to get payments based on filters
  let result = Payment.find(queryObj);

  // Sorting
  if (sort === "latest") {
    result = result.sort("-datePayed"); // Newest first
  } else if (sort === "oldest") {
    result = result.sort("datePayed"); // Oldest first
  } else if (sort === "a-z") {
    result = result.sort("fname"); // Sort by fname A-Z
  } else if (sort === "z-a") {
    result = result.sort("-fname"); // Sort by fname Z-A
  }

  // Pagination
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  result = result.skip(skip).limit(limitNumber);

  // Execute the query
  const payments = await result;

  // Get total payments count based on query
  const totalPayments = await Payment.countDocuments(queryObj);

  // Calculate total amount for booked payments
  const totalAmount = payments.reduce(
    (acc, payment) => acc + payment.amount,
    0
  );

  // Get the total number of "booked" payments
  const totalBooked = await Payment.countDocuments({
    ...queryObj,
    status: "booked",
  });

  // Calculate the total number of each bookType with status "booked"
  const bookedTypesCount = {
    MorningPoolExperience: await Payment.countDocuments({
      ...queryObj,
      bookType: "Morning Pool Experience",
    }),
    AfternoonPoolExperience: await Payment.countDocuments({
      ...queryObj,
      bookType: "Afternoon Pool Experience",
    }),
    NightPoolExperience: await Payment.countDocuments({
      ...queryObj,
      bookType: "Night Pool Experience",
    }),
    AllDayPoolExperience: await Payment.countDocuments({
      ...queryObj,
      bookType: "All-Day Pool Experience",
    }),
  };

  // Number of pages for pagination
  const numOfPages = Math.ceil(totalPayments / limitNumber);

  // Send response
  res.status(200).json({
    status: "success",
    results: payments.length,
    totalPayments,
    totalAmount,
    totalBooked,
    bookedTypesCount,
    numOfPages,
    data: {
      payments,
    },
  });
});

exports.getSingleUserPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError("No payments found with this id", 404));
  }

  res.status(200).json({ status: "success", data: payment });
});

exports.deletePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findByIdAndUpdate(
    req.params.id, // The ID of the payment to update
    { status: "refunded" }, // Set the status to 'refunded'
    { new: true, runValidators: true } // Options: return the updated document and run schema validators
  );

  if (!payment) {
    return next(new AppError("No payment found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { payment }, // Optional: return the updated payment object if needed
  });
});

// Flutterwave Payment

const FLUTTERWAVE_URLS = {
  createPayment: "https://api.flutterwave.com/v3/payments",
};

const baseAxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
  },
});

const createUniqueReference = () => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `txn_${timestamp}_${randomSuffix}`;
};

const tx_ref = createUniqueReference();
// console.log(tx_ref);

exports.createPaymentLink = catchAsync(async (req, res, next) => {
  try {
    // Fetch Reservation details from the database based on Reservation ID
    const reservation = await Reservation.findById(req.params.reservationId);

    const booking = await Booking.find().select("reservationTime date -_id");

    // Check if Reservation exists
    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found",
      });
    }

    const user = {
      name: req.body.name,
      email: req.body.email,
    };

    const transactionFeePercentage = 1.4 / 100; // 1.4%
    const transactionAmount = reservation.price;
    const noOfGuests = req.body.noOfGuests;
    const transactionFee = transactionAmount * transactionFeePercentage;
    const totalAmount = (transactionAmount + transactionFee) * noOfGuests;

    const transaction = {
      id: `txn_${uuidv4()}`,
      amount: totalAmount,
      currency: "NGN",
      description: reservation.name,
    };

    const product = {
      id: reservation._id,
      name: reservation.name,
      // description: reservation.subDetail,
      price: reservation.price,
      currency: "NGN",
      image: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png",
    };

    const customer = {
      // id: req.user.id,
      email: req.body.email,
      phone_number: req.body.phoneNumber,
      name: req.body.name,
    };

    const paymentUrl = await baseAxiosInstance.post(
      FLUTTERWAVE_URLS.createPayment,
      {
        tx_ref: tx_ref,
        paymentId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        redirect_url: "http://localhost:5000/api/v1/payment/flutter-callback",
        meta: {
          userId: user.id,
          paymentId: transaction.id,
          product,
        },
        customer: customer,
        customizations: {
          title: "Love-Pontoon Payment",
          logo: "https://iili.io/Jv7HBpf.jpg",
        },
      }
    );

    // console.log(paymentUrl);
    // const tx_ref = paymentUrl.data.tx_ref;
    // console.log(tx_ref);

    // logic to check if that reservation has been booked
    const bookingDates = booking.map((item) => item.date.toISOString());
    const bookingTime = booking.map((item) => item.reservationTime);
    const reservationDate = new Date(req.body.date).toISOString();

    if (
      bookingDates.includes(reservationDate) &&
      bookingTime.includes(reservation.name)
    ) {
      return next(
        new AppError(
          "This reservation has been booked, please select a different time",
          400
        )
      );
    }

    const formattedDatePayed = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const newPayment = await Payment.create({
      name: req.body.name,
      email: req.body.email,
      date: req.body.date,
      age: req.body.age,
      gender: req.body.gender,
      noOfGuests: req.body.noOfGuests,
      phoneNumber: req.body.phoneNumber,
      reservation: req.params.reservationId,
      amount: totalAmount,
      status: "pending",
      bookType: reservation.name,
      datePayed: formattedDatePayed,
      paymentId: transaction.id,
      transactionId: tx_ref,
    });
    // console.log("response", paymentUrl);
    // console.log("================ Finish Payment Url =====================");

    return res.status(200).json({
      message: "success",
      data: paymentUrl.data,
    });
    // return res.redirect(paymentUrl.data.link);
  } catch (error) {
    console.log("error", error);
  }
});

async function verifyTransaction(id) {
  try {
    // console.log(`===== verifying transaction started id: ${id}====`);
    const response = await baseAxiosInstance.get(
      `https://api.flutterwave.com/v3/transactions/${id}/verify`
    );

    // console.log("response", response.data);

    // console.log(`===== verifying transaction finished id: ${id}====`);
    // console.log(response.data.data.meta.transactionId);

    return response.data;
  } catch (error) {
    console.log("error", error);
  }
}

exports.flutterCallback = catchAsync(async (req, res) => {
  try {
    // Verify the transaction using the transaction_id from Flutterwave
    const result = await verifyTransaction(req.query.transaction_id);

    // Find the payment by transactionId
    const payment = await Payment.findOneAndUpdate(
      { transactionId: req.query.tx_ref },
      {
        status: "booked",
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Fetch the reservation details from the database using the reservation ID from the payment
    const reservation = await Reservation.findById(payment.reservation);
    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found",
      });
    }

    // Create a new booking using the information from the payment and reservation
    const newBooking = await Booking.create({
      userName: payment.name,
      date: payment.date, // Ensure date is in ISO format if needed
      price: payment.amount,
      reservationTime: reservation.name,
    });

    return res.status(200).json({
      message: "success",
      data: {
        payment: result,
        booking: newBooking,
      },
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
});

// exports.flutterWebhook = catchAsync(async (req, res) => {
//   try {
//     console.log("================ webhook request start ================");
//     console.log("request headers", req.headers);
//     console.log("request body", req.body);
//     console.log("request query", req.query);

//     await verifyTransaction(req.body.data.id);

//     return res.status(200).json("success");
//   } catch (error) {
//     console.log("error", error);
//   }
// });
