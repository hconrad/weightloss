/**
 * Factory for creating AI providers based on configuration
 * This is where you'd add logic to switch between different providers
 */

import type { AIProvider } from '../domain/AIProvider';
import { CloudflareAIGatewayProvider } from '../infrastructure/CloudflareAIGatewayProvider';

export type AIProviderType = 'cloudflare-ai-gateway' | 'workers-ai' | 'direct-anthropic';

export interface AIProviderConfig {
	type: AIProviderType;
	cloudflare?: {
		accountId: string;
		gatewaySlug: string;
		apiKey: string;
	};
	// Future: add other provider configs here
	// anthropic?: { apiKey: string };
	// openai?: { apiKey: string };
}

export class AIProviderFactory {
	static create(config: AIProviderConfig): AIProvider {
		switch (config.type) {
			case 'cloudflare-ai-gateway':
				if (!config.cloudflare) {
					throw new Error('Cloudflare configuration required for cloudflare-ai-gateway provider');
				}
				return new CloudflareAIGatewayProvider(config.cloudflare);

			// Future providers can be added here:
			// case 'workers-ai':
			//   return new WorkersAIProvider(config.workersAI);
			// case 'direct-anthropic':
			//   return new DirectAnthropicProvider(config.anthropic);

			default:
				throw new Error(`Unsupported AI provider type: ${config.type}`);
		}
	}
}
