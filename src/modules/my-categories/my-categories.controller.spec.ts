import { Test, TestingModule } from '@nestjs/testing';
import { MyCategoriesController } from './my-categories.controller';

describe('MyCategoriesController', () => {
  let controller: MyCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyCategoriesController],
    }).compile();

    controller = module.get<MyCategoriesController>(MyCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
