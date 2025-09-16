const path = require("path");
const express = require("express");
const app = express();

app.get("/", function (req, res) {
  const absolutePathToHTMLFile = path.resolve(__dirname, "../dist/index.html");
  res.sendFile(absolutePathToHTMLFile);
});

app.use("/static", express.static(path.resolve(__dirname, "../dist")));

app.listen(3000, function () {
  console.log("Application is running on http://localhost:3000/");
});
