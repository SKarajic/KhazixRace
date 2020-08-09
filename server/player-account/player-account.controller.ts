import { ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlayerAccount } from './entity/player-account.entity';
import { PlayerAccountService } from './player-account.service';

@Controller('/api/player-account')
@ApiTags('player-account')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class PlayerAccountController {
  constructor(
    private readonly accountService: PlayerAccountService,
  ) {}

  @Delete(':accountId')
  @ApiParam({ name: 'accountId', required: true, type: Number })
  deletePlayerAccount(@Param('accountId') accountId: number): Promise<PlayerAccount> {
    return this.accountService.deleteRiotAccount(accountId);
  }
}
