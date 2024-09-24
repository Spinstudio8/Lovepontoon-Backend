const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./app");

const DB = process.env.MONGO_URI;

mongoose.connect(DB).then(() => {
  console.log(":: Database  Connector Established ::");
});

// Set up server
const port = process.env.PORT ||  5000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


