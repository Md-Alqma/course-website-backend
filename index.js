const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let ADMINS = [];

app.get("/", (req, res) => {
  res.send("Welcome to Courses for You");
});

app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const adminExists = ADMINS.find((a) => a.username === admin.username);
  if (adminExists) {
    res.status(401).json({ message: "Admin already exists" });
  } else {
    ADMINS.push(adminExists);
    res.status(200).json({ message: "Admin created successfully" });
  }
});

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
