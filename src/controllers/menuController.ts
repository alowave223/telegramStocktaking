import { Markup, type Context } from "telegraf";
import Bot from "../client";

export class MenuController {
  constructor(botInstance: Bot) {}

  public async initiateMenu(context: Context): Promise<void> {
    let currentMenu = this.botInstance.activeMenus.get(context.from!.id);

    if (currentMenu) await context.deleteMessage(currentMenu);

    currentMenu = context.message!.message_id + 1;
    this.botInstance.activeMenus.set(context.from!.id, currentMenu);

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("Жопа", "button_test:" + currentMenu)],
      [Markup.button.callback("Моча", "button_test:" + currentMenu)],
    ]);

    await context.deleteMessage();
    await context.reply("Базове менню керування ikigai.tp 💖", keyboard);
  }
}
