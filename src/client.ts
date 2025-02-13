import type { CallbackQuery, Update } from "@telegraf/types";
import type { Command } from "./commands/baseCommand";
import { Context, Telegraf } from "telegraf";
import { Database } from "sqlite";
import { existsSync } from "fs";

export default class Bot {
  private firstLaunch: boolean = false;
  private commands: Command[] = [];
  private databaseDriver: any;
  private databaseFile: string;

  public botToken: string;
  public botInstance: Telegraf<Context<Update>>;
  public databaseInstance: Database;

  constructor(options: {
    token: string;
    databaseFile: string;
    databaseDriver: any;
  }) {
    this.botToken = options.token;
    this.databaseFile = options.databaseFile;
    this.databaseDriver = options.databaseDriver;

    this.botInstance = new Telegraf(this.botToken);
    this.databaseInstance = new Database({
      filename: this.databaseFile,
      driver: this.databaseDriver,
    });

    this.registerButtonHandlers();
  }

  public async run() {
    console.log("Starting bot instance.");

    if (!existsSync("main.db")) this.firstLaunch = true;

    this.botInstance.launch(() => {
      console.log("Connected to Telegram.");
    });

    console.log("Creating connection to database.");

    try {
      await this.databaseInstance.open();
    } catch (err) {
      console.log("Error while connecting to the database.\n\n", err);
      process.emit("SIGTERM");
      process.exit(0);
    }

    console.log("Connected to the database.");

    if (this.firstLaunch) {
      console.log("First launch detected, creating database tables...");

      await this.prepareDbTables();
    }
  }

  public registerCommands(commands: Command[]): void {
    this.commands = commands;

    this.commands.forEach((value) => {
      this.botInstance.command(value.commandName, (context: Context) =>
        value.handle(context)
      );
    });

    console.log(`Registered ${this.commands.length} commands.`);
  }

  public registerStartCommand(command: Command): void {
    this.botInstance.start((context: Context) => command.handle(context));

    console.log(`Registered start command.`);
  }

  public async stop(reason?: string) {
    console.log("Stopping the application...");

    this.botInstance.stop(reason);
    await this.databaseInstance.close();

    console.log("GoodBye!");
  }

  private async prepareDbTables() {
    await this.databaseInstance.run(`
      CREATE TABLE "materials" (
        "name" TEXT NOT NULL,
        "photo" VARCHAR(30) NULL DEFAULT NULL,
        "count" INTEGER NULL DEFAULT NULL,
        "price" INTEGER NOT NULL,
        "primePrice" INTEGER NOT NULL
      );
    `);

    console.log("Succesfully initiated tables.");
  }

  private registerButtonHandlers(): void {
    this.botInstance.action(/button_/, (ctx) => {
      if ('data' in ctx.callbackQuery) {
        const buttonId = ctx.callbackQuery.data;
        ctx.answerCbQuery();

        
      } else {
        ctx.reply('Unsupported type of callbackQuery.')
      }
    });
  }
}
