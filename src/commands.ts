import { api, parser } from ".";
import { botData, saveData } from "./data";
import { grammar } from "./tracery";

export function initCommands() {
  parser.register("blacklist", (sender) => {
    botData.disabledBy.push(sender.MemberNumber);
    api.SendMessage(
      "Whisper",
      grammar.flatten("Okay, #pet_name##punctuation# I won't interact with you"),
      sender.MemberNumber,
    );
    saveData(botData);
  });
  parser.register("unblacklist", (sender) => {
    botData.disabledBy = botData.disabledBy.filter((id) => id !== sender.MemberNumber);
    api.SendMessage(
      "Whisper",
      grammar.flatten("Okay, #pet_name##punctuation# I will interact with you now"),
      sender.MemberNumber,
    );
    saveData(botData);
  });
}
