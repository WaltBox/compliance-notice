# Beagle Program System - Setup Guide

Complete setup instructions for the Beagle Program Notice + Program Webview system.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **PostgreSQL** 12 or higher (running locally or remotely)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL client

### 2. Configure Database

#### Option A: Local PostgreSQL

If PostgreSQL is running locally (default: localhost:5432):

```bash
# Create a new database
createdb beagle_programs

# Update DATABASE_URL in .env.local
# DATABASE_URL="postgresql://postgres:password@localhost:5432/beagle_programs"
```

#### Option B: Remote Database

Use your hosted PostgreSQL URL (e.g., from Vercel, Railway, Supabase):

```bash
# Update DATABASE_URL in .env.local
# DATABASE_URL="postgresql://user:pass@host:port/db"
```

### 3. Environment Variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/beagle_programs"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**Important**: 
- `DATABASE_URL` must be a valid PostgreSQL connection string
- `.env.local` is gitignored and won't be committed
- For production, set these in your deployment platform (Vercel, Heroku, etc.)

### 4. Initialize Database

Run Prisma migrations to create tables:

```bash
npx prisma migrate dev --name init
```

This will:
1. Create the `beagle_programs` table
2. Generate Prisma client code
3. Create migration files

You should see:
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client (X.X.X) to ./node_modules/@prisma/client in XXXms
```

### 5. Start Development Server

```bash
npm run dev
```

This starts:
- Next.js dev server at `http://localhost:3000`
- Hot module reloading
- Type checking

Visit `http://localhost:3000` in your browser to see the home page.

## Verification Checklist

- [ ] `npm install` completed without errors
- [ ] `.env.local` created with DATABASE_URL
- [ ] `npx prisma migrate dev` ran successfully
- [ ] No errors in terminal after `npm run dev`
- [ ] Can visit `http://localhost:3000` without errors
- [ ] Admin panel loads at `/admin/beagle-programs`

## Database Inspection

View and manage your database with Prisma Studio:

```bash
npx prisma studio
```

This opens `http://localhost:5555` where you can:
- View all programs
- Add/edit/delete records
- Inspect relationships

## Troubleshooting

### "Cannot find module '@prisma/client'"

```bash
npx prisma generate
npm install
```

### "Error: connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL is not running. Either:
- Start PostgreSQL: `brew services start postgresql` (macOS)
- Or use a remote database URL

### "Database 'beagle_programs' does not exist"

Create the database:

```bash
createdb beagle_programs
```

### Port 3000 already in use

```bash
npm run dev -- -p 3001
```

Or kill the process using port 3000:

```bash
lsof -ti:3000 | xargs kill -9
```

### Migrations out of sync

Reset your database (WARNING: deletes all data):

```bash
npx prisma migrate reset
```

Then run migrations again:

```bash
npx prisma migrate dev
```

## First Program Creation

1. Navigate to `http://localhost:3000/admin/beagle-programs`
2. Click "New Program"
3. Fill in the form:
   - **Property Manager Name**: "Test Property Management"
   - **Intro Text**: "Your lease requires renters insurance..."
   - **Insurance Verification URL**: "https://example.com/verify"
4. Click "Save Draft" to save
5. Add a product using "Add Product" button
6. Click "Create & Publish" to publish

The program will be available at:
```
http://localhost:3000/programs/test-property-management
```

## Development Workflow

### Making Code Changes

1. Edit files in `src/`
2. Changes auto-reload in browser
3. Type errors show in terminal and browser

### Database Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Confirm and run new migration

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### To Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Then set environment variables in Vercel dashboard:
- `DATABASE_URL` (your production PostgreSQL URL)

### To Other Platforms

Set these environment variables in your deployment platform:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_API_URL` - Your public API URL
- `NODE_ENV=production`

Then run:
```bash
npm run build
npm start
```

## Project Structure Quick Reference

```
comp-notice/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/             # Utilities and helpers
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global CSS
├── prisma/
│   └── schema.prisma    # Database schema
├── public/              # Static assets
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── next.config.js       # Next.js config
├── tailwind.config.js   # Tailwind config
└── postcss.config.js    # PostCSS config
```

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database UI |
| `npx prisma migrate dev` | Run migrations |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate reset` | Reset database |

## Next Steps

1. ✅ Complete setup steps above
2. 📖 Read [README.md](./README.md) for feature overview
3. 🏗️ Review project structure in `src/`
4. 🎨 Customize colors in `tailwind.config.js`
5. 🚀 Create your first program

## Support

- Check terminal for error messages
- Use Prisma Studio to inspect database
- Review component comments for implementation details
- Check `/src/types/index.ts` for TypeScript interfaces

Happy building! 🐕

