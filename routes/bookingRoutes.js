const express = require("express");

const bookingController = require("../controller/bookingController");
const authController = require("../controller/authController");

const router = express.Router();

// router.use(authController.protect);

router.get("/", bookingController.getBooking);

router.get("/morning", bookingController.getTotalMorningBookings);
router.get("/afternoon", bookingController.getTotalMorningBookings);
router.get("/night", bookingController.getTotalMorningBookings);
router.get("/all-day", bookingController.getTotalMorningBookings);

router.delete("/:id", bookingController.deleteBooking);

module.exports = router;
