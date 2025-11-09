/**
 * Cloudflare AI Gateway implementation (Adapter)
 * Translates between domain interfaces and Anthropic's API via CF AI Gateway
 */

import type { AIProvider } from '../domain/AIProvider';
import type { AIRequest, AIResponse, Message } from '../domain/types';
import { AIError } from '../domain/types';

interface CloudflareAIGatewayConfig {
	accountId: string;
	gatewaySlug: string;
	apiKey: string;
}

/**
 * Anthropic API message format
 */
interface AnthropicMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface AnthropicRequest {
	model: string;
	messages: AnthropicMessage[];
	max_tokens: number;
	temperature?: number;
	system?: string;
}

interface AnthropicResponse {
	id: string;
	type: string;
	role: string;
	content: Array<{ type: string; text: string }>;
	model: string;
	usage: {
		input_tokens: number;
		output_tokens: number;
	};
}

export class CloudflareAIGatewayProvider implements AIProvider {
	private readonly baseUrl: string;
	private readonly apiKey: string;
	private readonly defaultModel = 'claude-3-5-haiku-20241022';

	constructor(config: CloudflareAIGatewayConfig) {
		this.baseUrl = `https://gateway.ai.cloudflare.com/v1/${config.accountId}/${config.gatewaySlug}/anthropic`;
		this.apiKey = config.apiKey;
	}

	async chat(request: AIRequest): Promise<AIResponse> {
		try {
			// Transform domain messages to Anthropic format (filter out system messages)
			const anthropicMessages: AnthropicMessage[] = request.messages
				.filter((m) => m.role !== 'system')
				.map((m) => ({
					role: m.role as 'user' | 'assistant',
					content: m.content
				}));

			// Extract system prompt from messages or use provided one
			const systemMessage = request.messages.find((m) => m.role === 'system');
			const system = request.systemPrompt || systemMessage?.content;

			const anthropicRequest: AnthropicRequest = {
				model: this.defaultModel,
				messages: anthropicMessages,
				max_tokens: request.maxTokens || 1024,
				...(request.temperature !== undefined && { temperature: request.temperature }),
				...(system && { system })
			};

			const response = await fetch(`${this.baseUrl}/v1/messages`, {
				method: 'POST',
				headers: {
					'x-api-key': this.apiKey,
					'anthropic-version': '2023-06-01',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(anthropicRequest)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new AIError(
					`Anthropic API error: ${response.statusText}`,
					'PROVIDER_ERROR',
					errorData
				);
			}

			const data: AnthropicResponse = await response.json();

			// Transform Anthropic response to domain format
			return {
				content: data.content[0]?.text || '',
				usage: {
					inputTokens: data.usage.input_tokens,
					outputTokens: data.usage.output_tokens
				},
				model: data.model
			};
		} catch (error) {
			if (error instanceof AIError) {
				throw error;
			}
			throw new AIError(
				'Failed to communicate with AI provider',
				'NETWORK_ERROR',
				error
			);
		}
	}

	getProviderName(): string {
		return 'cloudflare-ai-gateway-anthropic';
	}
}
