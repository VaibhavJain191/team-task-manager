const express = require("express");
const dotenv = require("dotenv");

// Load environment variables from the .env file.
dotenv.config();

const app = express();

// Allow the server to read JSON data sent in request bodies.
app.use(express.json());

// Simple test route to confirm the API is running.
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running",
  });
});

// Use the PORT value from .env, or fall back to 5000 for local development.
const APP_PORT = process.env.PORT || 5000;

app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
  console.log("Backend server started successfully");
});
