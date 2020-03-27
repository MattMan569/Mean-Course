const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.post("/api/posts", (req, res, next) => {
  const post = req.body;
  console.log(post);
  res.status(201).json(post);
});

app.get("/api/posts", (req, res, next) => {
  const posts = [
    {
      id: "jdhas352738h",
      title: "First server-side post",
      content: "Server post"
    },
    {
      id: "453897yho5tuonuqw",
      title: "Second server-side post",
      content: "Server post 2"
    }
  ];

  res.json({
    message: "Success",
    posts
  });
});

module.exports = app;
