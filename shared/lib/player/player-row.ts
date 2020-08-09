export interface PlayerRow {
  id: number
  name: string
  summ?: string
  region?: string
  rank: {
    tier: string,
    division: string,
    points: number,
  }
  wins: number
  losses: number
  winrate: number
  stream?: {
    name: string,
    type: string,
    link: string,
  }
}
