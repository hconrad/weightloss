/**
 * AI Configuration helper
 * Builds provider configuration from platform environment
 */

import type { AIProviderConfig } from './application/AIProviderFactory';

export function getAIConfig(env: {
	ANTHROPIC_API_KEY: string;
	CF_ACCOUNT_ID: string;
	CF_AI_GATEWAY_SLUG: string;
}): AIProviderConfig {
	return {
		type: 'cloudflare-ai-gateway',
		cloudflare: {
			accountId: env.CF_ACCOUNT_ID,
			gatewaySlug: env.CF_AI_GATEWAY_SLUG,
			apiKey: env.ANTHROPIC_API_KEY
		}
	};
}
