import { Test, TestingModule } from '@nestjs/testing';
import { LandingPagesService } from './landing-pages.service';

describe('LandingPagesService', () => {
  let service: LandingPagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LandingPagesService],
    }).compile();

    service = module.get<LandingPagesService>(LandingPagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
