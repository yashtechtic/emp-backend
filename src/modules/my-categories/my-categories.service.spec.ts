import { Test, TestingModule } from '@nestjs/testing';
import { MyCategoriesService } from './my-categories.service';

describe('MyCategoriesService', () => {
  let service: MyCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyCategoriesService],
    }).compile();

    service = module.get<MyCategoriesService>(MyCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
