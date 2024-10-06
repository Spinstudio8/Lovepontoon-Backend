const express = require("express");

const reservationController = require("../controller/reservationController");

const authController = require("../controller/authController");

const router = express.Router();

// router.use(authController.protect, authController.restrictTo("admin"));

router.post("/createReservation", reservationController.createReservation);

router.get("/", reservationController.getReservation);

router.get("/:id", reservationController.getReservationById);

router.patch("/updateReservation/:id", reservationController.updateReservation);

module.exports = router;
