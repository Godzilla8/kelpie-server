const express = require("express");
const router = express.Router();
const { createTelegramUser } = require("../bot");

router.post("/webhook", createTelegramUser);

module.exports = router;
