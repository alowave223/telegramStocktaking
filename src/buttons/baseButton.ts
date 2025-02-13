import { type Context } from "telegraf";

export interface BaseButton {
  buttonId: string;

  handle(context: Context): Promise<void>;
}