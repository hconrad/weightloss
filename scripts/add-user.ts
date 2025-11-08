import bcrypt from 'bcryptjs';

// Simple script to generate INSERT SQL for a user
// Usage: ts-node scripts/add-user.ts

async function generateUserSQL() {
	const user = {
		firstName: 'John',
		lastName: 'Doe',
		email: 'john@example.com',
		password: 'password123',
		height: 70 // inches
	};

	const hashedPassword = await bcrypt.hash(user.password, 10);

	const sql = `INSERT INTO users (first_name, last_name, email, password, height, created_at)
VALUES ('${user.firstName}', '${user.lastName}', '${user.email}', '${hashedPassword}', ${user.height}, CURRENT_TIMESTAMP);`;

	console.log('\n=== Generated SQL ===\n');
	console.log(sql);
	console.log('\n=== To insert this user, run: ===\n');
	console.log(
		`npx wrangler d1 execute weightloss-db --local --command "${sql.replace(/\n/g, ' ')}"`
	);
	console.log('\n');
}

generateUserSQL().catch(console.error);
