const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");

const prisma = new PrismaClient();
const router = express.Router();

// Create a project
router.post(
  "/",
  authMiddleware,
  [
    body("name").notEmpty().withMessage("Project name is required"),
    body("description").notEmpty().withMessage("Project description is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description } = req.body;
      const project = await prisma.project.create({
        data: { name, description, userId: req.user.userId },
      });

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Error creating project", error: error.message });
    }
  }
);

//get projects with pagination logic
router.get("/", authMiddleware, async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query; // Default: page 1, 10 items per page
    page = parseInt(page);
    limit = parseInt(limit);

    const projects = await prisma.project.findMany({
      where: { userId: req.user.userId },
      // include: { tasks: true },
      skip: (page - 1) * limit, // Offset
      take: limit, // Limit
    });

    const totalProjects = await prisma.project.count({
      where: { userId: req.user.userId },
    });

    res.json({
      page,
      limit,
      totalPages: Math.ceil(totalProjects / limit),
      totalProjects,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
});



// Update a project (Only the owner can update)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project || project.userId !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized: You don't own this project" });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name, description, status },
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
});

// Delete a project (Only the owner can delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project || project.userId !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized: You don't own this project" });
    }

    await prisma.project.delete({ where: { id } });
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


module.exports = router;
