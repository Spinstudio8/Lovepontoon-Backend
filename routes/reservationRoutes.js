const express = require("express");

const reservationController = require("../controller/reservationController");

const authController = require("../controller/authController");

const router = express.Router();

router.get("/", reservationController.getReservation);

router.get("/:id", reservationController.getReservationById);

router.use(authController.protect, authController.restrictTo("admin"));

router.post("/createReservation", reservationController.createReservation);


router.patch("/updateReservation/:id", reservationController.updateReservation);

module.exports = router;
