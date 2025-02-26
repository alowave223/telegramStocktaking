import { type Context } from "telegraf";

export abstract class BaseButton {
  abstract buttonId: string;

  abstract handle(context: Context): Promise<void>;
}