import { Controller, Put, Param, Body, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerStream } from './entity/player-stream.entity';
import { PlayerStreamUpdateDto } from './dto/player-stream-update.dto';
import { PlayerStreamService } from './player-stream.service';

@Controller('/api/player-stream')
@ApiTags('player-stream')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class PlayerStreamController {
  constructor(
    private readonly streamService: PlayerStreamService,
  ) {}
  
  @Put(':streamId')
  @ApiParam({ name: 'streamId', required: true, type: Number })
  updateStream(@Param('streamId') streamId: number, @Body() stream: PlayerStreamUpdateDto): Promise<PlayerStream> {
    return this.streamService.updateStream(streamId, stream);
  }

  @Delete(':streamId')
  @ApiParam({ name: 'streamId', required: true, type: Number })
  deleteStream(@Param('streamId') streamId: number): Promise<PlayerStream> {
    return this.streamService.deleteStream(streamId);
  }
}
