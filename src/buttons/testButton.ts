import { type Context } from "telegraf";
import { BaseButton } from "./baseButton";

export class TestButton implements BaseButton {
  public buttonId: string = "button_1";

  constructor() {}

  async handle(context: Context): Promise<void> {
    context.reply("Test");
  }
}