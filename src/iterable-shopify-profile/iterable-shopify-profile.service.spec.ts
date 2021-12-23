import { Test, TestingModule } from '@nestjs/testing';
import { IterableShopifyProfileService } from './iterable-shopify-profile.service';
import { ShopifyProvider } from './shopifyProvider';
import Bottleneck from 'bottleneck';

export const mockShopifyProvider: Partial<ShopifyProvider> = {};
export const mockBottleneckLimiter: Partial<Bottleneck> = {};

describe('IterableShopifyProfileService', () => {
  let service: IterableShopifyProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<IterableShopifyProfileService>(
      IterableShopifyProfileService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
