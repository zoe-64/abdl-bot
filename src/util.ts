import assert from "assert";
import type { API_Character } from "bc-bot";
import fs from "fs";
import path from "path";
export function getDisplayName(character: API_Character) {
  let name = character.Name;
  if (character.NickName && character.NickName !== "") name = character.NickName;
  return capitalizeFirstLetter(name);
}
export function capitalizeFirstLetter(text: string) {
  if (text.length === 0) return "";
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const itemI = shuffled[i];
    const itemJ = shuffled[j];

    if (itemI !== undefined && itemJ !== undefined) {
      shuffled[i] = itemJ;
      shuffled[j] = itemI;
    }
  }

  return shuffled;
}

const filePath = path.join(__dirname, "logs", "reports.txt");
export function writeToReportFile(data: string): void {
  const dirName: string = path.dirname(filePath);

  try {
    if (!fs.existsSync(dirName)) {
      console.log(`Creating directory: ${dirName}`);
      fs.mkdirSync(dirName, { recursive: true });
    }

    fs.appendFileSync(filePath, `${data}\n`, "utf8");
  } catch (err) {
    console.error(`An error occurred while writing to the file: ${err}`);
  }
}

export function generateName(): string {
  const consonants = "bcdfghjklmnprstvw";
  const vowels = "aeiou";
  let name = "";
  for (let i = 0; i < 6; i++) {
    name +=
      i % 2 === 0
        ? consonants[Math.floor(Math.random() * consonants.length)]
        : vowels[Math.floor(Math.random() * vowels.length)];
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number; // Decimal color code (e.g., 0x5865f2)
  fields?: DiscordEmbedField[];
  timestamp?: string; // ISO 8601 string
  footer?: {
    text: string;
    icon_url?: string;
  };
}
interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  embeds: DiscordEmbed[];
}

async function sendDiscordWebhook(webhookUrl: string, payload: DiscordWebhookPayload): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to send Discord webhook:", error);
    throw error;
  }
}

export async function sendWebhookReport(message: string, username: string): Promise<void> {
  const hookUrl = process.env.SUGGESTION_HOOK_URL;
  assert(hookUrl, "SUGGESTION_HOOK_URL is not set");

  const payload: DiscordWebhookPayload = {
    username,
    embeds: [
      {
        title: "New Suggestion / Report",
        description: message,
        color: 0x5865f2,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await sendDiscordWebhook(hookUrl, payload);
  console.log("Suggestion report sent successfully!");
}

export async function sendDiscordError(title: string, error: unknown): Promise<void> {
  const hookUrl = process.env.ERROR_HOOK_URL;
  assert(hookUrl, "ERROR_HOOK_URL is not set");

  const errObj = error instanceof Error ? error : new Error(String(error));

  const fields: DiscordEmbedField[] = [
    {
      name: "Error Message",
      value: `\`\`\`\n${errObj.message}\n\`\`\``,
    },
    {
      name: "Stack Trace",
      value: `\`\`\`javascript\n${(errObj.stack || "No stack trace").slice(0, 1000)}\n\`\`\``,
    },
  ];

  const payload: DiscordWebhookPayload = {
    embeds: [
      {
        title: `${title}`,
        color: 0xff0000,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await sendDiscordWebhook(hookUrl, payload);
  console.log("Error report sent successfully!");
}
