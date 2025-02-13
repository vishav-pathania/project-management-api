require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON parsing

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Welcome to the Project Management API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.use("/projects", projectRoutes);
// app.use("/projects", taskRoutes);
app.use("/tasks", taskRoutes);

app.use("/auth", authRoutes);