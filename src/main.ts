import 'dotenv/config'
import Bot from "./client";
import sqlite3 from "sqlite3";
import { GetMaterials } from "./commands/getMaterials";
import { StartCommand } from './commands/startCommand';

const bot = new Bot({
  token: process.env.TOKEN!,
  databaseFile: "main.db",
  databaseDriver: sqlite3.Database,
});

bot.registerCommands([new GetMaterials(bot)]);
bot.registerStartCommand(new StartCommand(bot));
bot.run();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;