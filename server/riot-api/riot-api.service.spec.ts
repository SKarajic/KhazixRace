import { Test, TestingModule } from '@nestjs/testing';
import { RiotApiService } from './riot-api.service';

describe('RiotApiService', () => {
  let service: RiotApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiotApiService],
    }).compile();

    service = module.get<RiotApiService>(RiotApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
