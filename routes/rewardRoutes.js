const express = require("express");
const router = express.Router();
const { savePoints } = require("../controllers/userController");
const {
  boostReward,
  claimDailyReward,
  updateUserRewards,
  claimTreasureChest,
  fetchReward,
} = require("../controllers/rewardContoller");

router.get("/reward", fetchReward);
router.post("/savepoints", savePoints);
router.put("/boost", boostReward);
router.put("/daily-reward/claim/:id", claimDailyReward);
router.post("/update-reward", updateUserRewards);
router.put("/treasure-chest/claim/:id", claimTreasureChest);

module.exports = router;
