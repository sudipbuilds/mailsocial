import { DodoPayments } from 'dodopayments';

import config from '@/lib/config';

let dodoPayments: DodoPayments | null = null;

export const createDodopayments = () => {
  if (!dodoPayments) {
    const { environment, bearerToken, webhookKey } = config.dodopayments;

    if (!bearerToken) {
      throw new Error('DODO_PAYMENTS_API_KEY environment variable is missing.');
    }

    if (!webhookKey) {
      throw new Error('DODO_PAYMENTS_WEBHOOK_KEY environment variable is missing.');
    }

    if (!environment || (environment !== 'live_mode' && environment !== 'test_mode')) {
      throw new Error('DODO_PAYMENTS_ENVIRONMENT must be either "live_mode" or "test_mode"');
    }

    dodoPayments = new DodoPayments({ bearerToken, environment, webhookKey, timeout: 20 * 1000 });
  }

  return dodoPayments;
};
