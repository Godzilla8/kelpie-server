const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const CustomError = require("./utils/CustomError");
const userRoutes = require("./routes/userRoute");
const rewardRoutes = require("./routes/rewardRoutes");
const telegramRoutes = require("./routes/telegramRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

const limiter = rateLimit({
  max: 100,
  windowMs: 0.5 * 60 * 1000,
  message: "Too many requests from this IP, please try again in 30 seconds",
});

process.on("uncaughtException", (err) => {
  console.log(`ERROR NAME: ${err.name}\n ERROR MESSAGE: ${err.message}`);
  console.log("UNCAUGHT EXCEPTION! Server shutting down...");
});

// Connect to database
if (process.env.NODE_ENV === "development") {
  mongoose
    .connect(process.env.LOCAL_MONGO_URI)
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.log(err.message));

  console.log("kelpie-development-mode");

  app.use(cors({ origin: "*", credentials: true }));
}

if (process.env.NODE_ENV === "production") {
  mongoose
    .connect(process.env.LIVE_MONGO_URI)
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.log(err.message));

  console.log("kelpie-production-mode");

  app.use(cors({ origin: "*", credentials: true }));
}

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(cookieParser());

// app.use(limiter);

app.use("/", telegramRoutes);
app.use("/user", userRoutes);
app.use("/user/rewards", rewardRoutes);

app.all("*", (req, res, next) => {
  const err = new CustomError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
});

app.use(require("./middleware/errorHandler"));

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`ERROR NAME: ${err.name}\n ERROR MESSAGE: ${err.message}`);
  console.log("UNHANDLED REJECTION! Server shutting down...");
  server.close(() => process.exit(1));
});
