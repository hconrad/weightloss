/**
 * AI Module Barrel Export
 * Clean interface for importing AI functionality
 */

// Domain exports
export type { AIProvider } from './domain/AIProvider';
export type { Message, MessageRole, AIRequest, AIResponse } from './domain/types';
export { AIError } from './domain/types';

// Application exports
export { AIService } from './application/AIService';
export { AIProviderFactory } from './application/AIProviderFactory';
export type { AIProviderType, AIProviderConfig } from './application/AIProviderFactory';

// Infrastructure exports (usually you won't import these directly, but available if needed)
export { CloudflareAIGatewayProvider } from './infrastructure/CloudflareAIGatewayProvider';
