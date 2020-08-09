import { Test, TestingModule } from '@nestjs/testing';
import { PlayerStreamService } from './player-stream.service';

describe('PlayerStreamService', () => {
  let service: PlayerStreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerStreamService],
    }).compile();

    service = module.get<PlayerStreamService>(PlayerStreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
