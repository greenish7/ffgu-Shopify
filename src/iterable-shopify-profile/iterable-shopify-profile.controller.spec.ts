import { Test, TestingModule } from '@nestjs/testing';
import { IterableShopifyProfileController } from './iterable-shopify-profile.controller';
import { IterableShopifyProfileService } from './iterable-shopify-profile.service';
import {
  mockBottleneckLimiter,
  mockShopifyProvider,
} from './iterable-shopify-profile.service.spec';

describe('IterableShopifyProfileController', () => {
  let controller: IterableShopifyProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IterableShopifyProfileController],
      providers: [
        IterableShopifyProfileService,
        {
          provide: 'SHOPIFY_PROVIDER',
          useValue: mockShopifyProvider,
        },
        {
          provide: 'BOTTLENECK_RATE_LIMITER',
          useValue: mockBottleneckLimiter,
        },
      ],
    }).compile();

    controller = module.get<IterableShopifyProfileController>(
      IterableShopifyProfileController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
