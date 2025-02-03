const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let ADMINS = [];
let COURSES = [];
let USERS = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;

  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    return next();
  }
  res.status(403).json({ message: "Admin authentication failed" });
};

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.user = user;
    return next();
  }
  res.status(403).json({ message: "User authentication failed" });
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

app.post("/user/signup", (req, res) => {
  const user = { ...req.body, purchasedCourses: [] };
  const userExists = USERS.find((u) => u.username === user.username);
  if (userExists) {
    res.status(401).json({ message: "User already exists" });
  }
  USERS.push(user);
  res.status(200).json({ message: "User created successfully" });
});

app.post("/user/login", userAuthentication, (req, res) => {
  res.status(200).json({ message: "User logged in successfully" });
});

app.get("/user/courses", userAuthentication, (req, res) => {
  const publishedCourses = COURSES.filter((c) => c.published);
  res.status(200).json({ courses: publishedCourses });
});

app.post("/user/courses/:courseId", userAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId && c.published);
  if (course) {
    req.user.purchasedCourses.push(courseId);
    return res.status(200).json({
      message: "Course purchased successfully",
    });
  }
  res.status(404).json({ message: "Course not found or not available" });
});

app.get("/user/purchasedCourses", userAuthentication, (req, res) => {
  const purchasedCourses = COURSES.filter((course) =>
    req.user.purchasedCourses.includes(course.id)
  );

  // Alternate to the above 3 lines of code is below 8 lines of code

  // const purchasedCoursesId = req.user.purchasedCourses;
  // const purchasedCourses = [];
  // for(let i=0; i<COURSES.length; i++) {
  //   if(purchasedCoursesId.indexOf(COURSES[i]) !== -1) {
  //     purchasedCourses.push(COURSES[i]);
  //   }
  // }

  res.status(200).json({ purchasedCourses });
});
app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
