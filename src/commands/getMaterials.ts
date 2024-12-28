import { Command } from "./baseCommand";
import { type Context } from "telegraf";
import type Bot from "../client";

export class GetMaterials implements Command {
  public commandName: string = "getMaterials";

  constructor(private botInstance: Bot) {

  }

  public async handle(context: Context): Promise<void> {
    context.reply("Сасі мой хуй!!!");
  }
}