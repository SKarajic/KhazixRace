import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerAccountCreateDto } from '@server/player-account/dto/player-account-create.dto';
import { PlayerStreamCreateDto } from '@server/player-stream/dto/player-stream-create.dto';

import { Player } from './entity/player.entity';
import { PlayerService } from './player.service';
import { PlayerCreateDto } from './dto/player-create.dto';
import { PlayerUpdateDto } from './dto/player-update.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('/api/player')
@ApiTags('player')
export class PlayerController {
  constructor(
    private readonly playerService: PlayerService,
  ) {}
  
  @Get()
  allPlayers(): Promise<Player[]> {
    return this.playerService.findAllPlayers();
  }

  @Post()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  createPlayer(@Body() player: PlayerCreateDto): Promise<Player> {
    return this.playerService.createPlayer(player);
  }

  @Put(':playerId')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiParam({ name: 'playerId', required: true, type: Number })
  updatePlayer(@Param('playerId') playerId, @Body() player: PlayerUpdateDto): Promise<Player> {
    return this.playerService.updatePlayer(playerId, player);
  }

  @Delete(':playerId')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiParam({ name: 'playerId', required: true, type: Number })
  deletePlayer(@Param('playerId') playerId): Promise<Player> {
    return this.playerService.deletePlayer(playerId);
  }

  @Post(':playerId/stream')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  addStreamToPlayer(@Param('playerId') playerId: number, @Body() stream: PlayerStreamCreateDto): Promise<Player> {
    return this.playerService.addStreamToPlayer(playerId, stream);
  }

  @Post(':playerId/riot-account')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  addRiotAccountToPlayer(@Param('playerId') playerId: number, @Body() account: PlayerAccountCreateDto): Promise<Player> {
    return this.playerService.addRiotAccountToPlayer(playerId, account);
  }


  @Put(':playerId/riot-account')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiParam({ name: 'playerId', required: true, type: Number })
  updateRiotAccountsOfPlayer(@Param('playerId') playerId: number): Promise<Player> {
    return this.playerService.updateRiotAccountsOfPlayer(playerId);
  }
}
