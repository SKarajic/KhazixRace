import { PlayerStream } from "./player-stream";
import { PlayerAccount } from "./player-account";

export interface Player {
  id: number;
  name: string;
  streams: PlayerStream[];
  accounts: PlayerAccount[];
}
