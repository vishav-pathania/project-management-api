const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");


const prisma = new PrismaClient();
const router = express.Router();

// Create a task under a project
router.post(
  "/:projectId/tasks",
  authMiddleware,
  [
    body("title").notEmpty().withMessage("Task title is required"),
    body("description").notEmpty().withMessage("Task description is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { projectId } = req.params;
      const { title, description, assignedUserId } = req.body;

      const task = await prisma.task.create({
        data: { title, description, projectId, assignedUserId },
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Error creating task", error: error.message });
    }
  }
);


// Get tasks for a project
router.get("/:projectId/tasks", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query; // Allow filtering by status

    const filters = { projectId };
    if (status) filters.status = status; // Apply status filter if provided

    const tasks = await prisma.task.findMany({
      where: filters,
      include: { assignedUser: true }, // Include user details
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks for project", error: error.message });
  }
});



// Update a task (only the assigned user can update a task)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task || task.assignedUserId !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized: You are not assigned to this task" });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, description, status },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});



// Delete a task
router.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({ where: { id } });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});


router.get("/", authMiddleware, async (req, res) => {
  try {
    let { page = 1, limit = 10, status, assignedUserId } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filters = {};
    if (status) filters.status = status;
    if (assignedUserId) filters.assignedUserId = assignedUserId;

    const tasks = await prisma.task.findMany({
      where: filters,
      include: { project: true, assignedUser: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalTasks = await prisma.task.count({ where: filters });

    res.json({
      page,
      limit,
      totalPages: Math.ceil(totalTasks / limit),
      totalTasks,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});



module.exports = router;
