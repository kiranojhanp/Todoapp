const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const userRouter = require("./routes/userRouter");

mongoose
  .connect(process.env.DbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to database server");
  })
  .catch(() => {
    console.log("Connection Unsuccessful");
  });

const app = express();

//support json encoded bodies
app.use(express.json());

// support encoded bodies
app.use(express.urlencoded({ extended: false }));

// access to public directory
// app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
  res.send("Welcome to the task app");
});

app.use("/api/users", userRouter);

// error handling
app.use((req, res, next) => {
  let err = new Error("Not found!");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.json({
    status: "error",
    message: err.message,
  });
});

app.listen(process.env.Port, () => {
  console.log(`Server is running at localhost:${process.env.Port}`);
});
