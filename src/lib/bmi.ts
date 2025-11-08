/**
 * Calculate BMI using imperial units (pounds and inches)
 * Formula: (weight in lbs / (height in inches)²) × 703
 */
export function calculateBMI(weightLbs: number, heightInches: number): number {
	if (heightInches <= 0) return 0;
	return (weightLbs / (heightInches * heightInches)) * 703;
}

/**
 * Get BMI category based on BMI value
 */
export function getBMICategory(bmi: number): string {
	if (bmi < 18.5) return 'UNDERWEIGHT';
	if (bmi < 25) return 'NORMAL';
	if (bmi < 30) return 'OVERWEIGHT';
	return 'OBESE';
}

/**
 * Get color for BMI category (using retro neon colors)
 */
export function getBMIColor(bmi: number): string {
	if (bmi < 18.5) return 'var(--neon-cyan)'; // Underweight
	if (bmi < 25) return 'var(--neon-green)'; // Normal
	if (bmi < 30) return 'var(--neon-yellow)'; // Overweight
	return 'var(--neon-orange)'; // Obese
}

export interface UserStats {
	userId: number;
	firstName: string;
	lastName: string;
	height: number;
	firstWeight: number;
	latestWeight: number;
	firstBMI: number;
	latestBMI: number;
	bmiChange: number;
	weightChange: number;
	entryCount: number;
}

/**
 * Calculate improvement score for ranking
 * Positive score = improvement (weight/BMI decreased)
 */
export function calculateImprovementScore(stats: UserStats): number {
	// BMI improvement is the primary factor
	const bmiImprovement = stats.firstBMI - stats.latestBMI;

	// Bonus for consistency (more entries = more committed)
	const consistencyBonus = Math.min(stats.entryCount * 0.1, 2);

	return bmiImprovement + consistencyBonus;
}
