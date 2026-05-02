// routes/projectRoutes.js
const express = require("express");
const {
  createProject,
  addMemberToProject,
  getProjects,
} = require("../controllers/projectController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, adminOnly, createProject);
router.put("/:projectId/members", protect, adminOnly, addMemberToProject);
router.get("/", protect, getProjects);

module.exports = router;
