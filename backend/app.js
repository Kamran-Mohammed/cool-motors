const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");

const vehicleRouter = require("./routes/vehicleRoutes");
const pendingVehicleRouter = require("./routes/pendingVehicleRoutes");
const soldVehicleRouter = require("./routes/soldVehicleRoutes");
const userRouter = require("./routes/userRoutes");
const likeRouter = require("./routes/likeRoutes");
const AppError = require("./utils/appError");
const errorHandler = require("./controllers/errorController");

const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );
const allowedOrigins = [
  "http://localhost:3000", // Local frontend
  "http://192.168.0.109:3000", // Local frontend
  "https://cool-motors-frontend.onrender.com",
  "https://aceblue.ae",
  "https://autofinds.in",
  // "https://autofinds.in",
  "https://dev-autofinds.onrender.com",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

//body parser. reading data from the body of the request into req.body
// app.use(express.json({ limit: "10kb" }));
app.use(express.json());
app.use(cookieParser());

//set security http headers:
app.use(helmet());

app.use(express.static(path.join(__dirname, "public")));

//data sanitization against nosql queriy injection
app.use(mongoSanitize());

//data sanitization against xss
app.use(xss());

//prevent parameter pollution
app.use(hpp());

//development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message:
//     "Too many requests from this IP address. Please try again in one hour.",
// });
// app.use("/api", limiter);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/pending-vehicles", pendingVehicleRouter);
app.use("/api/v1/sold-vehicles", soldVehicleRouter);
app.use("/api/v1/likes", likeRouter);

//for undefined url:
//'all' means (get, post, patch, delete, ..)
//'*' means all urls
app.all("*", (req, res, next) => {
  const err = new AppError(`Cannot find ${req.method} ${req.originalUrl}`, 404);

  //if any next() middleware is called with any parameter, it is automatically assumed to be an error
  //the error handling middleware is directly called skipping all the other middleware in the middleware stack
  next(err);
});

//any middleware function with four parameters is assumed to be the error handing middleware and the first parameter to be the error
app.use(errorHandler);

module.exports = app;
