const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let ADMINS_FILE = "admins.json";
let COURSE_FILE = "courses.json";

const getAdmins = () => {
  if (fs.existsSync(ADMINS_FILE)) {
    return JSON.parse(fs.readFileSync(ADMINS_FILE, "utf8"));
  }
  return [];
};

const saveAdmins = (admin) => {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admin, null, 2));
};

const getCourses = () => {
  if (fs.existsSync(COURSE_FILE)) {
    return JSON.parse(fs.readFileSync(COURSE_FILE, "utf8"));
  }
  return [];
};

const saveCourses = (courses) => {
  fs.writeFileSync(COURSE_FILE, JSON.stringify(courses, null, 2));
};

let ADMINS = getAdmins();
let COURSES = getCourses();

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  if (ADMINS.find((a) => a.username === username && a.password === password)) {
    return next();
  }
  return res.status(401).json({ message: "Admin authentication failed" });
};

app.get("/", (req, res) => {
  res.send("Welcome to Course Website!");
});

// ADMIN endpoints

app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const adminExists = ADMINS.find((a) => a.username === admin.username);
  if (adminExists) {
    return res.status(409).json({ message: "Admin already exists" });
  }
  ADMINS.push(admin);
  saveAdmins(ADMINS);
  res.status(200).json({ message: "Admin Created Successfully" });
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  res.status(200).json({ message: "Admin Login Successfully" });
});

app.post("/admin/course", adminAuthentication, (req, res) => {
  const course = req.body;
  const courseId = COURSES.length + 1;
  course.id = courseId;
  COURSES.push(course);
  saveCourses(COURSES);
  res
    .status(200)
    .json({ message: " Course created successfully", courseId: courseId });
});

app.put("/admin/course/:courseId", adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    saveCourses(COURSES);
    res.status(200).json({ message: "Course updated successfully" });
  }
  res.status(404).json({ message: "Course not found" });
});

app.delete("/admin/course/:courseId", adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const courseIndex = COURSES.findIndex((course) => course.id === courseId);

  if (courseIndex !== -1) {
    COURSES.splice(courseIndex, 1);
    saveCourses(COURSES);
    res.status(200).json({ message: "Course deleted successfully" });
  }
  res.status(404).json({ message: "Course not found" });
});

app.listen(PORT, () => {
  console.log("server is listening on port " + PORT);
});
