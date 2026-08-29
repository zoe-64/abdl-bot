import type { API_Character } from "bc-bot";
import { AssetGet } from "bc-bot";
import { botData } from "./data";

export function hasPermission(character: API_Character) {
  console.log(botData);
  if (botData.disabledBy.includes(character.MemberNumber)) return false;
  const minimumRestraints: { Group: AssetGroupName; Name: string }[] = [
    {
      Group: "ItemMouth",
      Name: "BallGag",
    },
  ];
  return !minimumRestraints.some(
    (restraint) => !character.IsItemPermissionAccessible(AssetGet(restraint.Group, restraint.Name)),
  );
}
