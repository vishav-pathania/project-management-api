const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/authMiddleware");

const prisma = new PrismaClient();
const router = express.Router();

// Create a task under a project
router.post("/:projectId/tasks", authMiddleware, async (req, res) => {
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
});

// Get tasks for a project
router.get("/:projectId/tasks", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({ where: { projectId } });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

// Update a task
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

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

module.exports = router;
