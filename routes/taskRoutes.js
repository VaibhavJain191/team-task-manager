// routes/taskRoutes.js
const express = require("express");
const {
  createTask,
  assignTask,
  updateTaskStatus,
  getTasks,
  getDashboardData,
} = require("../controllers/taskController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, getDashboardData);

router.post("/", protect, createTask);
router.put("/:taskId/assign", protect, assignTask);
router.patch("/:taskId/status", protect, updateTaskStatus);
router.get("/", protect, getTasks);

module.exports = router;
