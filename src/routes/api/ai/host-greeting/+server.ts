/**
 * AI Game Show Host Greeting Endpoint
 * The AI reviews standings and greets the user with personality
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { AIService, AIProviderFactory } from '$lib/ai';
import { getAIConfig } from '$lib/ai/config';
import type { UserStats } from '$lib/bmi';

interface GreetingRequest {
	leaderboard: UserStats[];
	userStats?: UserStats | null;
}

const HOST_PERSONALITY = `You are the sarcastic, witty host of "THE WEIGHT LOSS ARENA" - a retro 8-bit style game show.

Your personality:
- Sarcastic and playful, with a sharp tongue
- You roast contestants but it's all in good fun
- Sometimes supportive when you feel like it, but don't overdo it
- You reference 80s/90s game shows and arcade culture
- You use phrases like "PLAYER ONE", "GAME OVER", "HIGH SCORE", "LEVEL UP"
- You're not afraid to call out lack of progress or slacking
- You celebrate wins with over-the-top enthusiasm
- Keep responses SHORT - 2-3 sentences max, like a punchy game show host

Rules:
- The contestants have thick skin - be playful and mean but never cruel
- Focus on the competition standings and their performance
- Make references to arcade/gaming culture
- Use ALL CAPS for emphasis occasionally
- Keep it fun and energetic
- NO emojis or special characters

Remember: You're here to entertain and motivate through playful trash talk!`;

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	try {
		// Require authentication
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		if (!platform?.env) {
			return json(
				{
					error: 'Platform environment not available'
				},
				{ status: 500 }
			);
		}

		// Check for required environment variables
		const missingVars = [];
		if (!platform.env.ANTHROPIC_API_KEY) missingVars.push('ANTHROPIC_API_KEY');
		if (!platform.env.CF_ACCOUNT_ID) missingVars.push('CF_ACCOUNT_ID');
		if (!platform.env.CF_AI_GATEWAY_SLUG) missingVars.push('CF_AI_GATEWAY_SLUG');

		if (missingVars.length > 0) {
			console.error('Missing environment variables:', missingVars);
			return json(
				{
					error: 'Missing required environment variables',
					details: `Missing: ${missingVars.join(', ')}`
				},
				{ status: 500 }
			);
		}

		const { leaderboard, userStats }: GreetingRequest = await request.json();

		// Build context for the AI
		const userName = locals.user.firstName;
		const userFullName = `${locals.user.firstName} ${locals.user.lastName}`;

		let context = `Current player: ${userFullName}\n\n`;
		context += `LEADERBOARD - TOP 5:\n`;

		if (leaderboard && leaderboard.length > 0) {
			leaderboard.forEach((player, index) => {
				const rank = index + 1;
				const playerName = `${player.firstName} ${player.lastName}`;
				const isCurrentUser = player.userId === locals.user?.id;
				const marker = isCurrentUser ? ' <-- CURRENT PLAYER' : '';

				context += `${rank}. ${playerName}${marker}\n`;
				context += `   BMI Change: ${player.bmiChange.toFixed(2)} (${player.firstBMI.toFixed(1)} → ${player.latestBMI.toFixed(1)})\n`;
				context += `   Weight Change: ${player.weightChange.toFixed(1)} lbs\n`;
				context += `   Entries: ${player.entryCount}\n`;
			});
		} else {
			context += 'No standings yet - competition just started!\n';
		}

		// Add user-specific info if they're not on the leaderboard
		if (userStats && !leaderboard.some(p => p.userId === locals.user?.id)) {
			context += `\n${userFullName}'s Stats (NOT ON LEADERBOARD):\n`;
			context += `BMI Change: ${userStats.bmiChange.toFixed(2)}\n`;
			context += `Weight Change: ${userStats.weightChange.toFixed(1)} lbs\n`;
			context += `Entries: ${userStats.entryCount}\n`;
		} else if (!userStats) {
			context += `\n${userFullName} has NO ENTRIES YET! Total newbie.\n`;
		}

		// Create AI service
		const config = getAIConfig(platform.env);
		const provider = AIProviderFactory.create(config);
		const ai = new AIService(provider);

		// Get the greeting
		const greeting = await ai.ask(
			`Welcome ${userName} to the arena. Review the standings and give them a greeting. Make it personal based on their performance (or lack thereof).`,
			HOST_PERSONALITY
		);

		return json({
			success: true,
			greeting
		});
	} catch (error) {
		console.error('AI host greeting error:', error);
		return json(
			{
				error: 'Failed to generate greeting',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
