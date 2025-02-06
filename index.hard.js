const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = 3000;

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  published: Boolean,
  imageURL: String,
  instructor: String,
});

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const Admin = mongoose.model("Admin", adminSchema);
const Course = mongoose.model("Course", courseSchema);
const User = mongoose.model("User", userSchema);

mongoose.connect(
  "mongodb+srv://mdalqma7:suGn2tZhVglwgzfF@cluster0.5ledg.mongodb.net/course-website"
);
const secret_key = "Sung_Jinwoo";

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secret_key, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Authentication failed" });
      } else {
        req.user = user;
        return next();
      }
    });
  } else {
    return res.status(403).json({ message: "Authentication failed" });
  }
};
app.get("/", (req, res) => {
  res.send("Welcome to course website");
});

app.post("/admin/signup", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (admin) {
    return res.status(409).json({ message: "Admin already exists" });
  } else {
    const newAdmin = new Admin({ username, password });
    newAdmin.save();
    const token = jwt.sign({ username, role: "admin" }, secret_key, {
      expiresIn: "1h",
    });
    return res
      .status(200)
      .json({ message: "Admin created successfully", token: token });
  }
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, secret_key, {
      expiresIn: "1h",
    });
    return res
      .status(200)
      .json({ message: "Admin login successful", token: token });
  }
  return res.status(403).json({ message: "Authentication failed" });
});

app.post("/admin/course", authenticateUser, async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  return res
    .status(200)
    .json({ message: "Course created successfully", courseId: course.id });
});

app.put("/admin/course/:courseId", authenticateUser, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body);
  if (course) {
    return res
      .status(200)
      .json({ message: "Course updated successfully", courseId: course.id });
  } else {
    return res.status(404).json({ message: "Course not found" });
  }
});

app.listen(PORT, () => {
  console.log("listening on port" + PORT);
});
