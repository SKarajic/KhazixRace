import { PlayerStreamCreateDto } from './dto/player-stream-create.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerStream } from './entity/player-stream.entity';
import { PlayerStreamUpdateDto } from './dto/player-stream-update.dto';

@Injectable()
export class PlayerStreamService {
  constructor(
    @InjectRepository(PlayerStream)
    private readonly streamRepo: Repository<PlayerStream>,
  ) {}

  /**
   * creates a stream of a player
   * 
   * @param stream 
   */
  createStream(stream: PlayerStreamCreateDto): Promise<PlayerStream> {
    return this.streamRepo.save(stream);
  }

  /**
   * updates a stream of a player
   */
  async updateStream(streamId: number, stream: PlayerStreamUpdateDto): Promise<PlayerStream> {
    await this.streamRepo.update(streamId, stream);
    return this.streamRepo.findOneOrFail(streamId);
  }

  /**
   * deletes a stream of a player
   */
  async deleteStream(streamId: number): Promise<PlayerStream> {
    const stream = await this.streamRepo.findOne(streamId)
    if (!stream) throw new NotFoundException('stream not found');

    await this.streamRepo.delete(streamId)
    return stream
  }
}
