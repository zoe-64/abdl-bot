import assert from "assert";
import type { API_Character } from "bc-bot";
import { API_Connector, AssetGet, CommandParser } from "bc-bot";
import dotenv from "dotenv";
import type { ABCLModStorageModel } from "./ABCL/abcl";
import { ABCL, initABCL } from "./ABCL/abcl";
import { getPlayerDiaperSize, hasDiaper } from "./ABCL/util";
import { initCommands } from "./commands";
import { botData, loadData, saveData } from "./data";
import { hasPermission as hasPermissions } from "./permission";
import { grammar } from "./tracery";
import { getDisplayName, sendDiscordError } from "./util";
dotenv.config();

assert(process.env.USERNAME, "USERNAME is not set");
assert(process.env.PASSWORD, "PASSWORD is not set");
assert(process.env.ROOMNAME, "ROOMNAME is not set");
assert(process.env.DEV, "DEV is not set");
assert(process.env.SUGGESTION_HOOK_URL, "SUGGESTION_HOOK_URL is not set");

export const api = new API_Connector(
  "https://bondage-club-server.herokuapp.com/",
  process.env.USERNAME,
  process.env.PASSWORD,
  "live",
);
const join = true;
async function rejoin() {
  if (api.chatRoom) api.ChatRoomLeave();
  assert(process.env.ROOMNAME, "ROOMNAME is not set");
  if (join) {
    await api.ChatRoomJoin(process.env.ROOMNAME);
  } else {
    await api.joinOrCreateRoom({
      Name: process.env.ROOMNAME,
      Description: "",
      Background: "Nursery",
      Access: ["All"],
      Visibility: ["All"],
      Space: "X",
      Admin: [196823],
      Ban: [],
      Limit: 10,
      BlockCategory: [],
      Game: "",
      Language: "EN",
      MapData: {
        Type: "Never",
      },
      ...(process.env.DEV === "true"
        ? {
            Visibility: [],
          }
        : {}),
    });
  }

  ABCL.sync();
}
rejoin();
const ADULT_PATTERNS: RegExp[] = [
  // Matches: "I'm not little", "I am not a little kid"
  /(?:\bi\b|\bim\b)?(?:\s+\w+){0,4}\s*\bnot\b(?:\s+\w+){0,4}\s*\blittle\b/i,

  // Matches: "I'm not a baby", "I not bab"
  /(?:\bi\b|\bim\b)?(?:\s+\w+){0,4}\s*\bnot\b(?:\s+\w+){0,4}\s*\bbab/i,

  // Matches: "I am an adult", "I'm an adult"
  /(?:\bi\b|\bim\b)?(?:\s+\w+){0,4}\s*\ban\b(?:\s+\w+){0,4}\s*\badult\b/i,

  // Matches: "I am a big girl", "I'm a big girl"
  /(?:\bi\b|\bim\b)?(?:\s+\w+){0,4}\s*\ba\b(?:\s+\w+){0,4}\s*\bbig\b(?:\s+\w+){0,4}\s*\bgirl\b/i,

  // Matches: "I am a big boy", "I'm a big boy"
  /(?:\bi\b|\bim\b)?(?:\s+\w+){0,4}\s*\ba\b(?:\s+\w+){0,4}\s*\bbig\b(?:\s+\w+){0,4}\s*\bboy\b/i,

  // Matches: "I don't wear diapers", "I dont diaper"
  /(?:\bi\b|\bim\b)?(?:\s+\w+){0,4}\s*\bdont\b(?:\s+\w+){0,4}\s*\bdiaper/i,
];

function containsAdultPhrase(input: string): boolean {
  // Normalize punctuation and apostrophes first
  const cleaned = input
    .toLowerCase()
    .replaceAll(/'/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

  return ADULT_PATTERNS.some((pattern) => pattern.test(cleaned));
}
export const parser = new CommandParser(api);

async function main() {
  process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await saveData(botData);
    await sendDiscordError("Uncaught Exception", err);
  });

  process.on("unhandledRejection", async (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
    await sendDiscordError("Unhandled Rejection Detected", reason);
  });

  await loadData();
  api.on("Message", ({ message, sender }) => {
    if (message.Type === "Chat") {
      if (containsAdultPhrase(message.Content.toLowerCase().trim()) && !hasDiaper(sender)) {
        const panties = sender.Appearance.InventoryGet("Panties");
        const pelvis = sender.Appearance.InventoryGet("ItemPelvis");

        if (!panties) {
          sender.Appearance.AddItem(AssetGet("Panties", "Diapers4"));
          api.SendMessage(
            "Emote",
            `*${getDisplayName(api.Player)}` +
              grammar.flatten(`[name:${getDisplayName(sender)}] #change_slide_diaper_origin#`),
          );
        } else if (!pelvis) {
          sender.Appearance.AddItem(AssetGet("ItemPelvis", "UntrainersThin"));
          api.SendMessage(
            "Emote",
            `*${getDisplayName(api.Player)}` +
              grammar.flatten(`[name:${getDisplayName(sender)}] #change_slide_diaper_origin#`),
          );
        }
        api.SendMessage("Chat", grammar.flatten("#little_denial_origin#"));
        return;
      }
    }

    if (message.Type === "Hidden" && message.Content === "ECHO_INFO2") {
      api.SendMessage("Hidden", "ECHO_INFO2", sender.MemberNumber, [
        {
          Type: "ECHO_INFO2",
          Content: {
            服装拓展: {
              version: "1.131.0",
              beta: false,
            },
          },
        },
      ]);
    }
  });
  initABCL();
  initCommands();
  setTimeout(() => {
    api.setBotDescription(`
This is a bot, developed by Zoe, author of ABCL.
It may at times do things that you might not appreciate, 
if you want it to not interact with you then you can use:
/bot blacklist - to blacklist 
/bot unblacklist - to unblacklist

Currently it:
Changes diapers
Rubs diapers / Teases babies
Wipes puddles
Puts padding on babies that are in denial (i.e "I'm a big girl") 
`);
    loop();
  }, 2500);
}

main();

function isInDirtyDiaper(player: API_Character, abcl: ABCLModStorageModel): boolean {
  if (!hasDiaper(player)) {
    return false;
  }
  const size = getPlayerDiaperSize(player);
  const wetness = abcl.Stats.Wetness.value / size;
  const soiliness = abcl.Stats.Soiliness.value / size;
  return wetness > 0.7 || soiliness > 0.6;
}
function isInPuddle(player: API_Character, abcl: ABCLModStorageModel): boolean {
  return abcl.Stats.PuddleSize.value > 0;
}

async function handleChangeQueue(player: API_Character): Promise<boolean> {
  if (!player) return false;
  if (!hasPermissions(player)) return false;
  const abcl = ABCL.players.get(player.MemberNumber);
  if (!player || !abcl) {
    return false;
  }
  const hasPuddle = isInPuddle(player, abcl) && Math.random() > 0.1;
  if (hasPuddle) {
    api.SendMessage("Chat", grammar.flatten("#wipe_puddle_origin#"));
    // | "Frown" | "Sad" | "Pained" | "Angry" | "HalfOpen" | "Open" | "Ahegao" | "Moan" | "TonguePinch" | "LipBite" | "Happy" | "Devious" | "Laughing" | "Grin" | "Smirk" | "Pout"
    api.Player.SetExpression("Mouth", "Happy");
    ABCL.wipePuddle(player.MemberNumber);
  }

  if (isInDirtyDiaper(player, abcl)) {
    api.Player.SetExpression("Mouth", "Happy");
    return await ABCL.changeDiaper(player, abcl);
  }
  if (hasPuddle) return true;

  if (hasDiaper(player) && Math.random() < 0.1) {
    const size = getPlayerDiaperSize(player);
    const wetness = abcl.Stats.Wetness.value / size;
    const soiliness = abcl.Stats.Soiliness.value / size;

    if (wetness < 0.3 && soiliness < 0.3) {
      api.SendMessage("Chat", grammar.flatten("#patting_dry_diaper_origin#"));
      api.Player.SetExpression("Mouth", "LipBite");
      ABCL.doActivity(player.MemberNumber, "diaper-pat-back");
      return true;
    }
    if (wetness > 0.3 && wetness > soiliness) {
      api.SendMessage("Chat", grammar.flatten("#tease_wet_diaper_origin#"));
      api.Player.SetExpression("Mouth", "Smirk");
      ABCL.doActivity(player.MemberNumber, "diaper-rub-front");
      return true;
    }

    if (soiliness > 0.3 && soiliness > wetness) {
      api.SendMessage("Chat", grammar.flatten("#tease_messy_diaper_origin#"));
      api.Player.SetExpression("Mouth", "Smirk");
      ABCL.doActivity(player.MemberNumber, "diaper-rub-back");
      return true;
    }
  }
  return false;
}

async function loop() {
  console.log("loop");
  if (!api.chatRoom?.characters) return setTimeout(loop, 1000);
  if (api.Player.IsRestrained()) {
    api.Player.SetExpression("Mouth", "Pout");
    api.Player.Appearance.Appearance.some((item) => {
      const asset = item.getAssetDef();
      if ((asset?.Difficulty ?? 0) > 5) {
        api.Player.Appearance.RemoveItem(item.Group);
        return true;
      }
      return false;
    });
    await new Promise((resolve) => setTimeout(resolve, 30000));
    loop();
    return;
  }
  api.Player.SetActivePose(["BaseLower", "BaseUpper"]);
  const shuffled = [...api.chatRoom.characters];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // @ts-expect-error this is not gonna fail
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  for (const character of shuffled) {
    const success = await handleChangeQueue(character);
    console.log(character.Name, success);
    if (success) await new Promise((resolve) => setTimeout(resolve, 30000));
  }
  await new Promise((resolve) => setTimeout(resolve, 30000));
  loop();
}
