// controllers/taskController.js
const Task = require("../models/Task");
const Project = require("../models/Project");

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate } = req.body;

    if (!title || !project) {
      return res.status(400).json({
        message: "Task title and project are required",
      });
    }

    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (assignedTo && !existingProject.members.some((member) => member.toString() === assignedTo)) {
      return res.status(400).json({
        message: "Assigned user must be a project member",
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      dueDate,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};

const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User id is required",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    const User = require("../models/User");

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!project.members.some((member) => member.toString() === userId)) {
      return res.status(400).json({
        message: "User must be a project member",
      });
    }

    task.assignedTo = userId;
    await task.save();

    res.status(200).json({
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign task",
      error: error.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status || !["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).json({
        message: "Valid status is required",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the assigned user can update this task",
      });
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task status",
      error: error.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const filter = {
      assignedTo: req.user._id,
    };

    if (req.query.project) {
      filter.project = req.query.project;
    }

    const tasks = await Task.find(filter)
      .populate("project", "title description")
      .populate("assignedTo", "name email role");

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get tasks",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  assignTask,
  updateTaskStatus,
  getTasks,
};
