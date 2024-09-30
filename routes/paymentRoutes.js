const express = require("express");

const paymentController = require("../controller/paymentController");
const authController = require("../controller/authController");

const router = express.Router();

// router.use(authController.protect);

router.get(
  "/payments",
  // authController.restrictTo("admin"),
  paymentController.getAllUsersPayments
);

router.get(
  "/singlePayments/:id",
  // authController.restrictTo("admin"),
  paymentController.getSingleUserPayment
);

router.get("/totalRevenue", paymentController.getTotalRevenue);

// router.use(authController.restrictTo("user"));

router.get("/userPayment", paymentController.getAllPayment);

router.get("/singleUserPayment/:id", paymentController.getSinglePayment);

// fluterwave
router.get("/paymentLink/:reservationId", paymentController.createPaymentLink);

router.get("/flutter-callback", paymentController.flutterCallback);

// router.post('/flutter-webhook', paymentController.flutterWebhook)

module.exports = router;
