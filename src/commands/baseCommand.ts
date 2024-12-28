import { type Context } from "telegraf";

export interface Command {
  commandName: string;

  handle(context: Context): Promise<void>;
}