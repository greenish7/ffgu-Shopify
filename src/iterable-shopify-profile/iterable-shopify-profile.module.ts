import { Module } from '@nestjs/common';
import { IterableShopifyProfileService } from './iterable-shopify-profile.service';
import { IterableShopifyProfileController } from './iterable-shopify-profile.controller';
import { ShopifyProvider } from './shopifyProvider';
import Bottleneck from 'bottleneck';

@Module({
  controllers: [IterableShopifyProfileController],
  providers: [
    IterableShopifyProfileService,
    {
      provide: 'SHOPIFY_PROVIDER',
      useFactory: () => {
        const {
          SHOPIFY_API_KEY,
          SHOPIFY_PASSWORD,
          SHOPIFY_SHOP_NAME,
        } = process.env;
        return new ShopifyProvider(
          SHOPIFY_API_KEY,
          SHOPIFY_PASSWORD,
          SHOPIFY_SHOP_NAME,
        );
      },
    },
    {
      provide: 'BOTTLENECK_RATE_LIMITER',
      useFactory: () => {
        const options: Bottleneck.ConstructorOptions = {
          maxConcurrent: 1,
          minTime: 550,

          reservoir: 30, // initial value
          reservoirRefreshAmount: 30,
          reservoirRefreshInterval: 60 * 1000, // must be divisible by 250

          id: 'shopify_rate_limiter',
          datastore: 'redis',
          clearDatastore: true,
          clientOptions: {
            url: process.env.REDIS_URL ?? 'redis://localhost:6379',
          },
        };
        return new Bottleneck(options);
      },
    },
  ],
})
export class IterableShopifyProfileModule {}
