# Beagle Program System - Quick Start Checklist

Get the system running in 5 minutes.

## ⏱️ 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
cd comp-notice
npm install
```

### Step 2: Create Environment File (1 min)
Create `.env.local`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/beagle_programs"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Don't have PostgreSQL running?**
- macOS: `brew install postgresql && brew services start postgresql`
- Linux: `sudo apt install postgresql && sudo service postgresql start`
- Or use hosted DB: [Railway](https://railway.app), [Supabase](https://supabase.com), [Vercel Postgres](https://vercel.com/postgres)

### Step 3: Setup Database (2 min)
```bash
# Create database
createdb beagle_programs

# Run migrations
npx prisma migrate dev --name init
```

### Step 4: Start Development Server (1 min)
```bash
npm run dev
```

✅ **Done!** Visit `http://localhost:3000`

---

## 🧪 First Test - Create a Program

### 1. Open Admin Panel
```
http://localhost:3000/admin/beagle-programs
```

### 2. Click "New Program"

### 3. Fill in the form:
- **Property Manager Name**: `Test Property`
- **Intro Text**: `This is a test program for testing insurance requirements.`
- **Insurance URL**: `https://example.com/verify`

### 4. Add a Product:
- Click "Add Product"
- **Name**: `Test Product`
- **Description**: `This is a test product`

### 5. Click "Create & Publish"

### 6. Visit the public page:
```
http://localhost:3000/programs/test-property
```

✅ **Success!** You should see the program rendered beautifully.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Full feature overview |
| [SETUP.md](./SETUP.md) | Detailed setup guide |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | API reference |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Technical overview |

---

## 🔧 Key Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npx prisma studio       # Open database UI
npx prisma migrate dev  # Create new migration
npm run lint             # Check for errors
```

---

## 🎯 What You Can Do Now

✅ Create programs with custom titles and content
✅ Add multiple products with descriptions and prices
✅ Add bullet points to products
✅ Reorder products
✅ See live preview while editing
✅ Publish/unpublish programs
✅ Tenants can view published programs
✅ Customize colors in `tailwind.config.js`

---

## 🚀 Next Steps

1. **Customize Branding**
   - Edit colors in `tailwind.config.js`
   - Update logo in `src/components/BeagleLogo.tsx`
   - Modify fonts in `src/app/layout.tsx`

2. **Implement Authentication**
   - Uncomment `TODO` comments in API routes
   - Add your auth middleware
   - Secure admin endpoints

3. **Deploy to Production**
   - Set up PostgreSQL database
   - Deploy to Vercel, Netlify, or your server
   - Configure environment variables

4. **Customize Further**
   - Add email notifications
   - Track form submissions
   - Add multi-language support
   - Customize validation rules

---

## ✨ Tips

- **Live Preview**: The admin form shows live updates on the right side - no need to refresh!
- **Auto-Generated**: Slug and title are auto-generated but can be customized
- **Database**: Use `npx prisma studio` to view/edit data directly
- **Types**: All API responses are TypeScript types - full IDE support
- **Responsive**: Test on mobile using browser DevTools

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `npm run dev -- -p 3001` |
| Database error | Check `DATABASE_URL` and ensure PostgreSQL is running |
| Module not found | Run `npm install` again |
| Type errors | Run `npx prisma generate` |
| Blank admin page | Check browser console for errors |

---

## 📞 Help

1. Check the [SETUP.md](./SETUP.md) troubleshooting section
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details
3. Use Prisma Studio to inspect database: `npx prisma studio`
4. Check browser console for client-side errors
5. Check terminal for server-side errors

---

## 🎉 You're Ready!

The system is fully functional and ready to use. Start creating programs! 🚀

