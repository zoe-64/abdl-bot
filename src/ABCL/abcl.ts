import { AssetGet, type API_Character } from "bc-bot";
import { api } from "..";
import { grammar } from "../tracery";
import { getDisplayName } from "../util";

type MetabolismSetting = "Disabled" | "Normal" | "Slow" | "Fast" | "Faster" | "Fastest";
type MiniGameDifficulty = "Easy" | "Normal" | "Hard" | "Impossible";

type DiaperChangePromptSetting = "Deny" | "Ask" | "Allow";
interface ModSettings {
  MiniGameDifficulty: MiniGameDifficulty;
  PauseStats: boolean;
  PeeMetabolism: MetabolismSetting;
  PoopMetabolism: MetabolismSetting;
  MentalRegressionModifier: MetabolismSetting;
  OnDiaperChange: DiaperChangePromptSetting;
  OpenRemoteSettings: boolean;
  LockedOutOfSettings: boolean;
  ExpressionsByActivities: boolean;
  VisibleMessages: {
    changeDiaper: boolean;
    checkDiaper: boolean;
    lickPuddle: boolean;
    wetDiaper: boolean;
    wetClothing: boolean;
    soilDiaper: boolean;
    soilClothing: boolean;
    usePotty: boolean;
    useToilet: boolean;
    wipePuddle: boolean;
    statusMessages: boolean;
    playerActivity: boolean;
    pauseStats: boolean;
  };
  StatusMessages: Partial<Record<keyof ModStats, boolean>>;
  DisableWettingLeaks: boolean;
  DisableSoilingLeaks: boolean;
  DisableClothingStains: boolean;
  DisableDiaperStains: boolean;
  DisableParticles: boolean;

  AccidentsByActivities: boolean;
  AccidentAutopilot: boolean;
  ShowOwnBadges: boolean;

  CanChangeSelf: boolean;
  CanChangeDiapers: boolean;
  CanUseBathroomWithDiaper: boolean;
  CanCheckDiaperWithRestraints: boolean;
  CanUseToilet: boolean;
  CanUsePotty: boolean;
  UnPauseStatsWhenDiapered: boolean;

  MiniGameAudioMuted: boolean;
  UseNewMiniGame: boolean;
}
interface ModStats {
  PuddleSize: {
    value: number;
  };
  Bladder: {
    value: number;
    size: number;
  };
  Bowel: {
    value: number;
    size: number;
  };
  Soiliness: {
    value: number;
  };
  Wetness: {
    value: number;
  };
  WaterIntake: {
    value: number;
  };
  FoodIntake: {
    value: number;
  };
  MentalRegression: {
    value: number;
  };
  Incontinence: {
    value: number;
  };
  MinigameStatistics: {
    Wet: {
      Total: number;
      Success: number;
    };
    Mess: {
      Total: number;
      Success: number;
    };
  };
}

export interface ABCLModStorageModel {
  Version?: string;
  Settings: ModSettings;
  SettingPermissions: Record<SettingKeys, boolean>;
  Stats: ModStats;
}
type SettingKeys = Exclude<keyof ModSettings, "VisibleMessages"> | keyof ModSettings["VisibleMessages"];

export const MetabolismSettings = Object.freeze({
  Disabled: "Disabled",
  Normal: "Normal",
  Slow: "Slow",
  Fast: "Fast",
  Faster: "Faster",
  Fastest: "Fastest",
}) satisfies Record<MetabolismSetting, MetabolismSetting>;

export const DiaperSettingValues = Object.freeze({
  Deny: "Deny",
  Ask: "Ask",
  Allow: "Allow",
}) satisfies Record<DiaperChangePromptSetting, DiaperChangePromptSetting>;
export const MetabolismSettingValues = Object.freeze({
  Disabled: 0,
  Slow: 0.5,
  Normal: 1,
  Fast: 1.5,
  Faster: 2,
  Fastest: 3,
}) satisfies Record<MetabolismSetting, number>;

export const MiniGameDifficultyToNumber = Object.freeze({
  Easy: 3,
  Normal: 5,
  Hard: 7,
  Impossible: 10,
}) satisfies Record<MiniGameDifficulty, number>;

export const defaultSettings: ModSettings = {
  MiniGameDifficulty: "Normal",
  PauseStats: false,
  PeeMetabolism: MetabolismSettings.Normal,
  PoopMetabolism: MetabolismSettings.Normal,
  MentalRegressionModifier: MetabolismSettings.Normal,
  OpenRemoteSettings: false,
  LockedOutOfSettings: false,
  DisableWettingLeaks: false,
  DisableSoilingLeaks: true,
  OnDiaperChange: DiaperSettingValues.Ask,
  VisibleMessages: {
    changeDiaper: true,
    checkDiaper: true,
    lickPuddle: true,
    wetDiaper: true,
    wetClothing: true,
    soilDiaper: true,
    soilClothing: true,
    usePotty: true,
    useToilet: true,
    wipePuddle: true,
    statusMessages: false,
    playerActivity: true,
    pauseStats: false,
  },
  StatusMessages: {
    Bladder: true,
    Bowel: true,
    Soiliness: true,
    Wetness: true,
    MentalRegression: true,
    Incontinence: true,
    PuddleSize: true,
  },
  DisableClothingStains: false,
  DisableDiaperStains: false,
  AccidentsByActivities: true,
  ExpressionsByActivities: false,
  AccidentAutopilot: false,
  ShowOwnBadges: true,

  CanChangeSelf: true,
  CanUseBathroomWithDiaper: false,
  CanCheckDiaperWithRestraints: true,
  CanUseToilet: true,
  CanUsePotty: true,
  CanChangeDiapers: true,
  DisableParticles: false,
  UnPauseStatsWhenDiapered: true,
  MiniGameAudioMuted: false,
  UseNewMiniGame: true,
};

export const defaultStats: ModStats = {
  PuddleSize: {
    value: 0,
  },
  Bladder: {
    value: 0, // in ml
    size: 300, // in ml, quite arbitrary
  },
  Bowel: {
    value: 0, // in ml
    size: 200, // in ml
  },
  Soiliness: {
    value: 0, // in ml
  },
  Wetness: {
    value: 0, // in ml
  },
  WaterIntake: {
    value: 300 / 20,
  },
  FoodIntake: {
    value: 200 / 60,
  },
  Incontinence: {
    value: 0,
  },
  MentalRegression: {
    value: 0,
  },
  MinigameStatistics: {
    Wet: {
      Total: 0,
      Success: 0,
    },
    Mess: {
      Total: 0,
      Success: 0,
    },
  },
};
export const defaultSettingPermissions: ABCLModStorageModel["SettingPermissions"] = {
  MiniGameDifficulty: false,
  PeeMetabolism: false,
  PoopMetabolism: false,
  MentalRegressionModifier: false,
  OnDiaperChange: false,
  PauseStats: false,
  DisableWettingLeaks: false,
  DisableSoilingLeaks: false,
  DisableClothingStains: false,
  DisableDiaperStains: false,
  AccidentsByActivities: false,
  ExpressionsByActivities: false, // Experimental / buggy

  changeDiaper: false,
  checkDiaper: false,
  lickPuddle: false,
  wetDiaper: false,
  wetClothing: false,
  soilDiaper: false,
  soilClothing: false,
  usePotty: false,
  useToilet: false,
  wipePuddle: false,
  statusMessages: false,
  playerActivity: false,

  pauseStats: false,
  OpenRemoteSettings: false,
  LockedOutOfSettings: false,
  StatusMessages: false,
  AccidentAutopilot: false,
  ShowOwnBadges: false,
  CanChangeSelf: false,
  CanUseBathroomWithDiaper: false,
  CanCheckDiaperWithRestraints: false,
  CanUseToilet: false,
  CanUsePotty: false,
  CanChangeDiapers: false,
  DisableParticles: false,
  UnPauseStatsWhenDiapered: true,
  MiniGameAudioMuted: false,
  UseNewMiniGame: false,
};
const BotABCL: ABCLModStorageModel = {
  Settings: defaultSettings,
  Stats: defaultStats,
  SettingPermissions: defaultSettingPermissions,
  Version: "2.3.19",
};
export const ABCL = {
  players: new Map<number, ABCLModStorageModel>(),
  onSync(sender: API_Character, { Settings, Stats, Version, SettingPermissions }: ABCLModStorageModel) {
    if (!api.chatRoom) return;
    if (sender.MemberNumber == api.Player.MemberNumber) return;
    const index = api.chatRoom.characters.findIndex((character) => character.MemberNumber === sender.MemberNumber);
    if (index === -1) return console.warn(`Could not find character with member number ${sender}`);
    if (api.chatRoom.characters[index] == null) return;
    this.players.set(sender.MemberNumber, { Stats, Version, SettingPermissions, Settings });
  },
  sync(memberNumber?: number) {
    api.SendMessage("Hidden", "ABCL:sync", memberNumber, [
      {
        rEventArg: JSON.stringify([BotABCL]),
      },
    ]);
  },
  async changeDiaper(player: API_Character, abcl: ABCLModStorageModel): Promise<boolean> {
    if (abcl.Settings.OnDiaperChange === "Deny") return false;
    if (player.Appearance.InventoryGet("ItemDevices")) return false;
    api.SendMessage("Chat", grammar.flatten("#change_intro_origin#"));
    api.SendMessage(
      "Emote",
      `*${getDisplayName(api.Player)}` + grammar.flatten(`[name:${getDisplayName(player)}] #change_lift_up_origin#`),
    );
    player.Appearance.AddItem(AssetGet("ItemDevices", "ChangingTable"));
    await new Promise((resolve) => setTimeout(resolve, 5000));
    api.SendMessage(
      "Emote",
      `*${getDisplayName(api.Player)}` +
        grammar.flatten(`[name:${getDisplayName(player)}] #change_remove_diaper_origin#`),
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    api.SendMessage(
      "Emote",
      `*${getDisplayName(api.Player)}` + grammar.flatten(`[name:${getDisplayName(player)}] #change_wipe_origin#`),
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    api.SendMessage(
      "Emote",
      `*${getDisplayName(api.Player)}` +
        grammar.flatten(`[name:${getDisplayName(player)}] #change_slide_diaper_origin#`),
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    api.SendMessage(
      "Emote",
      `*${getDisplayName(api.Player)}` +
        grammar.flatten(`[name:${getDisplayName(player)}] #change_seal_diaper_origin#`),
    );
    api.SendMessage("Hidden", "ABCLMsg", player.MemberNumber, [
      {
        type: "changeDiaper-pending",
        data: { force: true },
      },
    ]);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    api.SendMessage("Chat", grammar.flatten(`[name:${getDisplayName(player)}] #change_end_origin#`));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    player.Appearance.RemoveItem("ItemDevices");
    return true;
  },
  wipePuddle(memberNumber: number) {
    api.SendMessage("Hidden", "ABCLMsg", memberNumber, [
      {
        type: "wipe-puddle",
        data: {},
      },
    ]);
  },
  doActivity(memberNumber: number, action: "diaper-rub-front" | "diaper-rub-back" | "diaper-pat-back") {
    api.SendMessage("Hidden", "ABCLMsg", memberNumber, [
      {
        type: action,
        data: {},
      },
    ]);
  },
};
export function initABCL() {
  api.on("Message", ({ message, sender }) => {
    if (message.Content === "ABCL:sync") {
      try {
        const entry = message.Dictionary?.[0] as unknown as {
          rEventArg: string;
        } | null;
        if (!entry) return;
        const data = JSON.parse(entry.rEventArg) as [ABCLModStorageModel];
        ABCL.onSync(sender, data[0]);
      } catch (error) {
        console.error(error);
      }
    }
  });

  api.on("CharacterEntered", (sender) => {
    ABCL.sync(sender.MemberNumber);
  });
}
