import { Injectable } from '@nestjs/common';
import { LolApi } from 'twisted';

@Injectable()
export class RiotApiService {
  /**
   * Riot API wrapper class
   */
  private wrapper: LolApi;

  constructor() {
    const key = process.env.RIOT_API_KEY;
    if (!key) {
      throw new Error('Riot API key not found');
    }
    this.wrapper = new LolApi(key);
  }

  /**
   * returns the twisted instance
   */
  client(): LolApi {
    return this.wrapper;
  }
}
