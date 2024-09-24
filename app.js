require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const compression = require("compression");

const userRouter = require("./routes/userRoutes");
const reservationRouter = require("./routes/reservationRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const globalErrorHandler = require("./controller/errorController");
const AppError = require("./utils/appError");

const app = express();
app.use(bodyParser.json());

// Development logging
app.use(morgan("dev"));

app.use(cors());
app.use(express.static("./public"));
app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Love Pontoon");
});
app.use("/api/v1/user", userRouter);
app.use("/api/v1/subscription", reservationRouter);
app.use("/api/v1/payment", paymentRouter);

// Handling unhandled routes
// For all http methods
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

// Server
module.exports = app;
