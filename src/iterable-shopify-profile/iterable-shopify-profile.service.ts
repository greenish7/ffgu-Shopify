import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ShopifyProfile,
  ShopifyProvider,
  tryToConvertToBoolean,
} from './shopifyProvider';
import Bottleneck from 'bottleneck';

const delayMs = async (delay = 1000) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

async function RunWithRetries<TResult>(
  fn: () => Promise<TResult>,
  delay = 1000,
  maxAttempt = 2,
) {
  let iteration = 0;
  while (true) {
    iteration++;
    try {
      const result = await fn();
      Logger.debug(`Iteration: ${iteration} was successful`);
      return result;
    } catch (e) {
      Logger.warn(`Iteration: ${iteration}`);
      Logger.error(e);
      if (iteration >= maxAttempt) {
        throw e;
      }
      await delayMs(delay);
    }
  }
}

const LONG_DELAY = 61000;

@Injectable()
export class IterableShopifyProfileService {
  constructor(
    @Inject('SHOPIFY_PROVIDER')
    private readonly shopifyProvider: ShopifyProvider,
    @Inject('BOTTLENECK_RATE_LIMITER')
    private readonly bottleneck: Bottleneck,
  ) {}

  isValid(userId: unknown): boolean {
    if (Number.isFinite(userId)) {
      Logger.debug(`userId is number: ${userId}`);
      return true;
    }
    if (typeof userId === 'string') {
      const userIdRaw = Number.parseInt(userId, 10);
      const result =
        Number.isFinite(userIdRaw) && userIdRaw.toString(10) === userId;
      if (result) {
        Logger.debug(`userId is correct number string: ${userId}`);
        return true;
      }
    }
    Logger.debug(`userId is not correct: ${userId}`);
    return false;
  }

  async tryToGetShopifyProfile(
    webhookPayload: ShopifyProfile,
    userId?: string,
  ): Promise<ShopifyProfile | null> {
    if (this.isValid(userId)) {
      const userIdStr = (userId as any).toString(10);
      return RunWithRetries(() => {
        return this.bottleneck.schedule(() => {
          return this.shopifyProvider.getCustomerProfile(userIdStr);
        });
      }, LONG_DELAY);
    }
    const { email } = webhookPayload;
    if (!email) {
      Logger.debug(`Payload doesn't have email`);
      return null;
    }
    const customers = await RunWithRetries(() => {
      return this.bottleneck.schedule(() => {
        return this.shopifyProvider.getCustomerProfileByQuery({ email: email });
      });
    });
    if (customers.length === 1) {
      return customers[0];
    }
    if (customers.length === 0) {
      return null;
    }
    Logger.warn(`There are several matching customers`);
    for (const customer of customers) {
      if (customer.email === email) {
        return customer;
      }
    }
    Logger.error(customers);
    return null;
  }

  async processWebhook(webhookPayload: ShopifyProfile, userId?: string) {
    const shopifyProfile = await this.tryToGetShopifyProfile(
      webhookPayload,
      userId,
    );
    if (!shopifyProfile) {
      Logger.error(
        `Cannot find shopify profile (email: "${webhookPayload.email}", userId: "${userId}")`,
      );
      return;
    }
    const webhookPayloadAcceptsMarketing = tryToConvertToBoolean(
      webhookPayload.accepts_marketing,
    );
    Logger.debug(
      `Accepts marketing: ${webhookPayloadAcceptsMarketing} (origin: ${webhookPayload.accepts_marketing})`,
    );
    if (webhookPayloadAcceptsMarketing !== shopifyProfile.accepts_marketing) {
      const tags = shopifyProfile.tags || '';
      const uniqueTags = new Set(tags.split(',').map((c) => c.trim()));
      if (webhookPayloadAcceptsMarketing) {
        uniqueTags.add('email_optin');
        uniqueTags.delete('email_optout');
      } else {
        uniqueTags.add('email_optout');
        uniqueTags.delete('email_optin');
      }
      const profileUpdate: ShopifyProfile = {
        accepts_marketing: webhookPayloadAcceptsMarketing,
        tags: [...uniqueTags].join(', '),
      };
      Logger.log(
        `Updating user: ${userId}, new value: ${JSON.stringify(profileUpdate)}`,
      );
      return RunWithRetries(() => {
        return this.bottleneck.schedule(() => {
          return this.shopifyProvider.updateCustomer(
            shopifyProfile.id as string,
            profileUpdate,
          );
        });
      }, LONG_DELAY);
    } else {
      Logger.log(`No need to update user: ${userId}.`);
    }
  }
}
