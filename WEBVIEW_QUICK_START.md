# Webview Feature - Quick Start

## ⚡ TL;DR

Admins can now embed external webpages (like https://tools.yourrenterskit.com/...) directly on the program page!

## 🚀 5-Minute Setup

### 1. Run Migration
```bash
export DATABASE_URL="postgresql://postgres:Waltbox2001%21%21@db.fanuzxvnvdgmurvvfuuj.supabase.co:5432/postgres?sslmode=require"
./node_modules/.bin/prisma migrate dev --name add_webview_url
```

### 2. Start Server
```bash
npm run dev
```

### 3. Create Program with Webview

Visit: http://localhost:3000/admin/beagle-programs/new

Fill in:
- **Property Manager Name**: `Test Company`
- **Insurance URL**: `https://example.com/verify`
- **Embedded Webview URL** (NEW!): `https://tools.yourrenterskit.com/renter-benefits/8omnj4cltuawsbsfzz`

Select add-ons if desired, then click "Create & Publish"

### 4. View Result

Visit the generated URL and scroll down to see:
- Company name
- Base coverage
- Selected add-ons
- **→ EMBEDDED WEBVIEW CONTENT ←** (NEW!)
- Insurance verification button

## 📊 What Changed

### Database
Added optional field:
```
webviewUrl String?  // e.g., "https://tools.yourrenterskit.com/..."
```

### Admin Form
New field:
```
Embedded Webview URL (Optional)
[_________________________________]
```

### Public Page
If webviewUrl provided, shows:
```
[Embedded iframe, 600px height, 100% width]
```

## 💡 Perfect For

✅ Renter benefits kits (like your example)
✅ Insurance provider pages
✅ Educational content
✅ Interactive tools
✅ Program details displays

## 🎯 Example

```
URL to embed:
https://tools.yourrenterskit.com/renter-benefits/8omnj4cltuawsbsfzz

Admin enters it ↓

Tenant sees it embedded on page ↓

Tenant can interact with it (scroll, click, etc.)
```

## ⚙️ Details

- **Field**: Optional (leave blank for no webview)
- **Type**: Any valid HTTPS URL
- **Display**: Embedded iframe, 600px height
- **Responsive**: Full width on all devices
- **Security**: Sandboxed iframe (safe)

## 🔗 See Also

- [WEBVIEW_FEATURE.md](./WEBVIEW_FEATURE.md) - Full documentation
- [NEXT_STEPS.md](./NEXT_STEPS.md) - General setup
- [SYSTEM_REDESIGN.md](./SYSTEM_REDESIGN.md) - Overall design

## ✅ You're Done!

The webview feature is ready to use. Admins can now embed any webpage they want on program pages.

**Next:** Run the migration and test it out! 🚀

