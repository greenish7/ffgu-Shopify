import {
  Controller,
  Post,
  Body,
  Query,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { IterableShopifyProfileService } from './iterable-shopify-profile.service';

@Controller('iterable-shopify-profile')
export class IterableShopifyProfileController {
  constructor(
    private readonly iterableShopifyProfileService: IterableShopifyProfileService,
  ) {}

  @Post()
  @HttpCode(200)
  processWebhook(
    @Body() webhookPayload: any,
    @Query('userId') userId?: string,
  ) {
    Logger.debug(`UserId (query): "${userId}"`);
    Logger.debug(webhookPayload);
    return this.iterableShopifyProfileService.processWebhook(
      webhookPayload,
      userId,
    );
  }
}
