/**
 * Application Service for AI interactions
 * This is the main entry point for AI features in your application
 */

import type { AIProvider } from '../domain/AIProvider';
import type { AIRequest, AIResponse, Message } from '../domain/types';

export class AIService {
	constructor(private readonly provider: AIProvider) {}

	/**
	 * Send a chat message and get a response
	 */
	async chat(request: AIRequest): Promise<AIResponse> {
		return this.provider.chat(request);
	}

	/**
	 * Convenience method for simple question/answer
	 */
	async ask(question: string, systemPrompt?: string): Promise<string> {
		const response = await this.provider.chat({
			messages: [{ role: 'user', content: question }],
			systemPrompt
		});
		return response.content;
	}

	/**
	 * Get the current provider name
	 */
	getProviderName(): string {
		return this.provider.getProviderName();
	}
}
