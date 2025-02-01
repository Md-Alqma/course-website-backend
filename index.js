const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let ADMINS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  console.log(username, password);

  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    next();
  }
  res.status(403).json({ message: "Admin authentication failed" });
};

app.get("/", (req, res) => {
  res.send("Welcome to Courses for You");
});

app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const adminExists = ADMINS.find((a) => a.username === admin.username);
  if (adminExists) {
    res.status(401).json({ message: "Admin already exists" });
  } else {
    ADMINS.push(admin);
    res.status(200).json({ message: "Admin created successfully" });
  }
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  res.status(200).json({ message: "Admin login successful" });
});

app.post("/admin/course", adminAuthentication, (req, res) => {
  const course = req.body;
  course.id = Date.now();
  COURSES.push(course);
  res.status(200).json({ message: "Course created successfully" });
});

app.put("/admin/course/:courseId", adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    res.status(200).json({ message: "Course updated successfully" });
  }
  res.status(404).json({ message: "Course not found" });
});

app.delete("/admin/course/:courseId", adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const courseIndex = COURSES.findIndex((c) => c.id === courseId);
  if (courseIndex === -1) {
    res.status(404).json({ message: "Course not found" });
  }
  COURSES.splice(courseIndex, 1);
  res.status(200).json({ message: "Course deleted successfully" });
});

app.get("/admin/courses", adminAuthentication, (req, res) => {
  res.status(200).json({ courses: COURSES });
});

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
