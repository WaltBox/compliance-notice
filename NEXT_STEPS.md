# Next Steps - Getting Started with the Redesigned System

Your Beagle Program system has been completely redesigned for simplicity and purpose. Here's exactly what to do next:

---

## 🔧 Step 1: Run the Database Migration

The system is now using a **simpler database schema**. You need to migrate your database.

### In Your Terminal

```bash
cd /Users/waltboxwell/habit-tracker/comp-notice
export DATABASE_URL="postgresql://postgres:Waltbox2001%21%21@db.fanuzxvnvdgmurvvfuuj.supabase.co:5432/postgres?sslmode=require"
./node_modules/.bin/prisma migrate dev --name simplify_to_fixed_program
```

You should see:
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client
```

---

## 🚀 Step 2: Start the Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
```

---

## 📋 Step 3: Test the New System

### Visit Admin Panel
Open: **http://localhost:3000/admin/beagle-programs**

Click "New Program" and fill in:

```
Property Manager Name: Santa Fe Property Management
Insurance Verification URL: https://example.com/verify
Add-Ons: Check ✓ both "+5k" and "+10k" options
```

Then click "Create & Publish"

### View Public Program
You'll be redirected to: **http://localhost:3000/programs/santa-fe-property-management**

You should see:
- Company name (orange, bold)
- "Tenant Liability Waiver (100k in liability)"
- Both selected add-ons displayed
- "Verify Insurance Coverage" button

---

## 📚 Documentation to Read

| Document | Purpose |
|----------|---------|
| **[SYSTEM_REDESIGN.md](./SYSTEM_REDESIGN.md)** | 👈 **READ THIS FIRST** - Understand the new design |
| [MIGRATION_INSTRUCTIONS.md](./MIGRATION_INSTRUCTIONS.md) | Detailed migration steps if needed |
| [README.md](./README.md) | System overview |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | API reference |

---

## 🎯 What's New?

### Admin Creates Programs With:
1. **Property Manager Name** (auto-generates URL)
2. **Insurance Verification URL**
3. **Optional Add-Ons** (checkboxes)

### Fixed Program Type:
```
Tenant Liability Waiver (100k in liability)
  Optional:
    - +5k in content coverage
    - +10k in content coverage
    - +20k in content coverage
```

### Unique URL Per PM:
```
/programs/santa-fe-property-management
/programs/beachside-rentals
/programs/downtown-management
```

---

## 🎨 The Admin Form

```
Program Type (Fixed):
Tenant Liability Waiver (100k in liability)

Property Manager Name *
[________________________________]

URL Slug *
[________________________________] (auto-filled)
/programs/santa-fe-property-management

Insurance Verification URL *
[________________________________]

Optional Add-Ons
☐ +5k in content coverage
☐ +10k in content coverage
☐ +20k in content coverage

[Save Draft] [Publish]
```

That's it! No complex forms, no product builders.

---

## 👥 Tenant Experience

Simple, clean page showing:
- Company name (prominent, orange)
- Base coverage amount
- Selected add-ons (if any)
- Insurance verification button

---

## 🔄 Complete Workflow

```
1. Admin visits /admin/beagle-programs
   ↓
2. Clicks "New Program"
   ↓
3. Enters 3 pieces of info
   ↓
4. Selects add-ons with checkboxes
   ↓
5. Clicks "Create & Publish"
   ↓
6. Program lives at unique URL
   ↓
7. Admin shares URL with tenants
   ↓
8. Tenants visit URL and verify insurance
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/components/SimpleAdminEditor.tsx` | Admin form UI |
| `src/components/BeagleProgramPagePreview.tsx` | Tenant-facing page |
| `src/types/index.ts` | AVAILABLE_ADD_ONS & BASE_PROGRAM config |
| `prisma/schema.prisma` | Updated database schema |

---

## ⚙️ Environment

Make sure you have set:
```bash
export DATABASE_URL="postgresql://postgres:Waltbox2001%21%21@db.fanuzxvnvdgmurvvfuuj.supabase.co:5432/postgres?sslmode=require"
```

Or use this to make it permanent:
```bash
echo 'export DATABASE_URL="postgresql://postgres:Waltbox2001%21%21@db.fanuzxvnvdgmurvvfuuj.supabase.co:5432/postgres?sslmode=require"' >> ~/.zshrc
source ~/.zshrc
```

Then `npm run dev` will work without setting the variable each time.

---

## ✅ Troubleshooting

### "DATABASE_URL not found"
Make sure you set the environment variable before running commands:
```bash
export DATABASE_URL="..."
npx prisma migrate dev --name ...
```

### "Can't reach database"
- Check your internet connection
- Verify Supabase project is running
- Check password is correct (Waltbox2001!!)

### "Migration fails"
See [MIGRATION_INSTRUCTIONS.md](./MIGRATION_INSTRUCTIONS.md) troubleshooting section

### "Admin form won't load"
- Check browser console for errors
- Make sure server started successfully: `npm run dev`
- Try hard refresh: Cmd+Shift+R (macOS) or Ctrl+Shift+R (Windows/Linux)

---

## 🚀 You're Ready!

The system is now:
- ✅ Simplified and focused
- ✅ Easy for admins to use
- ✅ Beautiful for tenants
- ✅ Type-safe with TypeScript
- ✅ Ready to deploy

### Let's go! 

1. Run migration: `npx prisma migrate dev --name simplify_to_fixed_program`
2. Start server: `npm run dev`
3. Create your first program
4. Share the URL with tenants

Done! 🎉

---

## 📞 Need Help?

Check:
1. [SYSTEM_REDESIGN.md](./SYSTEM_REDESIGN.md) - Understand the design
2. [MIGRATION_INSTRUCTIONS.md](./MIGRATION_INSTRUCTIONS.md) - Migration help
3. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
4. Browser console for errors (F12)
5. Terminal output for server errors

Let me know if you hit any issues! 🙂

