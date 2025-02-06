const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = 3000;

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});
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

const Admin = mongoose.model("Admin", adminSchema);
const Course = mongoose.model("Course", courseSchema);
const User = mongoose.model("User", userSchema);

mongoose.connect(
  "mongodb+srv://mdalqma7:suGn2tZhVglwgzfF@cluster0.5ledg.mongodb.net/course-website"
);
const secret_key = "Sung_Jinwoo";

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: "Authentication failed" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, secret_key, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Authentication failed" });
    }
    req.user = user; // user object contains username and role
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  authenticateUser(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    next();
  });
};

// Middleware to restrict access to only regular users
const authenticateRegularUser = (req, res, next) => {
  authenticateUser(req, res, () => {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Access denied: Users only" });
    }
    next();
  });
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

app.post("/admin/course", authenticateAdmin, async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  return res
    .status(200)
    .json({ message: "Course created successfully", courseId: course.id });
});

app.put("/admin/course/:courseId", authenticateAdmin, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body);
  if (course) {
    return res
      .status(200)
      .json({ message: "Course updated successfully", courseId: course.id });
  } else {
    return res.status(404).json({ message: "Course not found" });
  }
});

app.delete("/admin/course/:courseId", authenticateAdmin, async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.courseId);
  if (course) {
    return res.status(200).json({ message: "Course deleted successfully" });
  } else {
    return res.status(404).json({ message: "Course not found" });
  }
});

app.get("/admin/courses", authenticateAdmin, async (req, res) => {
  const courses = await Course.find({});
  return res.status(200).json({ courses: courses });
});

app.post("/user/signup", async (req, res) => {
  const { username, password } = req.body;
  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ username, role: "user" }, secret_key, {
      expiresIn: "1h",
    });
    return res
      .status(200)
      .json({ message: "user registered successfully", token: token });
  }
});

app.post("/user/login", async (req, res) => {
  const { username, password } = req.headers;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ username, role: "user" }, secret_key, {
      expiresIn: "1h",
    });
    return res
      .status(200)
      .json({ message: "User signed in successfully", token: token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

app.get("/user/courses", authenticateRegularUser, async (req, res) => {
  const publishedCourses = await Course.find({ published: true });
  if (publishedCourses) {
    return res.status(200).json({ courses: publishedCourses });
  } else {
    return res.status(404).json({ message: "No courses found" });
  }
});

app.get("/user/course/:courseId", authenticateRegularUser, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    return res.status(200).json({ course: course });
  } else {
    return res.status(404).json({ message: "Course not found" });
  }
});

app.post(
  "/user/courses/:courseId",
  authenticateRegularUser,
  async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (course) {
      const user = await User.findOne({ username: req.user.username });
      if (user) {
        user.purchasedCourses.push(course);
        await user.save();
        res.json({ message: "Course purchased successfully" });
      } else {
        res.status(403).json({ message: "User not found" });
      }
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  }
);

app.get("/user/purchasedCourses", authenticateRegularUser, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate(
    "purchasedCourses"
  );
  if (user) {
    return res.status(200).json({ course: user.purchasedCourses || [] });
  } else {
    return res.status(403).json({ message: "User not found" });
  }
});

app.listen(PORT, () => {
  console.log("listening on port" + PORT);
});
