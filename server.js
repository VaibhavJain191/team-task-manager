const express = require("express");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// DB connection
const connectDatabase = require("./config/db");
connectDatabase();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running",
  });
});

// Port
const APP_PORT = process.env.PORT || 5000;

app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
});