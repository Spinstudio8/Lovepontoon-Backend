const express = require("express");

const paymentController = require("../controller/paymentController");
const authController = require("../controller/authController");

const router = express.Router();

router.get(
  "/payments",
  // authController.protect,
  // authController.restrictTo("admin"),
  paymentController.getAllUsersPayments
);

router.get(
  "/singlePayments/:id",
  // authController.protect,
  // authController.restrictTo("admin"),
  paymentController.getSingleUserPayment
);

router.patch(
  "payments/:id", 
  // authController.protect,
  // authController.restrictTo("admin"),
  paymentController.deletePayment
);

// fluterwave
router.get("/paymentLink/:reservationId", paymentController.createPaymentLink);

router.get("/flutter-callback", paymentController.flutterCallback);

// router.post('/flutter-webhook', paymentController.flutterWebhook)

module.exports = router;
