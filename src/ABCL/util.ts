import type { API_AppearanceItem, API_Character } from "bc-bot";
import { ABCLdata } from "./dictionary";

export const isDiaper = (item: API_AppearanceItem | null): boolean => {
  if (!item || !item.Asset) return false;
  const assetDef = item.getAssetDef();
  if (!assetDef) return false;
  return assetDef.DynamicGroupName + assetDef.Name in ABCLdata.Diapers;
};

export function getPlayerDiaperSize(player: API_Character): number {
  const pelvisItem = player.Appearance.InventoryGet("ItemPelvis");
  const panties = player.Appearance.InventoryGet("Panties");
  const suitLower = player.Appearance.InventoryGet("SuitLower");

  let size = 50;
  if (pelvisItem && isDiaper(pelvisItem)) {
    size += getDiaperSize(pelvisItem);
  }
  if (suitLower && isDiaper(suitLower)) {
    size += getDiaperSize(suitLower);
  }
  if (panties && isDiaper(panties)) {
    size += getDiaperSize(panties);
  }
  return size;
}

export function getDiaperSize(diaper: API_AppearanceItem): number {
  const assetDef = diaper.getAssetDef();
  if (!assetDef) return 0;
  if (assetDef.Name === "PoofyDiaper" && diaper.getData().Property?.TypeRecord?.typed === 1) {
    return ABCLdata.DiaperSizeScale.heavy_adult;
  }
  return ABCLdata.DiaperSizeScale[
    ABCLdata.Diapers[(assetDef.DynamicGroupName + assetDef.Name) as keyof typeof ABCLdata.Diapers]
      .size as keyof typeof ABCLdata.DiaperSizeScale
  ];
}
export function hasDiaper(player: API_Character): boolean {
  const pelvisItem = player.Appearance.InventoryGet("ItemPelvis");
  const panties = player.Appearance.InventoryGet("Panties");
  const suitLower = player.Appearance.InventoryGet("SuitLower");
  return Boolean(
    (pelvisItem && isDiaper(pelvisItem)) || (panties && isDiaper(panties)) || (suitLower && isDiaper(suitLower)),
  );
}
