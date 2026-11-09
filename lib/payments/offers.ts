/**
 * Online offers come in two kinds, told apart by SKU:
 * - purchase offers (Solo, Party): anyone can buy them;
 * - upgrade offers (SKU ends with "-upgrade", e.g. "party-upgrade"): price difference
 *   plus group credits, sold only to players who already own the case.
 * The checkout route enforces the ownership rule; the store page uses it to pick cards.
 */
export const UPGRADE_SKU_SUFFIX = "-upgrade";

export function isUpgradeSku(sku: string): boolean {
  return sku.endsWith(UPGRADE_SKU_SUFFIX);
}
