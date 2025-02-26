import 'dotenv/config'
import Bot from "./client";
import sqlite3 from "sqlite3";
import { initiateMenu } from './controllers/menuController';

const bot = new Bot({
  token: process.env.TOKEN!,
  databaseFile: "main.db",
  databaseDriver: sqlite3.Database,
});

bot.botInstance.start(initiateMenu)
bot.run();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;