const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const secret_key = "NARUTO_UZUMAKI";

const generateAdminToken = (admin) => {
  const payload = { username: admin.username };
  return jwt.sign(payload, secret_key, { expiresIn: "1h" });
};

const authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secret_key, (err, admin) => {
      if (err)
        return res.status(403).json({ message: "Admin authentication failed" });
      else return next();
    });
  }
  res.status(403).json({ message: "Token not found" });
};

let ADMIN_FILE = "admins.json";
let COURSE_FILE = "courses.json";
let USER_FILE = "users.json";

const getAdmins = () => {
  if (fs.existsSync(ADMIN_FILE)) {
    return JSON.parse(fs.readFileSync(ADMIN_FILE, "utf8"));
  }
  return [];
};

const saveAdmins = (admins) => {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admins, null, 2));
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

const getUsers = () => {
  if (fs.existsSync(USER_FILE)) {
    return JSON.parse(fs.readFileSync(USER_FILE, "utf8"));
  }
  return [];
};

const saveUsers = (users) => {
  fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));
};

let admins = getAdmins();
let courses = getCourses();
let users = getUsers();

app.get("/", (req, res) => {
  res.send("Welcom to Course Website");
});

app.post("/admin/signup", (req, res) => {
  const admin = req.body;

  const adminExists = admins.find((a) => a.username === admin.username);
  if (adminExists) {
    return res.status(409).json({ message: "Admin already exists" });
  }
  admins.push(admin);
  const token = generateAdminToken(admin);
  saveAdmins(admins);
  res
    .status(200)
    .json({ message: "Admin registered successfully", token: token });
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.headers;

  const admin = admins.find(
    (a) => a.username === username && a.password === password
  );

  if (admin) {
    const token = generateAdminToken(admin);
    return res
      .status(200)
      .json({ message: "Admin login successful", token: token });
  } else {
    res.status(401).json({ message: "Admin authentication failed" });
  }
});

app.post("/admin/course", authenticateAdminToken, (req, res) => {
  const course = req.body;
  course.id = courses.length + 1;
  courses.push(course);
  saveCourses(courses);
  res
    .status(200)
    .json({ message: "Course created successfully", id: course.id });
});
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
