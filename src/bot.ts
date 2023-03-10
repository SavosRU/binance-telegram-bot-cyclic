'use strict';
// const ccxt = require ('ccxt');
import ccxt from "ccxt";
import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import express from "express";

const TOKEN   = process.env.TELEGRAM_TOKEN || "";
const KEY     = process.env.API_KEY || "";
const SECRET  = process.env.API_SECRET || "";

const binance = new ccxt.binanceusdm ({
  apiKey: KEY,
  secret: SECRET
});

const getBalance = async () => {
  console.log("Checking Binance Balance...");
  console.log("***********************");
  console.log("API_KEY: " + KEY);
  console.log("CCXT Binance API_KEY: " + binance.apiKey);
  console.log("API_SECRET:" + SECRET);
  console.log("CCXT Binance API_SECRET:" + binance.secret);
  console.log("***********************");
  try {
    const balance = await binance.fetchBalance();
    console.log ("Balance: ", balance.USDT);
    return balance.USDT; 
  } catch (error) {
    console.log("Error:", error);
  }
};

const getOrders = async () => {
  console.log("Checking Binance Orders...");
  console.log("***********************");
  console.log("API_KEY: " + KEY);
  console.log("CCXT Binance API_KEY: " + binance.apiKey);
  console.log("API_SECRET:" + SECRET);
  console.log("CCXT Binance API_SECRET:" + binance.secret);
  console.log("***********************");
  try {
    const orders = await binance.fetchOrders();
    console.log ("Orders: ", orders);
    return orders; 
  } catch (error) {
    console.log("Error:", error);
  }
};

const getPositions = async () => {
  console.log("Checking Binance Positions...");
  console.log("***********************");
  console.log("API_KEY: " + KEY);
  console.log("CCXT Binance API_KEY: " + binance.apiKey);
  console.log("API_SECRET:" + SECRET);
  console.log("CCXT Binance API_SECRET:" + binance.secret);
  console.log("***********************");
  const poses = [{}];
  try {
    const positions = await binance.fetchPositions();
    positions.forEach(function (pos : any) {
      if ( pos.contracts > 0) {
        // console.log ("Positions: ", pos.contracts, pos.info);
        poses.push(pos.info);
      }
    });
    // console.log ("Open Positions: ", poses);
    return poses;
  } catch (error) {
    console.log("Error:", error);
  }
};

// (async function () {
//   // await getBalance();
//   // await getOrders();
//   // await getPositions();
// }) ();

// Create a bot using the Telegram token
const bot = new Bot(TOKEN);

// Handle the /yo command to greet the user
bot.command("yo", (ctx) => ctx.reply(`Yo ${ctx.from?.username}`));

// Handle the /about command
const aboutUrlKeyboard = new InlineKeyboard().url(
  "Host your own bot for free.",
  "https://cyclic.sh/"
);

const buttonsKeyboard = new InlineKeyboard()
.text("?????????????????? ??????????????", "check_positions").row()
// .text("?????????????????? ????????????", "check_orders").row()
.text("?????????????????? ????????????", "check_balance").row()
// .text("...????????...", "check_info").row();

// Suggest commands in the menu
bot.api.setMyCommands([
  {
    command: "start",
    description: "???????????? ??????????????"
  },
  // {
  //   command: "balance",
  //   description: "?????????????????? ????????????"
  // },
  // {
  //   command: "orders",
  //   description: "?????????????????? ???????????????????? ????????????",
  // },
  // {
  //   command: "positions",
  //   description: "?????????????????? ???????????????? ??????????????",
  // }
]);

// Handle all other messages and the /start command


const replyWithIntro = (ctx: any) => {
  const introductionMessage = `
    <b>????????????, ${ctx.from?.username}!</b>
?? ????????????????-?????? ?????? ????????????????
?????????????????? ???????????? ???????????????? ????
    <u><b>Binance USDT-Futures!</b></u>`;

  ctx.reply(introductionMessage, {
    // reply_markup: aboutUrlKeyboard,
    reply_markup: buttonsKeyboard,
    parse_mode: "HTML",
  })
  console.log("Bot have got START-command!");
  console.log("***********************");
  console.log("API_KEY: " + KEY);
  console.log("CCXT Binance API_KEY: " + binance.apiKey);
  console.log("API_SECRET:" + SECRET);
  console.log("CCXT Binance API_SECRET:" + binance.secret);
  console.log("***********************");

};

const replyWithButtons = (ctx: any) => {
  ctx.reply("?????????????????? ????????????????:", {
    reply_markup: buttonsKeyboard,
    parse_mode: "HTML",
  });
  console.log("Telegram Bot started!");
  console.log("***********************");
  console.log("API_KEY: " + KEY);
  console.log("CCXT Binance API_KEY: " + binance.apiKey);
  console.log("API_SECRET:" + SECRET);
  console.log("CCXT Binance API_SECRET:" + binance.secret);
  console.log("***********************");
};

bot.command("start", replyWithIntro);
// bot.on("message", replyWithIntro);
bot.on("message", replyWithButtons);

// Wait for click events with specific callback data.
bot.callbackQuery("check_positions", async (ctx) => {
  // await ctx.answerCallbackQuery({
  //   text: "You were curious, indeed!",
  // });
  const poses = await getPositions();
  // ctx.reply("???????? ???????????? ???????????? [?????????????????? ??????????????]");
  const posSTR = JSON.stringify(poses);
  ctx.reply("???????????????? ??????????????: " + posSTR);
});

bot.callbackQuery("check_balance", async (ctx) => {
  // await ctx.answerCallbackQuery({
  //   text: "You were curious, indeed!",
  // });
  const info = await getBalance();
  const infoSTR = JSON.stringify(info);
  ctx.reply("????????????: " + infoSTR);
});

// bot.callbackQuery("check_info", async (ctx) => {
//   // await ctx.answerCallbackQuery({
//   //   text: "You were curious, indeed!",
//   // });
//   //const info = await getBalance();
//   const infoSTR = JSON.stringify(binance.c);
//   ctx.reply(infoSTR);
// });

// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
    console.log("***********************");
    console.log("API_KEY: " + KEY);
    console.log("CCXT Binance API_KEY: " + binance.apiKey);
    console.log("API_SECRET:" + SECRET);
    console.log("CCXT Binance API_SECRET:" + binance.secret);
    console.log("***********************");
  });
} else {
  // Use Long Polling for development
  bot.start();
}
