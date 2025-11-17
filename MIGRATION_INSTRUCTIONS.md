# Migration Instructions

The system has been updated to use a simplified, fixed-program model instead of the flexible product builder.

## What Changed

**Old Model:**
- Flexible products that admins could create
- pageTitle, introText, programHeading, programSubheading fields
- products JSON array

**New Model:**
- Fixed program: "Tenant Liability Waiver (100k in liability)"
- Optional add-ons: +5k, +10k, +20k content coverage
- Only 3 fields: propertyManagerName, insuranceVerificationUrl, selectedAddOns

## How to Migrate Your Database

### Step 1: Backup Your Database (Optional but Recommended)

```bash
# In Supabase dashboard, go to Database → Backups and create a manual backup
```

### Step 2: Run the Migrations

Open your terminal and run both migrations:

```bash
cd /Users/waltboxwell/habit-tracker/comp-notice
export DATABASE_URL="postgresql://postgres:Waltbox2001%21%21@db.fanuzxvnvdgmurvvfuuj.supabase.co:5432/postgres?sslmode=require"

# First migration: Simplify to fixed program
./node_modules/.bin/prisma migrate dev --name simplify_to_fixed_program

# Second migration: Add webview support
./node_modules/.bin/prisma migrate dev --name add_webview_url
```

**Or, if you get permission errors, try:**

```bash
cd /Users/waltboxwell/habit-tracker/comp-notice
DATABASE_URL="postgresql://postgres:Waltbox2001%21%21@db.fanuzxvnvdgmurvvfuuj.supabase.co:5432/postgres?sslmode=require" npx prisma migrate dev --name simplify_to_fixed_program
```

### Step 3: Verify Migration Completed

You should see:
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client
```

## If Migration Fails

If you get errors, you may need to reset the database:

```bash
export DATABASE_URL="postgresql://postgres:Waltbox2001%21%21@db.fanuzxvnvdgmurvvfuuj.supabase.co:5432/postgres?sslmode=require"
./node_modules/.bin/prisma migrate reset
```

**Warning:** This will delete all existing programs. Only do this if you don't have any important data.

## After Migration

The system is now set up for the simplified workflow:

1. Admin enters:
   - Property manager company name
   - Insurance verification URL
   - Select optional add-ons

2. System creates unique URL: `/programs/[slug]`

3. Tenants view program with base coverage + selected add-ons

## Testing

After migration, test the system:

```bash
npm run dev
```

Then:
1. Visit http://localhost:3000/admin/beagle-programs
2. Click "New Program"
3. Enter company name and insurance URL
4. Select add-ons you want
5. Click "Create & Publish"
6. Visit the generated URL

Done! ✅

