import { Player } from "./player";
import { PlayerRow } from "./player-row";

const tiers = {
  CHALLENGER:   10,
  GRANDMASTER:  9,
  MASTER:       8,
  DIAMOND:      7,
  PLATINUM:     6,
  GOLD:         5,
  SILVER:       4,
  BRONZE:       3,
  IRON:         2,
  UNKNOWN:      1,
}

const divisions = {
  I:    4,
  II:   3,
  III:  2,
  IV:   1,
}

export const sortPlayerRowsByRank = (rows: PlayerRow[]) =>
  rows.sort((a, b) => {
    const result = tiers[b.rank.tier.toUpperCase()] - tiers[a.rank.tier.toUpperCase()];
    if (result !== 0 || a.rank.tier === 'unknown' || b.rank.tier === 'unknown') return result;
    const divisionResult = divisions[b.rank.division] - divisions[a.rank.division];
    if (divisionResult !== 0) return divisionResult;
    return b.rank.points - a.rank.points;
  });

export const sortPlayerRanks = (player: Player) =>
  player.accounts.sort((a, b) => {
    const result = tiers[b.ranked.tier] - tiers[a.ranked.tier];
    if (result !== 0 || a.ranked.tier === 'UNKNOWN' || b.ranked.tier === 'UNKNOWN') return result;
    const divisionResult = divisions[b.ranked.division] - divisions[a.ranked.division];
    if (divisionResult !== 0) return divisionResult;
    return b.ranked.points - a.ranked.points;
  });