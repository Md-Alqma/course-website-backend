const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome to Course Website!");
});

app.listen(PORT, () => {
  console.log("server is listening on port " + PORT);
});
