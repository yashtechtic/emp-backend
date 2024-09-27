import { Test, TestingModule } from '@nestjs/testing';
import { LandingPagesController } from './landing-pages.controller';

describe('LandingPagesController', () => {
  let controller: LandingPagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandingPagesController],
    }).compile();

    controller = module.get<LandingPagesController>(LandingPagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
