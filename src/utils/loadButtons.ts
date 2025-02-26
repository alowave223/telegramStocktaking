import { BaseButton } from "../buttons/baseButton";
import fs from "fs";
import path from "path";

export default async function loadButtons(baseMap: Map<string, BaseButton>): Promise<Map<string, BaseButton>> {
  const buttonsDir = path.join(__dirname, "../buttons");
  const files = fs.readdirSync(buttonsDir);

  for (const file of files) {
    if (file.endsWith(".js")) {
      const filePath = path.join(buttonsDir, file);
      const module = await import(filePath); // Dynamically import the file

      const ButtonClass = module.default || module[Object.keys(module)[0]];
      const buttonInstance = new ButtonClass();

      if (buttonInstance.buttonId && typeof buttonInstance.handle === "function") {
        baseMap.set(buttonInstance.buttonId, buttonInstance);
      }
    }
  }

  return baseMap;
}