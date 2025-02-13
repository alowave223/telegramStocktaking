import { Context } from "telegraf";
import Bot from "../client";
import { Command } from "./baseCommand";

export class StartCommand implements Command {
  public commandName: string = "start";

  constructor(private botInstance: Bot) {}

  public async handle(context: Context): Promise<void> {
    await context.deleteMessage()
  }
}
