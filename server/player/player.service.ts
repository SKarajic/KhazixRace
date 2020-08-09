import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerAccountCreateDto } from '@server/player-account/dto/player-account-create.dto';
import { PlayerStreamService } from '@server/player-stream/player-stream.service';
import { PlayerStreamCreateDto } from '@server/player-stream/dto/player-stream-create.dto';
import { PlayerAccountService } from '@server/player-account/player-account.service';
import { Player } from './entity/player.entity';
import { PlayerCreateDto } from './dto/player-create.dto';
import { PlayerUpdateDto } from './dto/player-update.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
    private readonly accountService: PlayerAccountService,
    private readonly streamService: PlayerStreamService,
  ) {}

  /**
   * find all players
   */
  findAllPlayers(): Promise<Player[]> {
    return this.playerRepo.find({ relations: ['streams', 'accounts', 'accounts.ranked'] })
  }

  async findPlayer(playerId: number): Promise<Player> {
    const player = await this.playerRepo.findOne(playerId, {
      relations: ['streams', 'accounts', 'accounts.ranked'],
    });
    if (!player) throw new NotFoundException('player not found');
    return player;
  }
  /**
   * creates a player
   * 
   * @param player 
   */
  async createPlayer(player: PlayerCreateDto): Promise<Player> {
    const { id } = await this.playerRepo.save(player);
    return this.findPlayer(id);
  }

  /**
   * updates a player
   * 
   * @param player 
   */
  async updatePlayer(playerId: number, player: PlayerUpdateDto): Promise<Player> {
    await this.findPlayer(playerId);
    await this.playerRepo.update(playerId, player)
    return this.findPlayer(playerId);
  }

  /**
   * deletes a player
   * 
   * @param player 
   */
  async deletePlayer(playerId: number): Promise<Player> {
    const player = await this.findPlayer(playerId);
    await this.playerRepo.delete(playerId)
    return player
  }

  /**
   * adds a stream to a player
   * 
   * @param playerId 
   * @param stream 
   */
  async addStreamToPlayer(playerId: number, stream: PlayerStreamCreateDto): Promise<Player> {
    const player = await this.playerRepo.findOne(playerId);
    if (!player) throw new NotFoundException('player not found');
    stream.player = player;
    await this.streamService.createStream(stream);
    return this.findPlayer(player.id);
  }

  /**
   * adds a riot account to a player
   * 
   * @param playerId 
   * @param account 
   */
  async addRiotAccountToPlayer(playerId: number, account: PlayerAccountCreateDto): Promise<Player> {
    const player = await this.playerRepo.findOne(playerId);
    if (!player) throw new NotFoundException('player not found');
    await this.accountService.createRiotAccount(player, account);
    return this.findPlayer(player.id);
  }

  /**
   * updates all riot accounts assigned to a player
   * 
   * @param playerId
   */
  async updateRiotAccountsOfPlayer(playerId: number): Promise<Player> {
    const player = await this.playerRepo.findOne(playerId, { relations: ['accounts', 'accounts.ranked'] });
    if (!player) throw new NotFoundException('player not found');
    await this.accountService.updateRiotAccountsFromPlayer(player);
    return this.findPlayer(playerId);
  }


  @Cron("0 */15 * * * *")
  async handleCron() {
    Logger.log('updating all riot accounts...');
    const players = await this.findAllPlayers();
    for (let i = 0; i < players.length; i++) {
      await this.accountService.updateRiotAccountsFromPlayer(players[i]);
    }
    Logger.log('riot accounts updated');
  }
}
