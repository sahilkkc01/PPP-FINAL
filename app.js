var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { con } = require("./db");
const bodyParser = require("body-parser");
const session = require("express-session");

var ppcRoutes = require("./routes/ppcRoutes");
// const { authMiddleware } = require("./middleware/auth");

var app = express();

// Setup session management
app.use(
  session({
    secret: "your_secret_key", // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // For production, set this to true and use HTTPS
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse application/json
app.use(bodyParser.json());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use(authMiddleware)
// app.use((req, res, next) => {
//   // Ensure that rights are always available as a string
//   res.locals.rights = req.session.rights || '';  // Store it as an empty string if no rights are set
//   next();
// });

app.use("/", ppcRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = 5001;
app.listen(PORT, async () => {
  console.log(`Server started at PORT ${PORT}`);
  await con();
});

module.exports = app;
