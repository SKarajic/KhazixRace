import { PlayerAccountRanked } from "./player-account-ranked";

export interface PlayerAccount {
  id: number;
  name: string;
  riotId: string;
  lolId: string;
  region: string;
  ranked: PlayerAccountRanked;
}
