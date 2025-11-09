/**
 * Domain types for AI interactions
 * These are provider-agnostic value objects
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
	role: MessageRole;
	content: string;
}

export interface AIRequest {
	messages: Message[];
	maxTokens?: number;
	temperature?: number;
	systemPrompt?: string;
}

export interface AIResponse {
	content: string;
	usage?: {
		inputTokens: number;
		outputTokens: number;
	};
	model?: string;
}

export class AIError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly details?: unknown
	) {
		super(message);
		this.name = 'AIError';
	}
}
