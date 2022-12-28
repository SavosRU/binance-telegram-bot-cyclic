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
  try {
    const balance = await binance.fetchBalance();
    console.log ("Balance: ", balance.USDT);
    return balance.USDT; 
  } catch (error) {
    console.log("Error:", error);
  }
};

const getOrders = async () => {
  try {
    const orders = await binance.fetchOrders();
    console.log ("Orders: ", orders);
    return orders; 
  } catch (error) {
    console.log("Error:", error);
  }
};

const getPositions = async () => {
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

(async function () {
  await getBalance();
  // await getOrders();
  await getPositions();
}) ();

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
.text("Проверить Позиции", "check_positions").row()
// .text("Проверить Ордера", "check_orders").row()
.text("Проверить Баланс", "check_balance").row()
// .text("...тест...", "check_info").row();

// Suggest commands in the menu
bot.api.setMyCommands([
  {
    command: "start",
    description: "Начать сначала"
  },
  // {
  //   command: "balance",
  //   description: "Проверить баланс"
  // },
  // {
  //   command: "orders",
  //   description: "Проверить отложенные ордера",
  // },
  // {
  //   command: "positions",
  //   description: "Проверить открытые позиции",
  // }
]);

// Handle all other messages and the /start command


const replyWithIntro = (ctx: any) => {
  const introductionMessage = `
    <b>Привет, ${ctx.from?.username}!</b>
Я телеграм-бот для проверки
состояния твоего аккаунта на
    <u><b>Binance USDT-Futures!</b></u>`;

  ctx.reply(introductionMessage, {
    // reply_markup: aboutUrlKeyboard,
    reply_markup: buttonsKeyboard,
    parse_mode: "HTML",
  })
};

const replyWithButtons = (ctx: any) => {
  ctx.reply("Доступные действия:", {
    reply_markup: buttonsKeyboard,
    parse_mode: "HTML",
  });
  console.log("Telegram Bot started!");
  console.log("API_KEY: " + KEY);
  console.log("API_SECRET:" + SECRET);
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
  // ctx.reply("Была нажата кнопка [Проверить позиции]");
  const posSTR = JSON.stringify(poses);
  ctx.reply("Открытые Позиции: " + posSTR);
});

bot.callbackQuery("check_balance", async (ctx) => {
  // await ctx.answerCallbackQuery({
  //   text: "You were curious, indeed!",
  // });
  const info = await getBalance();
  const infoSTR = JSON.stringify(info);
  ctx.reply("Баланс: " + infoSTR);
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
    console.log("API_KEY: " + KEY);
    console.log("API_SECRET:" + SECRET);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
