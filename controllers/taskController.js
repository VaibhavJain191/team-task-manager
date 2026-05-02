const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

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

    if (existingProject.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the project creator can create tasks",
      });
    }

    if (
      assignedTo &&
      !existingProject.members.some(
        (member) => member.toString() === assignedTo
      )
    ) {
      return res.status(400).json({
        message: "Assigned user must be a project member",
      });
    }

    const taskData = {
      title,
      description,
      project,
      dueDate,
    };

    if (assignedTo) {
      taskData.assignedTo = assignedTo;
    }

    const task = await Task.create(taskData);

    await task.populate("project", "title");
    await task.populate("assignedTo", "name email");

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

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only project creator can assign tasks",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      !project.members.some(
        (member) => member.toString() === userId
      )
    ) {
      return res.status(400).json({
        message: "User must be a project member",
      });
    }

    if (
      task.assignedTo &&
      task.assignedTo.toString() === userId
    ) {
      return res.status(400).json({
        message: "Task already assigned to this user",
      });
    }

    task.assignedTo = userId;
    await task.save();

    await task.populate("project", "title");
    await task.populate("assignedTo", "name email");

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

    const project = await Project.findById(task.project);
    const isProjectCreator = project && project.createdBy.toString() === req.user._id.toString();
    const isAssignedUser = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isProjectCreator && !isAssignedUser) {
      return res.status(403).json({
        message: "Only the assigned user or project creator can update this task",
      });
    }

    task.status = status;
    await task.save();

    await task.populate("project", "title");
    await task.populate("assignedTo", "name email");

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
    const userProjects = await Project.find({ members: req.user._id }).select("_id");
    const projectIds = userProjects.map((p) => p._id);

    const filter = {
      project: { $in: projectIds },
    };

    if (req.query.project) {
      filter.project = req.query.project;
    }

    const tasks = await Task.find(filter)
      .populate("project", "title description createdBy")
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

const getDashboardData = async (req, res) => {
  try {
    const today = new Date();

    const totalTasks = await Task.countDocuments({
      assignedTo: req.user._id,
    });

    const completedTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: "done",
    });

    const pendingTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: { $ne: "done" },
    });

    const overdueTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: { $ne: "done" },
      dueDate: { $exists: true, $lt: today },
    });

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  assignTask,
  updateTaskStatus,
  getTasks,
  getDashboardData,
};