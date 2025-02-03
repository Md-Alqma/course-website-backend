const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let ADMINS_FILE = "admins.json";

const getAdmins = () => {
  if (fs.existsSync(ADMINS_FILE)) {
    return JSON.parse(fs.readFileSync(ADMINS_FILE, "utf8"));
  }
  return [];
};

const saveAdmins = (admin) => {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admin, null, 2));
};

let ADMINS = getAdmins();

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

app.listen(PORT, () => {
  console.log("server is listening on port " + PORT);
});
