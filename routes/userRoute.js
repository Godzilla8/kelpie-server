const express = require("express");
const router = express.Router();
const { fetchUser, verifyUser } = require("../controllers/userController");

router.get("/:username", fetchUser);
router.post("/verify", verifyUser);

module.exports = router;
