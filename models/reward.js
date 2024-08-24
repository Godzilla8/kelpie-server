const { Schema, model } = require("mongoose");

const RewardSchema = new Schema({
  maxClaim: {
    type: Number,
    default: 10000,
  },
  rewardAmount: {
    type: Number,
    default: 1000000,
  },
  totalClaims: {
    type: Number,
    default: 0,
  },
  totalClaimedUsers: {
    type: Number,
    default: 0,
  },
  claimedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = model("Reward", RewardSchema);
