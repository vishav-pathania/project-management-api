const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/authMiddleware");

const prisma = new PrismaClient();
const router = express.Router();

// Create a project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: { name, description, userId: req.user.userId },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error: error.message });
  }
});

// Get all projects
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.userId },
      include: { tasks: true },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
});

// Update a project
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id, userId: req.user.userId },
      data: { name, description, status },
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
});

// Delete a project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({ where: { id, userId: req.user.userId } });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
});


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


module.exports = router;
