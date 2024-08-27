const TelegramBot = require("node-telegram-bot-api");
const asyncErrorHandler = require("./utils/asyncErrorHandler");
const User = require("./models/user");
const ShortUId = require("short-unique-id");
const axios = require("axios");
require("dotenv").config();

exports.createTelegramUser = asyncErrorHandler(async (req, res) => {
  res.status(200).json({
    message: "Request received",
  });

  const { message } = req.body;

  // const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;
  // const responseText =
  //   "Collect rewards 🪙 on Kelpie Network by climbing 🪜 up the ranks, doing tasks and playing fun games 🎲. We are working on a whole new ecosystem 🚀🌍 and we are glad that you are part of it! 🤝🎉";

  if (message && message.text.startsWith("/start ")) {
    const chatId = message.chat.id;
    const username = message.chat.username;
    const referCode = message.text.split(" ")[1] || "PhMUEE1icc";

    const user = await User.findOne({ chatId });
    const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
    const inlineKeyboard = {
      inline_keyboard: [
        [{ text: "Open Kelpie App", web_app: { url: "https://kelpienetwork.com" } }],
      ],
    };

    if (!user) {
      const referrer = await User.findOne({ referralId: referCode });

      const createReferralId = new ShortUId({ length: 10 });
      const referralId = createReferralId.rnd();

      const newUser = new User({
        username,
        referralId,
        referrerId: referCode,
        chatId,
      });

      referrer.referralCount += 1;
      await newUser.save();
      await referrer.save();

      console.log("User created!");
      // Respond with a message and inline button

      bot.sendMessage(
        chatId,
        "Collect rewards 🪙 on Kelpie Network by climbing 🪜 up the ranks, doing tasks and playing fun games 🎲. We are working on a whole new ecosystem 🚀🌍 and we are glad that you are part of it! 🤝🎉",
        {
          reply_markup: inlineKeyboard,
        }
      );

      return res.status(200);
    }
    bot.sendMessage(
      chatId,
      "Collect rewards 🪙 on Kelpie Network by climbing 🪜 up the ranks, doing tasks and playing fun games 🎲.\n\n We are working on a whole new ecosystem 🚀🌍 and we are glad that you are part of it! 🤝🎉",
      {
        reply_markup: inlineKeyboard,
      }
    );
    return res.status(200);
  }
});

// next();
// const newUser = await User.create({ username });
// res.status(200).json(newUser);
// const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
// bot.onText(/\/start (.+)/, async (msg, match) => {
//   const chatId = msg.chat.id;
//   const referrerId = match[1];
//   const username = msg.chat.username;
//   let user = await User.findOne({ chatId, username });
//   if (!user) {
//     // Generate a unique referral ID
//     const createReferralId = new ShortUId({ length: 22 });
//     const referralId = createReferralId.rnd();
//     // New user
//     user = new User({
//       chatId,
//       username, // Get the username from the message object
//       referralId,
//       referrerId,
//     });
//     await user.save();
//     if (referralId !== chatId.toString()) {
//       // Increment referrals for the referrer
//       let referrer = await User.findOne({ referralId: referrerId });
//       if (referrer) {
//         referrer.referralCount += 1;
//         referrer.referralCount += 1;
//         await referrer.save();
//       }
//     }
//   }
//   bot.sendMessage(
//     chatId,
//     `Hello ${msg.chat.username}! Welcome to Kelpie Network. Your referral link is: t.me/KelpieNetworkBot?start=${user.referralId}`
//   );
// });

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const App = () => {
//   const [username, setUsername] = useState("");
//   const [referralId, setReferralId] = useState("");
//   const [verified, setVerified] = useState(false);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const username = params.get("username");
//     const referralId = params.get("referralId");

//     setUsername(username);
//     setReferralId(referralId);

//     if (username && referralId) {
//       axios
//         .post("https://your-server-url/verify", { username, referralId })
//         .then((response) => {
//           if (response.data.success) {
//             setVerified(true);
//           } else {
//             alert(response.data.message);
//           }
//         })
//         .catch((error) => {
//           console.error(error);
//           alert("An error occurred. Please try again.");
//         });
//     }
//   }, []);

//   if (!verified) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h1>Welcome, {username}!</h1>
//       <p>Your referral ID is: {referralId}</p>
//       {/* Your app content */}
//     </div>
//   );
// };

// export default App;
