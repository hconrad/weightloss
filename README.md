# Weight Loss Tracker

A retro arcade-style weight tracking competition app built with SvelteKit and deployed to Cloudflare Pages with D1 database storage.

## Features

- 🎮 **Retro 8-bit Arcade Styling** - Dark theme with neon colors and CRT effects
- 🏆 **Leaderboard** - BMI-based competition rankings with trophies
- 📈 **Interactive Trend Charts** - D3-powered weight and BMI visualization
- 🔒 **Email Whitelist** - Secure, invite-only signup
- 📊 **BMI Tracking** - Automatic BMI calculation and progress tracking
- 👤 **User Authentication** - Secure login with bcrypt password hashing
- 📝 **Weight Logging** - Track weight with dates and notes

## How It Works

### Authentication System

The app uses a secure authentication system with the following features:

- **Email Whitelist**: Only pre-approved emails can create accounts (configured in `src/lib/config/whitelist.ts`)
- **Password Security**: Passwords are hashed using bcrypt with 10 salt rounds
- **Session Management**: HTTP-only cookies for secure session handling (7-day expiration)
- **Protected Routes**: Automatic redirection to login page for unauthenticated users

### Leaderboard & Competition

The app calculates a competitive leaderboard based on BMI improvement:

1. **BMI Calculation**: Uses the formula `(weight in lbs / (height in inches)²) × 703`
2. **Improvement Score**: Calculated as `(First BMI - Latest BMI) + Consistency Bonus`
3. **Consistency Bonus**: Up to 2 points based on number of entries (0.1 points per entry)
4. **Qualification**: Users need at least 2 weight entries to appear on the leaderboard
5. **Rankings**: Top 5 users displayed with trophies for top 3 (Gold, Silver, Bronze)

The leaderboard shows:
- User's first and latest BMI
- BMI improvement (positive numbers = weight loss)
- Number of weight entries
- Overall improvement score with ranking

### Interactive Trend Visualization

The app includes a D3-powered trend chart to visualize progress over time:

- **Dual-Axis Chart**: Simultaneously displays weight (pounds) and BMI on the same timeline
- **Weight Line**: Solid neon magenta line showing weight progression
- **BMI Line**: Dashed neon green line tracking BMI changes
- **Smart Scaling**: Automatically adjusts Y-axis ranges based on your data
- **Smooth Curves**: Uses monotone interpolation for cleaner visualization
- **Data Points**: Interactive points marking each logged entry
- **Retro Styling**: Glowing effects, arcade fonts, and neon colors matching the overall theme
- **Minimum Requirement**: Requires at least 2 weight entries to display (shows "INSUFFICIENT DATA" message otherwise)

The chart helps you visualize your weight loss journey at a glance, making it easy to spot trends and track progress toward your goals.

### Retro Arcade Styling

The app features a retro 8-bit arcade aesthetic:

- **Press Start 2P font** for authentic arcade feel
- **Neon color palette**: Cyan, magenta, green, yellow, and orange
- **CRT scanline effects** for authentic retro display
- **Pixel borders** and glowing text effects
- **Pulsing animations** and blink effects for important elements
- **Dark theme** optimized for readability

## Tech Stack

- **SvelteKit** - Web framework
- **Cloudflare Pages** - Static hosting
- **Cloudflare D1** - SQLite database
- **Cloudflare AI Gateway** - AI request routing and caching
- **Anthropic Claude** - AI-powered features
- **Drizzle ORM** - Type-safe database queries
- **TypeScript** - Type safety
- **Bcrypt** - Password hashing
- **D3.js** - Data visualization and trend charts

## Project Structure

```
weightloss/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── WeightTrendChart.svelte  # D3 trend visualization
│   │   ├── db/
│   │   │   ├── schema.ts      # Database schema (users + weight_entries)
│   │   │   └── client.ts      # Database client
│   │   ├── ai/                # AI module (DDD architecture)
│   │   │   ├── domain/
│   │   │   │   ├── AIProvider.ts    # Port interface
│   │   │   │   └── types.ts         # Domain types
│   │   │   ├── application/
│   │   │   │   ├── AIService.ts     # Main AI service
│   │   │   │   └── AIProviderFactory.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── CloudflareAIGatewayProvider.ts
│   │   │   ├── config.ts      # AI configuration helper
│   │   │   └── index.ts       # Barrel exports
│   │   ├── config/
│   │   │   └── whitelist.ts   # Email whitelist configuration
│   │   ├── auth.ts            # Authentication utilities
│   │   └── bmi.ts             # BMI calculation and leaderboard logic
│   ├── routes/
│   │   ├── +page.svelte       # Main page with leaderboard & trend chart
│   │   ├── +page.server.ts    # Server-side data loading
│   │   ├── login/
│   │   │   └── +page.svelte   # Login page
│   │   ├── signup/
│   │   │   └── +page.svelte   # Signup page
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── signup/+server.ts  # Signup endpoint
│   │       │   ├── login/+server.ts   # Login endpoint
│   │       │   └── logout/+server.ts  # Logout endpoint
│   │       └── weight/
│   │           └── +server.ts # API endpoint for adding entries
│   ├── hooks.server.ts        # Session management
│   ├── app.d.ts               # TypeScript definitions
│   ├── app.css                # Global retro styling
│   └── app.html               # HTML template
├── drizzle/
│   └── migrations/
│       └── 0000_initial_schema.sql  # Initial migration
├── wrangler.toml              # Cloudflare configuration
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create D1 Database (Local)

For local development, the D1 database is created automatically when you run the dev server.

### 3. Run Migrations (Local)

```bash
npm run db:migrate:local
```

### 4. Set Up AI (Optional)

The app includes AI capabilities powered by Anthropic Claude via Cloudflare AI Gateway. To enable AI features:

#### Create Cloudflare AI Gateway

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Navigate to **AI** → **AI Gateway** in the left sidebar
4. Click **Create Gateway**
5. Give it a name (e.g., `weightloss-ai-gateway`)
6. Click **Create**
7. Note your **Account ID** and **Gateway Slug** from the gateway URL

#### Get Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-...`)

#### Configure Environment Variables

**For Local Development:**

Create a `.dev.vars` file in your project root:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_AI_GATEWAY_SLUG=weightloss-ai-gateway
```

**For Production:**

Add these as environment variables in Cloudflare Pages Dashboard:
1. Go to Cloudflare Dashboard → Pages → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Add the three variables above for both Production and Preview environments

#### AI Gateway Benefits

- **Caching** - Cache AI responses to reduce costs
- **Rate Limiting** - Control API usage
- **Analytics** - Track requests and costs
- **Logging** - Monitor all AI interactions
- **Cost Control** - Set spending limits

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app.

## Deployment to Cloudflare

### 1. Create Cloudflare Account

Sign up at [Cloudflare](https://dash.cloudflare.com/sign-up) if you haven't already.

### 2. Create D1 Database (Remote)

```bash
npx wrangler d1 create weightloss-db
```

This will output a database ID. Copy this ID and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "weightloss-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with your actual database ID
```

### 3. Run Migrations (Remote)

```bash
npm run db:migrate:remote
```

### 4. Create Cloudflare Pages Project

```bash
npx wrangler pages project create weightloss-app --production-branch=main
```

### 5. Deploy to Cloudflare Pages

Now deploying is simple with the built-in script:

```bash
npm run deploy
```

This single command will:
- Build your application for production
- Deploy to Cloudflare Pages
- Handle uncommitted changes automatically

For production deployments with main branch tagging:

```bash
npm run deploy:production
```

### 6. Configure D1 Database Binding

**Important**: After deployment, you must bind the D1 database to your Pages project:

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/pages)
2. Click on your **weightloss-app** project
3. Go to **Settings** → **Functions**
4. Scroll down to **D1 database bindings**
5. Click **Add binding**
6. Set:
   - **Variable name**: `DB`
   - **D1 database**: Select `weightloss-db`
7. Click **Save**

Your app will now be fully functional at `https://weightloss-app.pages.dev`

### Alternative: GitHub Integration

You can also connect your GitHub repository to Cloudflare Pages for automatic deployments:

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.svelte-kit/cloudflare`
5. Add D1 database binding as described above

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Deployment
- `npm run deploy` - Build and deploy to Cloudflare Pages (recommended)
- `npm run deploy:production` - Build and deploy with main branch tag

### Database
- `npm run db:generate` - Generate new database migrations
- `npm run db:migrate:local` - Run migrations on local database
- `npm run db:migrate:remote` - Run migrations on remote database

### Utilities
- `npm run cf-typegen` - Generate Cloudflare Workers types

## Database Schema

The app uses two tables: `users` and `weight_entries`.

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,  -- bcrypt hashed
  height REAL NOT NULL,    -- height in inches
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### Weight Entries Table

```sql
CREATE TABLE weight_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  weight REAL NOT NULL,  -- weight in pounds
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

## AI Architecture

The AI module follows **Domain-Driven Design (DDD)** principles with a clean, layered architecture:

### Domain Layer (`src/lib/ai/domain/`)

**Core business logic and interfaces - provider-agnostic**

- `types.ts` - Domain value objects:
  - `Message` - Chat message structure
  - `AIRequest` - Standard request format
  - `AIResponse` - Standard response format
  - `AIError` - Domain-specific errors

- `AIProvider.ts` - Port interface (Anti-Corruption Layer):
  - Defines the contract all AI providers must implement
  - Ensures the domain is isolated from external API changes

### Application Layer (`src/lib/ai/application/`)

**Orchestration and use cases**

- `AIService.ts` - Main application service:
  - `chat(request)` - Send multi-turn conversations
  - `ask(question)` - Simple question/answer
  - Entry point for all AI features in your app

- `AIProviderFactory.ts` - Factory pattern:
  - Creates appropriate provider based on configuration
  - Easy to add new providers (OpenAI, Workers AI, etc.)

### Infrastructure Layer (`src/lib/ai/infrastructure/`)

**External integrations and adapters**

- `CloudflareAIGatewayProvider.ts` - Cloudflare AI Gateway adapter:
  - Implements the `AIProvider` interface
  - Translates between domain types and Anthropic API format
  - Handles Cloudflare AI Gateway routing
  - Uses Claude 3.5 Haiku by default

### Configuration (`src/lib/ai/config.ts`)

Helper function to build provider config from environment variables:

```typescript
import { getAIConfig } from '$lib/ai';

const config = getAIConfig(platform.env);
```

### Usage Example

```typescript
import { AIService, AIProviderFactory, getAIConfig } from '$lib/ai';

// In your SvelteKit endpoint
export async function POST({ request, platform }) {
  // Create AI service
  const config = getAIConfig(platform.env);
  const provider = AIProviderFactory.create(config);
  const ai = new AIService(provider);

  // Use it!
  const answer = await ai.ask('What are healthy weight loss tips?');

  return json({ answer });
}
```

### Why DDD?

- **Separation of Concerns** - Business logic isolated from infrastructure
- **Testability** - Easy to mock providers for testing
- **Flexibility** - Swap providers without changing application code
- **Future-Proof** - Add OpenAI, Workers AI, etc. without touching domain logic

## Managing the Email Whitelist

This app uses an **email whitelist** to control who can sign up. Only approved emails can create accounts.

### To Add a New User

1. Edit `src/lib/config/whitelist.ts`
2. Add their email to the `allowedEmails` array
3. Save and restart the dev server (or redeploy)

See [WHITELIST.md](./WHITELIST.md) for detailed instructions.

## Development Tips

### Managing the Email Whitelist

See [WHITELIST.md](./WHITELIST.md) for detailed instructions on adding/removing users.

### Adding New Fields

1. Update the schema in `src/lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Run migration locally: `npm run db:migrate:local`
4. Update the migration script names in `package.json` if needed
5. Deploy migration to production: `npm run db:migrate:remote`

### Local D1 Database

The local D1 database is stored in `.wrangler/state/v3/d1/`. You can inspect it using:

```bash
npx wrangler d1 execute weightloss-db --local --command "SELECT * FROM weight_entries"
```

### Node.js Compatibility

The app requires Node.js built-in modules (like `crypto` for bcrypt) which are enabled via the `nodejs_compat` compatibility flag in `wrangler.toml`:

```toml
compatibility_flags = ["nodejs_compat"]
```

This is essential for password hashing to work in the Cloudflare Workers runtime.

### Quick Deployment Workflow

For quick updates after making changes:

1. Make your code changes
2. Run `npm run deploy`
3. That's it! Your changes are live

The deploy script handles building and deployment in one command, and allows uncommitted changes so you don't need to git commit first.

## License

MIT
