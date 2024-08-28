const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  referralId: { type: String, unique: true, required: true },

  fullName: { type: String },

  referrerId: { type: String },

  referralCount: { type: Number, default: 0 },

  username: { type: String, trim: true, unique: true },

  chatId: { type: String, unique: true },

  energy_limit: { type: Number, required: true, default: 3000 },

  velocity: { type: Number, required: true, default: 1 },

  total_reward: { type: Number, required: true, default: 0 },

  energyToReduce: { type: Number, required: true, default: 1 },

  eLevel: { type: Number, required: true, default: 1 },

  rLevel: { type: Number, required: true, default: 1 },

  vLevel: { type: Number, required: true, default: 1 },

  aLevel: { type: Number, required: true, default: 1 },

  currentEnergy: { type: Number, required: true, default: 3000 },

  isVerified: Boolean,

  isNewUser: { type: Boolean, default: false },

  isMiningStarted: { type: Boolean, default: false },

  newBonusClaim: { type: Boolean, default: false },

  isRewardClaimed: { type: Boolean, default: false },

  claimAmount: { type: Number, default: 0 },

  currentEnergyTime: Number,

  lastClaimDate: Date,

  currentStreak: { type: Number, default: 0 },
});

module.exports = model("User", UserSchema);
