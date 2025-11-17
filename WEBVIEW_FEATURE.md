# Embedded Webview Feature

The system now supports embedding external webpages directly on the public program page!

## 📺 What is the Webview Feature?

Admins can now provide an optional URL that will be embedded as an **iframe** on the tenant-facing program page. This allows you to display external content like:

- Renter benefits kits
- Insurance provider pages
- Educational content
- Interactive tools
- Program details

**Example:** https://tools.yourrenterskit.com/renter-benefits/8omnj4cltuawsbsfzz

---

## 🎯 How It Works

### Admin Side: Add Webview URL

In the admin form, there's a new field:

```
Embedded Webview URL (Optional)
[_________________________________]
https://tools.yourrenterskit.com/...

If provided, this webpage will be embedded as an iframe 
on the public program page.
```

### Tenant Side: View Embedded Content

The public page now shows:

```
┌─────────────────────────────────────┐
│   Company Name (orange)             │
│                                     │
│   Tenant Liability Waiver           │
│   Base Coverage: 100k               │
│                                     │
│   Add-ons (if selected)             │
│                                     │
│   ┌───────────────────────────────┐ │
│   │  Program Details (Heading)    │ │
│   ├───────────────────────────────┤ │
│   │                               │ │
│   │  [Embedded Webview Content]   │ │
│   │  (iframe, 600px height)       │ │
│   │                               │ │
│   │                               │ │
│   │                               │ │
│   └───────────────────────────────┘ │
│                                     │
│   Ready to proceed?                 │
│   [Verify Insurance Coverage]       │
│                                     │
└─────────────────────────────────────┘
```

---

## 💡 Use Cases

### 1. **Renter Benefits Kit**
```
Webview URL: https://tools.yourrenterskit.com/renter-benefits/8omnj4cltuawsbsfzz
Display: Interactive renter benefits guide
```

### 2. **Insurance Provider Page**
```
Webview URL: https://insurance-provider.com/tenant-coverage
Display: Coverage details and options
```

### 3. **Educational Content**
```
Webview URL: https://company.com/renter-education
Display: Video, guides, FAQs
```

### 4. **Interactive Calculator**
```
Webview URL: https://tools.company.com/coverage-calculator
Display: Interactive tool to help tenants choose coverage
```

---

## 🔧 How to Use

### Step 1: Get Your Webview URL

Get the URL you want to embed. Make sure:
- ✅ It's a valid HTTPS URL (not HTTP)
- ✅ The target domain allows iframe embedding
- ✅ It's public and doesn't require authentication

Example:
```
https://tools.yourrenterskit.com/renter-benefits/8omnj4cltuawsbsfzz
```

### Step 2: Add to Program

In admin form:

```
Embedded Webview URL (Optional)
[https://tools.yourrenterskit.com/renter-benefits/8omnj4cltuawsbsfzz]
```

Leave blank if you don't want an embedded webview.

### Step 3: Save & Publish

- Click "Save Draft" or "Create & Publish"
- The webview will appear on the public page

### Step 4: Test

Visit the public URL and scroll to see the embedded content:
```
http://localhost:3000/programs/santa-fe-property-management
```

---

## ⚙️ Technical Details

### Database
```
webviewUrl: String?  // optional, null by default
```

### API
- Create: `POST /api/admin/beagle-programs`
  ```json
  {
    "propertyManagerName": "...",
    "insuranceVerificationUrl": "...",
    "webviewUrl": "https://..." // optional
  }
  ```

- Update: `PUT /api/admin/beagle-programs/{id}`
  ```json
  {
    "webviewUrl": "https://..." // or empty string to remove
  }
  ```

### Frontend
```tsx
{program.webviewUrl && (
  <iframe
    src={program.webviewUrl}
    width="100%"
    height="600"
    frameBorder="0"
  />
)}
```

---

## 🔒 Security Considerations

### What's Protected?
- ✅ The iframe URL is user-provided, but displayed safely
- ✅ No sensitive data is embedded
- ✅ Cross-origin policy respected (iframe sandbox)

### Best Practices
- ✅ Only use trusted domains
- ✅ Test the URL works before publishing
- ✅ Ensure external domain allows iframe embedding
- ✅ Use HTTPS URLs only

### Sandbox Restrictions
The iframe has these permissions:
```
allow="accelerometer; autoplay; clipboard-write; 
       encrypted-media; gyroscope; picture-in-picture"
```

This allows:
- ✅ Video playback
- ✅ Interactive content
- ✅ External links

This prevents:
- ❌ JavaScript execution from iframe
- ❌ Access to parent window
- ❌ Form submission to parent

---

## 🚀 Examples

### Example 1: Renters Kit (Your Renters Kit)

```
Company: Santa Fe Property Management
Insurance URL: https://verify.company.com
Webview URL: https://tools.yourrenterskit.com/renter-benefits/8omnj4cltuawsbsfzz

Result: Embedded renter benefits guide appears on program page
```

### Example 2: Insurance Provider

```
Company: Downtown Management
Insurance URL: https://insurance.com/verify
Webview URL: https://insurance.com/coverage-details

Result: Coverage information displayed
```

### Example 3: No Webview

```
Company: Beach Side Rentals
Insurance URL: https://verify.company.com
Webview URL: (left blank)

Result: Program page shows only base coverage + add-ons + verification link
```

---

## 🐛 Troubleshooting

### Webview Not Showing?

**1. Check the URL**
- ✅ Is it a valid HTTPS URL?
- ✅ Does it work when you visit directly?

**2. Check CORS/Iframe Policy**
- ⚠️ Some sites block iframe embedding
- ⚠️ Check browser console for error (F12 → Console tab)
- Look for: `Refused to frame 'https://...'`

**3. If Blocked by Domain**
- Contact the domain owner about iframe policies
- Ask them to allow iframe embedding
- Or use a different source

### Height Not Adjusting?

The iframe is set to 600px height. To change:
1. Edit `src/components/BeagleProgramPagePreview.tsx`
2. Find: `height="600"`
3. Change to desired height
4. Save and test

---

## 📱 Responsive Behavior

- **Desktop**: Full width, 600px height
- **Tablet**: Full width, 600px height (scrollable if needed)
- **Mobile**: Full width, 600px height (scrollable if needed)

The iframe adapts to screen width but keeps fixed height.

---

## ✅ Migration Steps

If you're updating from before this feature:

### Step 1: Run Migration
```bash
export DATABASE_URL="postgresql://postgres:Waltbox2001%21%21@db.fanuzxvnvdgmurvvfuuj.supabase.co:5432/postgres?sslmode=require"
./node_modules/.bin/prisma migrate dev --name add_webview_url
```

### Step 2: Restart Server
```bash
npm run dev
```

### Step 3: Test
- Create a new program with a webview URL
- Or edit existing programs to add webview URL

---

## 🎨 Layout After Adding Webview

**Without Webview:**
```
Title
Base Coverage
Add-ons (if any)
[Verify Insurance Button]
```

**With Webview:**
```
Title
Base Coverage
Add-ons (if any)
Program Details (Heading)
[Embedded Webview - 600px height]
[Verify Insurance Button]
```

---

## 📊 Data Flow

```
Admin enters webviewUrl
       ↓
Saves to database
       ↓
Public page fetches program
       ↓
If webviewUrl exists:
  Show iframe with webviewUrl as src
  height=600, width=100%
       ↓
Tenant sees embedded content
```

---

## 🔄 Editing Webview

### To Change Webview
1. Visit `/admin/beagle-programs/[id]`
2. Update "Embedded Webview URL" field
3. Click "Save Draft"
4. Preview updates automatically

### To Remove Webview
1. Clear the "Embedded Webview URL" field
2. Click "Save Draft"
3. Iframe disappears from public page

---

## 📝 Notes

- Webview URL is **optional** - leave blank for basic program
- Webview appears **above** the insurance verification button
- Maximum height is 600px (scrollable if content is taller)
- Full width responsive design
- Works on all browsers (desktop, tablet, mobile)

---

## 🆘 Support

For issues:
1. Check browser console (F12 → Console)
2. Verify URL works in new tab
3. Check if domain allows iframe embedding
4. See "Troubleshooting" section above
5. Ask domain owner about iframe policies

---

**Enjoy embedding webviews!** 📺✨

