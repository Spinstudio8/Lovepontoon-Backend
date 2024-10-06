const express = require("express");

const bookingController = require("../controller/bookingController");
const authController = require("../controller/authController");

const router = express.Router();

// router.use(authController.protect);

router.get("/", bookingController.getBooking);

router.delete("/:id", bookingController.deleteBooking);

module.exports = router;
