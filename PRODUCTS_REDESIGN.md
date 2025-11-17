# System Redesign - Products with Pricing

The system has been redesigned so admins can select **complete products** (not optional add-ons) and set the price for each.

## 🎯 New Approach

### Available Products (Fixed)
```
1. Tenant Liability Waiver - 100k
   └─ Base coverage with 100k in liability

2. Tenant Liability Waiver - 100k + 5k content
   └─ 100k liability + $5,000 in personal property coverage

3. Tenant Liability Waiver - 100k + 10k content
   └─ 100k liability + $10,000 in personal property coverage

4. Tenant Liability Waiver - 100k + 20k content
   └─ 100k liability + $20,000 in personal property coverage
```

### Admin Workflow

1. **Select Products**
   - Checkbox for each product to include

2. **Enter Price for Each**
   - When product is selected, a price field appears
   - Admin enters: "$15/month" or "$15"

3. **Publish**
   - Click "Create & Publish" or "Save Draft"

### Tenant View

Tenants see:

```
┌──────────────────────────────────────────┐
│       Santa Fe Property Management       │
│                                          │
│           Available Plans                │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Tenant Liability Waiver - 100k    $15 │ │
│ │ Base coverage with 100k liability     │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Tenant Liability... - 100k + 5k  $20 │ │
│ │ 100k liability + $5k property...     │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Tenant Liability... - 100k + 10k $25 │ │
│ │ 100k liability + $10k property...    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│      [Verify Insurance Coverage]         │
│                                          │
└──────────────────────────────────────────┘
```

## 🗂️ Data Model

### Database
```
BeagleProgram {
  id
  propertyManagerName
  propertyManagerSlug
  insuranceVerificationUrl
  webviewUrl (optional)
  selectedProducts: [
    {
      id: "product_100k",
      name: "Tenant Liability Waiver - 100k",
      description: "Base coverage with 100k in liability",
      price: "$15/month"
    },
    // ... more products
  ]
  isPublished
}
```

### TypeScript Types
```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
}

export interface SelectedProduct {
  id: string;
  name: string;
  description: string;
  price: string; // "$15/month" or "$15"
}
```

## 📋 Admin Form

```
Property Manager Name *
[_________________________]

URL Slug *
[_________________________]

Insurance Verification URL *
[_________________________]

Embedded Webview URL (Optional)
[_________________________]

Insurance Products to Offer
Select which products to include and enter price for each:

☐ Tenant Liability Waiver - 100k
  Base coverage with 100k in liability
  └─ Price: [_____________]

☐ Tenant Liability Waiver - 100k + 5k content
  100k liability + $5,000 in personal property coverage
  └─ Price: [_____________]

☐ Tenant Liability Waiver - 100k + 10k content
  100k liability + $10,000 in personal property coverage
  └─ Price: [_____________]

☐ Tenant Liability Waiver - 100k + 20k content
  100k liability + $20,000 in personal property coverage
  └─ Price: [_____________]

[Save Draft] [Publish]
```

## 🔄 Workflow

```
Admin selects products + enters prices
            ↓
Saves/Publishes program
            ↓
Program lives at /programs/[slug]
            ↓
Tenants see all available plans with prices
            ↓
Tenants click "Verify Insurance Coverage"
            ↓
Redirected to insurance verification URL
```

## ✨ Key Improvements

✅ **Simpler for Admin** - Just checkboxes + prices
✅ **Clear for Tenants** - See all plans and prices at once
✅ **Professional** - Looks like a real product catalog
✅ **Flexible** - Can offer any combination of products
✅ **Scalable** - Easy to add new product options

## 📊 What Changed

### Before (Optional Add-Ons)
```
Base: 100k coverage (fixed)
Optional Add-Ons:
  ☐ +5k content
  ☐ +10k content
  ☐ +20k content
```

### After (Products)
```
Available Products (Admin selects & prices each):
  ☐ Product 1: 100k
  ☐ Product 2: 100k + 5k
  ☐ Product 3: 100k + 10k
  ☐ Product 4: 100k + 20k
```

## 🎨 How It Looks

### Admin Form
- Checkboxes for each product
- When checked, price field appears
- Admin types price (e.g., "$15/month")

### Public Page
- Product name (bold)
- Description
- Price (orange, prominent)
- Below: Insurance verification button

## 🚀 Next Steps

1. **Run Migration**
```bash
export DATABASE_URL="postgresql://postgres:Waltbox2001%21%21@db.fanuzxvnvdgmurvvfuuj.supabase.co:5432/postgres?sslmode=require"
./node_modules/.bin/prisma migrate dev --name redesign_to_products
```

2. **Test Admin**
- Create new program
- Select products
- Enter prices
- Publish

3. **View Public Page**
- See products with prices
- Test webview (if provided)
- Test insurance verification link

## 💡 Example

### Admin Creates Program
```
Company: "Santa Fe Property Management"
Insurance URL: "https://verify.example.com"
Webview: "https://tools.yourrenterskit.com/..."

Products:
✓ 100k liability           → "$12/month"
✓ 100k + 5k content       → "$17/month"
✓ 100k + 20k content      → "$27/month"
```

### Tenant Sees
```
Santa Fe Property Management

Available Plans

Tenant Liability Waiver - 100k                    $12
Base coverage with 100k in liability

Tenant Liability Waiver - 100k + 5k content      $17
100k liability + $5,000 in personal property...

Tenant Liability Waiver - 100k + 20k content     $27
100k liability + $20,000 in personal property...

[Verify Insurance Coverage]
```

## 🔧 Technical Details

### Fixed Products List
Edit `src/types/index.ts`:
```typescript
export const AVAILABLE_PRODUCTS: Product[] = [
  { id: 'product_100k', name: '...', description: '...' },
  // Add more products here
];
```

### Admin Component
`src/components/SimpleAdminEditor.tsx`:
- Shows all available products
- User checks which to include
- When checked, price input appears
- Updates `selectedProducts` in form data

### Public Component
`src/components/BeagleProgramPagePreview.tsx`:
- Maps over `selectedProducts`
- Displays each product with price
- Shows name, description, price

## ✅ Benefits

- **Easier Admin Experience** - No complex form
- **Clear Pricing** - Tenants see all prices upfront
- **Professional** - Looks like real product offerings
- **Flexible** - Can offer any product combination
- **Maintainable** - Fixed product list in code

---

System is now ready for product-based pricing! 🚀

