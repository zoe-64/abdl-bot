// this is a milkshake shop
// players can buy items, and apply for work

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export let botData: {
  disabledBy: number[];
  money: number;
} = {
  disabledBy: [],
  money: 0,
} as const;
export type BotData = typeof botData;
const dbPath = join(__dirname, "data.json");

export async function saveData(data: BotData): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await writeFile(dbPath, jsonString, "utf-8");
  } catch (error) {
    console.error("❌ Failed  to save data:", error);
  }
}
export async function loadData(): Promise<BotData | null> {
  try {
    const rawData = await readFile(dbPath, "utf-8");
    const data: BotData = JSON.parse(rawData) as BotData;
    console.log(data);
    botData = data;
    return data;
  } catch (error) {
    console.warn("⚠️ Could not read data file.");
    return null;
  }
}
