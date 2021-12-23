import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IterableShopifyProfileModule } from './iterable-shopify-profile/iterable-shopify-profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    IterableShopifyProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
