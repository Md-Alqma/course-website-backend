const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let ADMINS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  console.log("inside authenticatoin");
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

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
