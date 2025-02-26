import type { Update } from "@telegraf/types";
import { Context, Telegraf } from "telegraf";
import { Database } from "sqlite";
import { existsSync } from "fs";
import { BaseButton } from "./buttons/baseButton";
import loadButtons from "./utils/loadButtons";

export default class Bot {
  private firstLaunch: boolean = false;
  private databaseDriver: any;
  private databaseFile: string;
  private buttonsHandlers: Map<string, BaseButton> = new Map();

  public botToken: string;
  public botInstance: Telegraf<Context<Update>>;
  public databaseInstance: Database;
  public activeMenus: Map<number, number> = new Map();

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

    console.log("Getting all buttons handlers.");

    await loadButtons(this.buttonsHandlers);

    console.log(
      "Succesfully added " + this.buttonsHandlers.size + " handlers."
    );
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
    this.botInstance.action(/button_/, async (ctx) => {
      let deleteMessage = undefined;
      
      if ("data" in ctx.callbackQuery) {
        const [buttonId, menuId] = ctx.callbackQuery.data.split(":");
        const activeMenu = this.activeMenus.get(ctx.chat!.id);

        if (!activeMenu || activeMenu !== +menuId)
          this.commands.find(

        const button = this.buttonsHandlers.get(buttonId);
        
        if (button) {
          try {
            await button.handle(ctx);
          } catch (error) {
            console.error("Error handling button action: ", error);
            deleteMessage = await ctx.reply(
              "An error occurred. Please try again."
            );
          }
        } else {
          deleteMessage = await ctx.reply(
            "Oops! Something went really, really wrong!"
          );
        }
      } else {
        deleteMessage = await ctx.reply("Unsupported type of callbackQuery.");
      }
      
      if (deleteMessage)
        setTimeout(
          async () =>
            await this.botInstance.telegram.deleteMessage(
              deleteMessage.chat.id,
              deleteMessage.message_id
            ),
            10000
        );

      ctx.answerCbQuery();
    });
  }
}
