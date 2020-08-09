import { Injectable } from '@nestjs/common';
import { Kayn, KaynClass } from 'kayn';

@Injectable()
export class RiotApiService {
  /**
   * Riot API wrapper class
   */
  private wrapper: KaynClass;

  constructor() {
    const key = process.env.RIOT_API_KEY;
    if (!key) {
      throw new Error('Riot API key not found');
    }
    this.wrapper = Kayn(key)();
  }

  /**
   * returns the kayn instance
   */
  kayn(): KaynClass {
    return this.wrapper;
  }
}
