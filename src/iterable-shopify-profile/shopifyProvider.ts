import axios from 'axios';
import { Logger } from '@nestjs/common';

export interface ShopifyProfile {
  accepts_marketing: any;
  email?: string;
  id?: string;
  tags?: string;
}

export function tryToConvertToBoolean(val: any): boolean {
  if (typeof val === 'boolean') {
    return val;
  }
  if (typeof val === 'string') {
    const lowerVal = val.toLowerCase();
    switch (lowerVal) {
      case 'false':
      case 'no':
        return false;
      case 'true':
      case 'yes':
        return true;
    }
  }
  Logger.warn(`Strange val type: ${typeof val} ${val}`);
  return !!val;
}

export type ShopifyCustomerQuery =
  | 'accepts_marketing'
  | 'activation_date'
  | 'address1'
  | 'address2'
  | 'city'
  | 'company'
  | 'country'
  | 'customer_date'
  | 'customer_first_name'
  | 'customer_id'
  | 'customer_last_name'
  | 'customer_tag'
  | 'email'
  | 'email_marketing_state'
  | 'first_name'
  | 'first_order_date'
  | 'id'
  | 'last_abandoned_order_date'
  | 'last_name'
  | 'multipass_identifier'
  | 'orders_count'
  | 'order_date'
  | 'phone'
  | 'province'
  | 'shop_id'
  | 'state'
  | 'tag'
  | 'total_spent'
  | 'updated_at'
  | 'verified_email'
  | 'product_subscriber_status';

export class ShopifyProvider {
  private readonly apiKey: string;
  private readonly password: string;
  private readonly shopName: string;

  constructor(
    SHOPIFY_API_KEY?: string,
    SHOPIFY_PASSWORD?: string,
    SHOPIFY_SHOP_NAME?: string,
  ) {
    if (!SHOPIFY_API_KEY) {
      throw new Error('You need to set SHOPIFY_API_KEY');
    }
    this.apiKey = SHOPIFY_API_KEY;
    if (!SHOPIFY_PASSWORD) {
      throw new Error('You need to set SHOPIFY_PASSWORD');
    }
    this.password = SHOPIFY_PASSWORD;
    if (!SHOPIFY_SHOP_NAME) {
      throw new Error('You need to set SHOPIFY_SHOP_NAME');
    }
    this.shopName = SHOPIFY_SHOP_NAME;
  }

  async getCustomerProfile(customerId: string): Promise<ShopifyProfile> {
    const url = `https://${this.apiKey}:${this.password}@${this.shopName}.myshopify.com/admin/api/2021-01/customers/${customerId}.json`;
    Logger.debug(url);
    const response = await axios.get(url);
    return response.data.customer;
  }

  async getCustomerProfileByQuery(
    query: Partial<Record<ShopifyCustomerQuery, string>>,
  ): Promise<ShopifyProfile[]> {
    const queryString = Object.entries(query)
      .map(([key, val]) => {
        return `${key}:${val}`;
      })
      .join(' ');
    const url = `https://${this.apiKey}:${this.password}@${this.shopName}.myshopify.com/admin/api/2021-01/customers/search.json?query=${queryString}`;
    Logger.debug(url);
    const response = await axios.get(url);
    return response.data.customers;
  }

  async updateCustomer(
    customerId: string,
    body: ShopifyProfile,
  ): Promise<void> {
    const url = `https://${this.apiKey}:${this.password}@${this.shopName}.myshopify.com/admin/api/2021-01/customers/${customerId}.json`;
    Logger.debug(url);
    const accepts_marketing = tryToConvertToBoolean(body.accepts_marketing);
    const data = {
      customer: {
        id: customerId,
        accepts_marketing,
        accepts_marketing_updated_at: new Date().toJSON(),
        marketing_opt_in_level: 'confirmed_opt_in',
        tags: body.tags,
      },
    };
    await axios.put(url, data);
  }
}
