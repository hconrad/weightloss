# Weight Loss Tracker

A simple weight tracking application built with SvelteKit and deployed to Cloudflare Pages with D1 database storage.

## Tech Stack

- **SvelteKit** - Web framework
- **Cloudflare Pages** - Static hosting
- **Cloudflare D1** - SQLite database
- **Drizzle ORM** - Type-safe database queries
- **TypeScript** - Type safety

## Project Structure

```
weightloss/
├── src/
│   ├── lib/
│   │   └── db/
│   │       ├── schema.ts      # Database schema
│   │       └── client.ts      # Database client
│   ├── routes/
│   │   ├── +page.svelte       # Main page
│   │   ├── +page.server.ts    # Server-side data loading
│   │   └── api/
│   │       └── weight/
│   │           └── +server.ts # API endpoint for adding entries
│   ├── app.d.ts               # TypeScript definitions
│   └── app.html               # HTML template
├── drizzle/
│   └── migrations/            # Database migrations
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

### 4. Start Development Server

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

### 4. Deploy to Cloudflare Pages

```bash
npm run deploy
```

Or connect your GitHub repository to Cloudflare Pages for automatic deployments:

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.svelte-kit/cloudflare`
5. Add D1 database binding in Settings → Functions → D1 database bindings:
   - **Variable name**: `DB`
   - **D1 database**: Select your `weightloss-db`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Build and deploy to Cloudflare
- `npm run db:generate` - Generate new database migrations
- `npm run db:migrate:local` - Run migrations on local database
- `npm run db:migrate:remote` - Run migrations on remote database
- `npm run cf-typegen` - Generate Cloudflare Workers types

## Database Schema

The app uses a single table `weight_entries`:

```sql
CREATE TABLE weight_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  weight REAL NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

## Features

- Add weight entries with date, weight, and optional notes
- View recent weight entries (last 10)
- Fully serverless with Cloudflare Pages Functions
- Type-safe database queries with Drizzle ORM
- Responsive design

## Development Tips

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

## License

MIT
