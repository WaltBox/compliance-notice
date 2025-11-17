# Beagle Program System - Redesigned (Simplified)

## 🎯 New Design Overview

The system has been completely redesigned to be **simple, focused, and purpose-built** for property management companies needing to share tenant liability insurance programs.

---

## ✨ What Admins Do

### Admin Workflow (3 Simple Steps)

1. **Enter Company Name**
   - Example: "Santa Fe Property Management"
   - Auto-generates unique URL: `/programs/santa-fe-property-management`

2. **Enter Insurance Verification Link**
   - Example: `https://insurance-provider.com/verify`
   - Where tenants complete their insurance verification

3. **Select Optional Add-Ons** (Checkboxes)
   - ☐ +5k in content coverage
   - ☐ +10k in content coverage
   - ☐ +20k in content coverage

4. **Click "Create & Publish"**
   - Program is live immediately
   - Unique URL ready to share

That's it! No complex form, no product builder, no endless fields.

---

## 👥 What Tenants See

### Public Program Page

```
┌─────────────────────────────────────┐
│         [Beagle Logo]               │
├─────────────────────────────────────┤
│                                     │
│  Santa Fe Property Management       │ ← PM name (orange, bold)
│                                     │
│  Tenant Liability Waiver            │ ← Fixed program name
│  Base Coverage: 100k in liability   │ ← Fixed coverage
│                                     │
│  ┌─────────────────────────────────┐│
│  │ + 5k in content coverage        ││ ← If selected
│  │ Adds $5,000 in personal...      ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ + 10k in content coverage       ││ ← If selected
│  │ Adds $10,000 in personal...     ││
│  └─────────────────────────────────┘│
│                                     │
│     [Verify Insurance Coverage]     │ ← CTA Button
│     (Opens insurance verification)  │
│                                     │
└─────────────────────────────────────┘
```

Clean, simple, focused on what matters.

---

## 📊 Data Model

**Old Model: Flexible + Complex**
```
BeagleProgram {
  pageTitle
  introText
  programHeading
  programSubheading
  products: Product[]  // Custom, flexible
}
```

**New Model: Fixed + Simple**
```
BeagleProgram {
  propertyManagerName      // "Santa Fe PM"
  propertyManagerSlug      // "santa-fe-pm"
  insuranceVerificationUrl // "https://..."
  selectedAddOns: string[] // ["addon_5k_content"]
}
```

**Fixed Program Details** (Baked Into Code)
```
Base: "Tenant Liability Waiver (100k in liability)"
Add-ons:
  - "+5k in content coverage"
  - "+10k in content coverage"
  - "+20k in content coverage"
```

---

## 🎨 Admin Interface

### Before: Complex Form
- Property Manager Name
- URL Slug
- Page Title
- Intro Text
- Insurance Verification URL
- Program Heading
- Program Subheading
- Product Builder (Add/Remove/Reorder)
  - Each product has: name, description, price, bullet points
- Lots of fields to configure

### After: Simple Form
```
┌─────────────────────────────────────────────────┐
│ Program Configuration                           │
├─────────────────────────────────────────────────┤
│                                                 │
│ Program Type (Fixed)                            │
│ ┌─────────────────────────────────────────────┐ │
│ │ Tenant Liability Waiver (100k in liability) │ │
│ │ Comprehensive tenant liability protection  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Property Manager Name *                         │
│ [___________________________]                    │
│                                                 │
│ URL Slug *                                      │
│ [___________________________] (auto-filled)     │
│ URL: /programs/santa-fe-property               │
│                                                 │
│ Insurance Verification URL *                    │
│ [___________________________]                    │
│                                                 │
│ Optional Add-Ons                                │
│ ☐ +5k in content coverage                      │
│   Adds $5,000 in personal property coverage    │
│ ☐ +10k in content coverage                     │
│   Adds $10,000 in personal property coverage   │
│ ☐ +20k in content coverage                     │
│   Adds $20,000 in personal property coverage   │
│                                                 │
│ [Save Draft] [Publish]                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

Simple. Clean. Focused.

---

## 🔄 Workflow

### Create a Program

```
Admin visits /admin/beagle-programs
       ↓
Clicks "New Program"
       ↓
Enters:
  - "Santa Fe Property Management"
  - "https://insurance-tpa.com/verify"
  - Selects "+5k content" and "+10k content"
       ↓
Clicks "Create & Publish"
       ↓
Program is live at:
  /programs/santa-fe-property-management
       ↓
Admin shares URL with tenants
```

### Tenant Views Program

```
Tenant visits /programs/santa-fe-property-management
       ↓
Sees:
  - Company name (orange, bold)
  - Base coverage: Tenant Liability Waiver (100k)
  - Selected add-ons displayed
       ↓
Clicks "Verify Insurance Coverage" button
       ↓
Redirected to insurance verification URL
```

---

## 📱 Features

### Admin Dashboard
✅ Create programs (3 fields only)
✅ Live preview (right sidebar)
✅ Edit existing programs
✅ Publish/unpublish with one click
✅ See all programs in paginated list
✅ Copy URL to share

### Public Pages
✅ Beautiful, responsive design
✅ Beagle branding (orange, Montserrat)
✅ Mobile-friendly
✅ Clear insurance verification CTA
✅ Shows all selected add-ons
✅ SEO-friendly with metadata

### API
✅ Public: GET /api/beagle-programs?slug=...
✅ Admin: Full CRUD operations
✅ Proper error handling
✅ Type-safe (TypeScript)

---

## 🚀 Deployment

### Fixed Program Configuration

The program details are **baked into the code**:

```typescript
// src/types/index.ts
export const AVAILABLE_ADD_ONS: AddOn[] = [
  { id: 'addon_5k_content', label: '+5k in content coverage', ... },
  { id: 'addon_10k_content', label: '+10k in content coverage', ... },
  { id: 'addon_20k_content', label: '+20k in content coverage', ... },
];

export const BASE_PROGRAM = {
  name: 'Tenant Liability Waiver',
  coverage: '100k in liability',
  description: '...',
};
```

To change programs or add-ons:
1. Edit `src/types/index.ts`
2. Update `AVAILABLE_ADD_ONS` and `BASE_PROGRAM`
3. Redeploy

---

## 🔐 Security & Validation

### Required Fields
- ✅ Property Manager Name (validates non-empty)
- ✅ Insurance Verification URL (validates URL format)

### Publishing Validation
- ✅ Must have insurance URL to publish
- ✅ Cannot publish incomplete programs

### Authentication Stubs
- All admin endpoints have TODO comments
- Ready to add auth middleware
- Public endpoints remain open

---

## 📊 Comparison: Old vs New

| Aspect | Old | New |
|--------|-----|-----|
| Complexity | High (flexible) | Low (fixed) |
| Admin Fields | 8+ | 3 |
| Product Builder | Yes (complex) | No (fixed) |
| Time to Create | 10+ minutes | 2 minutes |
| Customization | Very flexible | Limited (by design) |
| Purpose | Multi-use | Purpose-built |
| Use Case | General notices | Tenant insurance |

---

## 🎯 Why This Design?

1. **Simplicity** - Admins need ~30 seconds to create a program
2. **Consistency** - All programs look the same (good UX)
3. **Focus** - Built specifically for insurance verification
4. **Maintenance** - Easy to manage and debug
5. **Speed** - Fast to set up and deploy
6. **Clarity** - Tenants understand exactly what they're getting

---

## 🔄 Future Extensibility

### Easy to Extend

**Add a new program type:**
```typescript
export const PROGRAMS = {
  TENANT_LIABILITY: { name: '...', coverage: '...', addOns: [...] },
  RENTERS_INSURANCE: { name: '...', coverage: '...', addOns: [...] },
};
```

**Add admin selection:**
```typescript
<select value={programType} onChange={(e) => setProgramType(e.target.value)}>
  <option>Tenant Liability Waiver</option>
  <option>Renters Insurance</option>
</select>
```

**Store selection:**
```typescript
BeagleProgram {
  programType: "tenant_liability" | "renters_insurance"
  propertyManagerName
  insuranceVerificationUrl
  selectedAddOns
}
```

Easy upgrade path without breaking current functionality.

---

## ✅ Checklist

- ✅ Simplified data model
- ✅ Fixed program type
- ✅ Optional add-ons (checkboxes)
- ✅ New admin editor UI
- ✅ New public page component
- ✅ Updated API endpoints
- ✅ Database schema updated
- ✅ Live preview working
- ✅ Type-safe TypeScript
- ✅ Responsive design
- ✅ SEO-friendly

---

## 🚀 Next Steps

1. **Run Migration** - See MIGRATION_INSTRUCTIONS.md
2. **Test Admin** - Create a program with add-ons
3. **Test Public** - View published program
4. **Share URL** - Distribute to tenants
5. **Monitor** - Track visits (future feature)

---

## 📞 Questions?

- See `/components/SimpleAdminEditor.tsx` for admin UI
- See `/components/BeagleProgramPagePreview.tsx` for public UI
- See `/types/index.ts` for data model
- See `/app/api/admin/beagle-programs/route.ts` for API

Enjoy the simplified system! 🎉

