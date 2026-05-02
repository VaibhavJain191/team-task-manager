const Project = require("../models/Project");
const User = require("../models/User");

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Project title is required",
      });
    }

   let project = await Project.create({
     title,
     description,
     createdBy: req.user._id,
     members: [req.user._id],
    });


    project = await project.populate("createdBy", "name email role");
    project = await project.populate("members", "name email role");

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

const addMemberToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID or email is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only project creator can add members",
      });
    }

    let user;
    if (userId.includes("@")) {
      user = await User.findOne({ email: userId });
    } else {
      user = await User.findById(userId);
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (project.members.some((member) => member.toString() === user._id.toString())) {
      return res.status(400).json({
        message: "User is already a project member",
      });
    }

    project.members.push(user._id);
    await project.save();

    await project.populate("members", "name email role");

    res.status(200).json({
      message: "Member added successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add member",
      error: error.message,
    });
  }
};

const joinProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        message: "Project ID is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(400).json({
        message: "Already a member",
      });
    }

    project.members.push(req.user._id);
    await project.save();

    await project.populate("createdBy", "name email role");
    await project.populate("members", "name email role");

    res.status(200).json({
      message: "Joined project successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to join project",
      error: error.message,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    })
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    res.status(200).json({
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get projects",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  addMemberToProject,
  joinProject,
  getProjects,
};