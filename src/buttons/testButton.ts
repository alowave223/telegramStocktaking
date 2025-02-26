import { type Context } from "telegraf";
import { BaseButton } from "./baseButton";

export class TestButton implements BaseButton {
  buttonId = "button_test";

  async handle(context: Context): Promise<void> {
    context.reply("Test");
  }
}