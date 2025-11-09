/**
 * AI Test Endpoint
 * Simple endpoint to verify AI service integration
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { AIService, AIProviderFactory } from '$lib/ai';
import { getAIConfig } from '$lib/ai/config';

/**
 * GET /api/ai/test
 * Simple health check that sends a test question
 */
export const GET: RequestHandler = async ({ platform }) => {
	try {
		if (!platform?.env) {
			return json(
				{
					error: 'Platform environment not available',
					details: 'Make sure you are running with Cloudflare bindings'
				},
				{ status: 500 }
			);
		}

		// Create AI service
		const config = getAIConfig(platform.env);
		const provider = AIProviderFactory.create(config);
		const ai = new AIService(provider);

		// Send a simple test question
		const startTime = Date.now();
		const answer = await ai.ask('Say "Hello from Claude!" and nothing else.');
		const duration = Date.now() - startTime;

		return json({
			success: true,
			provider: ai.getProviderName(),
			question: 'Say "Hello from Claude!" and nothing else.',
			answer,
			responseTime: `${duration}ms`
		});
	} catch (error) {
		console.error('AI test error:', error);
		return json(
			{
				error: 'AI service error',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * POST /api/ai/test
 * Send a custom question to the AI
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		if (!platform?.env) {
			return json(
				{
					error: 'Platform environment not available',
					details: 'Make sure you are running with Cloudflare bindings'
				},
				{ status: 500 }
			);
		}

		const { question, systemPrompt } = await request.json();

		if (!question || typeof question !== 'string') {
			return json({ error: 'Question is required and must be a string' }, { status: 400 });
		}

		// Create AI service
		const config = getAIConfig(platform.env);
		const provider = AIProviderFactory.create(config);
		const ai = new AIService(provider);

		// Send the question
		const startTime = Date.now();
		const answer = await ai.ask(question, systemPrompt);
		const duration = Date.now() - startTime;

		return json({
			success: true,
			provider: ai.getProviderName(),
			question,
			answer,
			responseTime: `${duration}ms`
		});
	} catch (error) {
		console.error('AI test error:', error);
		return json(
			{
				error: 'AI service error',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
