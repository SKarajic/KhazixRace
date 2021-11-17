import { PlayerAccountRanked } from './entity/player-account-ranked.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { Player } from '@server/player/entity/player.entity';
import { RiotApiService } from '@server/riot-api/riot-api.service';
import { PlayerAccountCreateDto } from './dto/player-account-create.dto';
import { PlayerAccount } from './entity/player-account.entity';
import { SummonerLeagueDto, SummonerV4DTO } from 'twisted/dist/models-dto';

@Injectable()
export class PlayerAccountService {
  constructor(
    @InjectRepository(PlayerAccount)
    private readonly accountRepo: Repository<PlayerAccount>,
    @InjectRepository(PlayerAccountRanked)
    private readonly rankedRepo: Repository<PlayerAccountRanked>,
    private readonly riotApi: RiotApiService,
  ) {}

  /**
   * deletes a riot account of a player
   */
  async deleteRiotAccount(accountId: number): Promise<PlayerAccount> {
    const account = await this.accountRepo.findOne(accountId, { relations: ['ranked'] })
    if (!account) throw new NotFoundException('stream not found');

    await this.accountRepo.delete(accountId)
    return account
  }

  /**
   * creates a riot account
   * 
   * @param playerId 
   * @param account 
   */
  async createRiotAccount(player: Player, account: PlayerAccountCreateDto): Promise<PlayerAccount> {
    let accountDto: SummonerV4DTO
    try {
      const { response } = await this.riotApi.client().Summoner.getByName(account.name, account.region);
      accountDto = response
    } catch {
      throw new NotFoundException('riot account not found');
    }

    let playerAccount = new PlayerAccount();
    playerAccount.lolId = accountDto.id!;
    playerAccount.riotId = accountDto.accountId!;
    playerAccount.name = accountDto.name!;
    playerAccount.region = account.region;
    playerAccount.player = player;
    playerAccount = await this.accountRepo.save(playerAccount);

    await this.rankedRepo.save(await this.findRankedStats(playerAccount));
    return this.accountRepo.findOneOrFail(playerAccount.id, { relations: ['ranked'] })
  }

  private async findRankedStats(account: PlayerAccount): Promise<PlayerAccountRanked> {
    let list: SummonerLeagueDto[]
    try {
      const { response } = await this.riotApi.client().League.bySummoner(account.lolId, account.region)
      list = response.filter(({ queueType }) => queueType === 'RANKED_SOLO_5x5')
    } catch (e) {
      Logger.error(e);
      throw new BadRequestException('unable to fetch ranked data');
    }

    if (list.length !== 1) {
      list.push({
        tier: 'UNKNOWN',
        rank: '',
        wins: 0,
        losses: -1,
        leaguePoints: 0,
        hotStreak: false,
        veteran: false,
        queueType: 'RANKED_SOLO_5x5',
        summonerName: account.name,
        leagueId: '',
        inactive: false,
        freshBlood: false,
        summonerId: account.lolId
      })
    }
    const [rankedDto] = list;

    const ranked = account.ranked || new PlayerAccountRanked();
    ranked.account = account;
    ranked.tier = rankedDto.tier!;
    ranked.division = rankedDto.rank!;
    ranked.points = rankedDto.leaguePoints!;
    ranked.wins = rankedDto.wins!;
    ranked.losses = rankedDto.losses!;
    return ranked;
  }

  /**
   * updates all riot accounts from a player
   * 
   * @param player
   */
  async updateRiotAccountsFromPlayer(player: Player): Promise<PlayerAccount[]> {
    const rankedStats: PlayerAccountRanked[] = [];

    const accounts = await Promise.all(player.accounts.map(async account => {
      try {
        rankedStats.push(await this.findRankedStats(account));
      } catch {
        Logger.error(`Unable to update ranked data of the riot account "${account.name}" of "${player.name}"`);
      }

      try {
        const { response } = await this.riotApi.client().Summoner.getByAccountID(account.riotId, account.region);
        account.name = response.name;
      } catch {
        Logger.error(`Unable to update general data of the riot account "${account.name}" of "${player.name}"`);
      }
      return account;
    }));

    await this.rankedRepo.save(rankedStats);
    return this.accountRepo.save(accounts);
  }
}
