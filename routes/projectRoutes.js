const express = require("express");
const {
  createProject,
  addMemberToProject,
  joinProject,
  getProjects,
} = require("../controllers/projectController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createProject);
router.put("/:projectId/members", protect, addMemberToProject);
router.post("/join", protect, joinProject);
router.get("/", protect, getProjects);

module.exports = router;