// routes/taskRoutes.js
const express = require("express");
const {
  createTask,
  assignTask,
  updateTaskStatus,
  getTasks,
} = require("../controllers/taskController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, createTask);
router.put("/:taskId/assign", protect, adminOnly, assignTask);
router.patch("/:taskId/status", protect, updateTaskStatus);
router.get("/", protect, getTasks);

module.exports = router;
