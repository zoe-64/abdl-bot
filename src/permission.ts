import type { API_Character } from "bc-bot";
import { AssetGet } from "bc-bot";

function hasRestraintPermissions(character: API_Character) {
  const minimumRestraints: { Group: AssetGroupName; Name: string }[] = [
    {
      Group: "ItemMouth",
      Name: "BallGag",
    },
  ];
  return minimumRestraints.some(
    (restraint) => !character.IsItemPermissionAccessible(AssetGet(restraint.Group, restraint.Name)),
  );
}
