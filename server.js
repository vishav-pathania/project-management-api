require("dotenv").config();
const express = require("express");
const cors = require("cors");

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
