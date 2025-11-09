/**
 * Domain interface (Port) for AI providers
 * This is the Anti-Corruption Layer interface that all implementations must follow
 */

import type { AIRequest, AIResponse } from './types';

export interface AIProvider {
	/**
	 * Send a chat completion request to the AI provider
	 */
	chat(request: AIRequest): Promise<AIResponse>;

	/**
	 * Get the provider name for logging/debugging
	 */
	getProviderName(): string;
}
