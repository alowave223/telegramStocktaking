import { Command } from "./baseCommand";
import type { Context } from "telegraf";
import { Markup } from "telegraf";
import type Bot from "../client";

export class GetMaterials implements Command {
  public commandName: string = "getMaterials";

  constructor(private botInstance: Bot) {}

  public async handle(context: Context): Promise<void> {
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('Жопа', 'button_1')],
      [Markup.button.callback('Моча', 'button_2')],
    ]);

    context.reply("Да конэшно я пукнула", keyboard);
  }
}
