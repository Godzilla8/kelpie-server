const User = require("../models/user");
const Reward = require("../models/reward");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/CustomError");
const mongoose = require("mongoose");

exports.fetchReward = asyncErrorHandler(async (req, res, next) => {
  const reward = await Reward.findOne({});
  res.status(200).json(reward);
});

// Boost Rewards Logic
exports.boostReward = asyncErrorHandler(async (req, res, next) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  const BOOST_VALUE = 500;

  if (!user) return next(new CustomError("Invalid credentials", 400));

  const { boostString } = req.body;

  // Boost energy Limit
  if (boostString === "energy-limit") {
    const totalPrice = user.eLevel * BOOST_VALUE;

    if (user.total_reward < totalPrice) {
      return next(new CustomError("Insufficient coins 😒😒", 400));
    }

    user.energy_limit += 500;
    user.total_reward -= totalPrice;
    user.eLevel += 1;

    await user.save();

    const { eLevel, rLevel, vLevel, aLevel } = user._doc;
    res.status(200).json({
      eLevel,
      rLevel,
      vLevel,
      aLevel,
      message: "Boosted 😍🎉",
    });
  }

  // Boost reduce level
  if (boostString === "reduce-limit") {
    const totalPrice = user.rLevel * BOOST_VALUE;

    if (user.total_reward < totalPrice) {
      return next(new CustomError("Insufficient coins 😒😒", 400));
    }

    user.energyToReduce += 2;
    user.total_reward -= totalPrice;
    user.rLevel += 1;

    await user.save();

    const { eLevel, rLevel, vLevel, aLevel } = user._doc;
    res.status(200).json({ eLevel, rLevel, vLevel, aLevel });
  }

  // Boost velocity level
  if (boostString === "velocity-limit") {
    const totalPrice = user.vLevel * BOOST_VALUE * 2;

    if (user.total_reward < totalPrice) {
      return next(new CustomError("Insufficient coins 😒😒", 400));
    }

    user.velocity += 1;
    user.total_reward -= totalPrice;
    user.vLevel += 1;

    await user.save();

    const { eLevel, rLevel, vLevel, aLevel } = user._doc;
    res.status(200).json({ eLevel, rLevel, vLevel, aLevel });
  }

  // Boost super level
  if (boostString === "all") {
    let totalPrice = user.eLevel * BOOST_VALUE;
    totalPrice += user.rLevel * BOOST_VALUE;
    totalPrice += user.vLevel * BOOST_VALUE;

    if (user.total_reward < totalPrice) {
      return next(new CustomError("Insufficient coins", 400));
    }

    user.velocity += 1;
    user.energyToReduce += 2;
    user.energy_limit += 500;
    user.total_reward -= totalPrice;
    user.rLevel += 1;
    user.aLevel += 1;
    user.eLevel += 1;
    user.vLevel += 1;

    await user.save();

    const { eLevel, rLevel, vLevel, aLevel } = user._doc;
    res.status(200).json({ eLevel, rLevel, vLevel, aLevel });
  }
});

exports.claimDailyReward = asyncErrorHandler(async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({ username });
  if (!user) return next(new CustomError("This user does not exist", 404));

  const dailyRewardValue = [
    500, 1000, 2000, 3500, 8500, 13000, 20000, 50000, 100000, 200000, 500000, 600000, 700000,
    800000, 1000000,
  ];

  const today = new Date();
  const lastClaimDate = user.lastClaimDate;
  const setToday = new Date().setHours(0, 0, 0, 0); // Reset time to midnight for comparison
  const sLCD = new Date(lastClaimDate).setHours(0, 0, 0, 0);
  // User has not claimed today or is within 24 hours of the last claim

  if (!user.lastClaimDate || (setToday !== sLCD && setToday - sLCD <= 86400000)) {
    let reward;
    // Increment streak
    user.currentStreak += 1;

    // Calculate reward (for simplicity, reward = streak)
    reward = dailyRewardValue[user.currentStreak];

    // Update user data
    user.total_reward += reward;
    user.lastClaimDate = today;
    await user.save();

    return res.status(200).json({ status: "success", reward, currentStreak: user.currentStreak });
  }

  // User missed a day
  if (setToday - sLCD > 86400000) {
    user.currentStreak = 1; // Reset to 1 since they missed
    user.total_reward += dailyRewardValue[0];
    user.lastClaimDate = today;
    await user.save();
    return res.status(200).json({ reward: user.total_reward, currentStreak: user.currentStreak });
  }

  // User already claimed today
  if (setToday === sLCD) {
    return res.status(400).json({ message: "Already claimed today" });
  }
});

exports.updateUserRewards = asyncErrorHandler(async (req, res, next) => {
  const { username, size } = req.body;

  const setUser = await User.updateOne({ username }, { $inc: { total_reward: size } });

  res.status(200).json({ status: "success", message: "Reward added successfully!", user: setUser });
});

exports.claimTreasureChest = asyncErrorHandler(async (req, res, next) => {
  const { username } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ username }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return next(new CustomError("User not found", 404));
    }

    if (user.isRewardClaimed) {
      await session.abortTransaction();
      session.endSession();
      return next(new CustomError("You have already claimed!", 400));
    }

    const reward = await Reward.findOne().session(session);
    if (!reward) {
      await session.abortTransaction();
      session.endSession();
      return next(new CustomError("Claiming hasn't started.", 500));
    }

    if (reward.totalClaimedUsers >= reward.maxClaim) {
      await session.abortTransaction();
      session.endSession();
      return next(new CustomError("Claim limit reached.", 400));
    }

    user.isRewardClaimed = true;
    user.total_reward += reward.rewardAmount;
    user.claimAmount = reward.rewardAmount;
    await user.save({ session });

    reward.totalClaims += reward.rewardAmount;
    reward.totalClaimedUsers += 1;
    reward.claimedUsers.push(user._id);
    await reward.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Claimed", claimAmount: user.claimAmount });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(new CustomError(`Server Error: ${error}`, 500));
  }
});
