const TelegramBot = require("node-telegram-bot-api");
const asyncErrorHandler = require("./utils/asyncErrorHandler");
const User = require("./models/user");
const ShortUId = require("short-unique-id");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

exports.createTelegramUser = asyncErrorHandler(async (req, res) => {
  try {
    const { message } = req.body;

    if (message && message.text.startsWith("/start")) {
      const chatId = message.chat.id;
      const username = message.chat.username;
      const referCode = message.text.split(" ")[1] || "PhMUEE1icc";

      const user = await User.findOne({ chatId });

      const inlineKeyboard = {
        inline_keyboard: [
          [{ text: "Open Kelpie App", web_app: { url: "https://kelpienetwork.com" } }],
        ],
      };

      if (!user?.username) {
        const referrer = await User.findOne({ referralId: referCode });

        const createReferralId = new ShortUId({ length: 10 });
        const referralId = createReferralId.rnd();

        const newUser = new User({
          username,
          referralId,
          referrerId: referCode,
          chatId,
        });

        if (referrer) {
          referrer.referralCount += 1;
          await referrer.save();
        }

        await newUser.save();

        console.log("User created!");

        bot.sendMessage(
          chatId,
          "Collect rewards 🪙 on Kelpie Network by climbing 🪜 up the ranks, doing tasks and playing fun games 🎲. We are working on a whole new ecosystem 🚀🌍 and we are glad that you are part of it! 🤝🎉",
          {
            reply_markup: inlineKeyboard,
          }
        );
      } else {
        bot.sendMessage(
          chatId,
          "Collect rewards 🪙 on Kelpie Network by climbing 🪜 up the ranks, doing tasks and playing fun games 🎲.\n\n We are working on a whole new ecosystem 🚀🌍 and we are glad that you are part of it! 🤝🎉",
          {
            reply_markup: inlineKeyboard,
          }
        );
      }
    }

    // Send the response after processing
    res.status(200).json({ message: "Request processed successfully" });
  } catch (error) {
    console.error("Error handling Telegram request:", error);
    res.status(200).json({ error: "There was a server error" });
  }
});
