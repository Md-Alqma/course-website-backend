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
  return res.status(403).json({ message: "Token not found" });
};

const generateUserToken = (user) => {
  const payload = { username: user.username };
  return jwt.sign(payload, secret_key, { expiresIn: "1h" });
};

const authenticateUserToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secret_key, (err, user) => {
      if (err)
        return res.status(401).json({ message: "User authentication failed" });
      else {
        req.user = user;
        return next();
      }
    });
  }
  return res.status(403).json({ message: "Authentication failed" });
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
  return res.send("Welcom to Course Website");
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
  return res
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
    return res.status(401).json({ message: "Admin authentication failed" });
  }
});

app.post("/admin/course", authenticateAdminToken, (req, res) => {
  const course = req.body;
  course.id = courses.length + 1;
  courses.push(course);
  saveCourses(courses);
  return res
    .status(200)
    .json({ message: "Course created successfully", id: course.id });
});

app.put("/admin/course/:courseId", authenticateAdminToken, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = courses.find((c) => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    saveCourses(courses);
    return res.status(200).json({ message: "Course edited successfully" });
  }
  return res.status(404).json({ message: "Course not found" });
});

app.delete("/admin/course/:courseId", authenticateAdminToken, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const courseIndex = courses.findIndex((c) => c.id === courseId);
  if (courseIndex !== -1) {
    courses.splice(courseIndex, 1);
    saveCourses(courses);
    return res.status(200).json({ message: "Course deleted successfully" });
  }
  return res.status(404).json({ message: "Course not found" });
});

app.get("/admin/courses", authenticateAdminToken, (req, res) => {
  return res.status(200).json({ courses: courses });
});

app.post("/user/signup", (req, res) => {
  const user = { ...req.body, purchasedCourse: [] };
  const userExists = users.find((u) => u.username === user.username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push(user);
  saveUsers(users);
  const token = generateUserToken(user);
  res
    .status(200)
    .json({ message: "User registered successfully", token: token });
});

app.post("/user/login", (req, res) => {
  const { username, password } = req.headers;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    const token = generateUserToken(user);
    return res
      .status(200)
      .json({ message: "User logged in successfully", token: token });
  }
  res.status(401).json({ message: "User authentication failed" });
});

app.get("/user/course", authenticateUserToken, (req, res) => {
  const publishedCourses = courses.filter((c) => c.published);
  if (publishedCourses) {
    return res.status(200).json({ courses: publishedCourses });
  }
  return res.status(404).json({ message: "No courses found" });
});

app.get("/user/course/:courseId", authenticateUserToken, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = courses.find((c) => c.id === courseId);
  if (course) {
    return res.status(200).json({ course: course });
  }
  return res.status(404).json({ message: "Course not found" });
});

app.post("/user/course/:courseId", authenticateUserToken, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = courses.find((c) => c.id === courseId);

  if (course) {
    const user = users.find((u) => u.username === req.user.username);
    if (user.purchasedCourse.some((c) => c.id === courseId)) {
      return res.status(400).json({ message: "Course already purchased" });
    } else {
      user.purchasedCourse.push(course);
      saveUsers(users);
      return res.status(200).json({ message: "Course purchased successfully" });
    }
  }
  res.status(404).json({ message: "Course not found" });
});

app.get("/user/purchasedCourse", authenticateUserToken, (req, res) => {
  const user = users.find((u) => u.username === req.user.username);
    if (user.purchasedCourse) {
      return res.status(200).json({ courses: user.purchasedCourse });
    } else {
      return res.status(404).json({ courses: "No course purchased yet." });
    }
});
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
