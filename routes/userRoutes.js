const express = require("express");

const authController = require("../controller/authController");
const userController = require("../controller/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.get(
  "/me",

  userController.getMe,
  userController.getUser
);

router.get("/getAllUsers", authController.restrictTo("admin"),userController.getAllUsers)

module.exports = router;
