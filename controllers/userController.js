const User = require("../models/user");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/CustomError");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

exports.verifyUser = asyncErrorHandler(async (req, res, next) => {
  const { initData } = req.body;
  const encoded = decodeURIComponent(initData);
  const secret = crypto.createHmac("sha256", "WebAppData").update(process.env.TELEGRAM_TOKEN);

  const arr = encoded.split("&");
  const hashIndex = arr.findIndex((str) => str.startsWith("hash="));
  const userIndex = arr.findIndex((str) => str.startsWith("user="));
  const hash = arr.splice(hashIndex)[0].split("=")[1];
  const userObj = arr.slice(userIndex, userIndex + 1)[0].split("=")[1];

  const userData = JSON.parse(userObj);
  arr.sort((a, b) => a.localeCompare(b));
  const dataCheckString = arr.join("\n");

  const _hash = crypto.createHmac("sha256", secret.digest()).update(dataCheckString).digest("hex");
  if (hash !== _hash) {
    return res.status(400).json({ status: "failed", message: "Invalid data", isVerified: false });
  }
  const user = await User.findOne({ username: userData.username });
  if (user) {
    return res.status(200).json({ user, isVerified: true });
  } else {
    return res.status(200).json({ status: "failed", message: "User is not registered" });
  }
});

exports.fetchUser = asyncErrorHandler(async (req, res, next) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (user) {
    const now = new Date();
    let timeSpent = Math.floor(now.getTime() / 1000) - user.currentEnergyTime;
    timeSpent = timeSpent * user.velocity + user.currentEnergy;
    const energyRecharged = Math.min(timeSpent, user.energy_limit);

    return res.status(200).json({
      ...user._doc,
      currentEnergy: energyRecharged,
    });
  }
  return next(new CustomError("Invalid credentials", 400));
});

exports.savePoints = asyncErrorHandler(async (req, res, next) => {
  const { username, points, currentEnergy } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return next(new CustomError("Invalid credentials", 400));
  }
  if (user.total_reward > points) return next(new CustomError("Something went wrong", 400));

  let addedPoints = points - user.total_reward;

  let now = new Date();
  let initialTime = Math.floor(now.getTime() / 1000);

  user.currentEnergyTime = initialTime;
  user.currentEnergy = currentEnergy;
  user.total_reward += addedPoints;

  await user.save();

  res.status(200).json({ status: "success", message: "Points saved successfully" });
});
