const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const catchAsync = require("../utils/catchAsync");
const Reservation = require("../models/reservationModel");
const Payment = require("../models/paymentModel");
const AppError = require("../utils/appError");

exports.getAllUsersPayments = catchAsync(async (req, res, next) => {
  const payments = await Payment.find();
  for (const payment of payments) {
    // we have to make an instance to check the ticket has expired
    // // Step 3: Check if the payment has expired using the hasExpired instance method
    // if (payment.hasExpired()) {
    //   // Step 4: Update the status of expired payments
    //   payment.status = "expired";
    //   // Save the updated payment
    //   await payment.save();
    // }
  }

  res.status(200).json({
    status: "success",
    results: payments.length,
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

exports.getAllPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.find({ user: req.user.id });

  res
    .status(200)
    .json({ status: "success", results: payment.length, data: payment });
});

exports.getSinglePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  res.status(200).json({
    status: "success",
    data: payment,
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
      // email: "test@example.com",
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
      datePayed: Date.now(),
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
    // console.log("request headers", req.headers);
    // console.log("request body", req.body);
    // console.log("request query", req.query);

    const result = await verifyTransaction(req.query.transaction_id);
    // console.log(req.query.paymentId);

    await Payment.findOneAndUpdate(
      { transactionId: req.query.tx_ref },
      {
        status: "confirmed",
        paymentStatus: "active",
      }
    );

    return res.status(200).json({
      message: "success",
      data: result,
    });
  } catch (error) {
    console.log("error", error);
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
