const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const connection = require("./db/conn");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Book = require("./models/Book");

const app = express();

// view engine setup
app.set("view engine", "ejs");

//app configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//bcrypt configuration
const salt = bcrypt.genSaltSync(10);
const secret = "aeirheohoihosjriheoirhoehrohjeorheroiheoih";

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());

//Connection is setup to the databse
connection();

////////////////GET ROUTE////////////////
app.get("/", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      res.render("home", { username: undefined });
    } else {
      res.render("home", { username: info.username });
    }
  });
});

app.get("/package", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      res.render("package", { username: undefined });
    } else {
      res.render("package", { username: info.username });
    }
  });
});

app.get("/about", (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      res.render("about", { username: undefined });
    } else {
      res.render("about", { username: info.username });
    }
  });
});

app.get("/book", (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      res.send(
        `<script>alert('You have to login or register to access the book page'); window.location.href = '/login';</script>`
      );
    } else {
      res.render("book", { username: info.username });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("registration");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

//////////POST ROUTE////////////////
app.post("/register", async (req, res) => {
  const { username, password, cPassword } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.render("registration", {
      errorMessage: "Username is already taken",
    });
  }
  if (password !== cPassword) {
    return res.render("registration", {
      errorMessage: "Password is not match with confirm password",
    });
  }

  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    if (userDoc) {
      const registerUser = await User.findOne({ username });

      // Generate JWT token and set it as a cookie
      const token = jwt.sign({ username, id: registerUser._id }, secret);
      res.cookie("token", token);
      res.render("home", { username: username });
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.render("login", { errorMessage: "Username not found!" });
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      const token = jwt.sign({ username, id: userDoc._id }, secret);
      res.cookie("token", token);
      res.render("home", { username: username });
    } else {
      return res.render("login", { errorMessage: "Password not match!" });
    }
  } catch (error) {
    res.status(500).json("Internal server error");
  }
});

app.post("/book", async (req, res) => {
  const { name, email, phone, address, location, guests, arrivals, leaving } =
    req.body;

  try {
    const bookDoc = await Book.create({
      name,
      email, 
      phone,
      address,
      location,
      guests,
      arrivals,
      leaving,
    });
    if (bookDoc) {
      res.send(
        `<script>alert('Your Booking is Done ✅'); window.location.href = '/';</script>`
      );
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
