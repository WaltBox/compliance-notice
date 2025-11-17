# Beagle Program System - Architecture

Visual and technical overview of the system architecture.

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web Browsers                              │
├────────────────────────┬──────────────────────────────────────────┤
│   Admin User           │         Tenant / Public User             │
│  (Dashboard View)      │        (Public View)                     │
└──────────┬─────────────┴────────────────────────┬──────────────────┘
           │                                      │
        ◄─┼─►                                  ◄─┼─►
           │                                      │
      [Admin Pages]                         [Public Pages]
      ┌────────────┐                        ┌────────────┐
      │  /admin/*  │                        │ /programs/*│
      └────────────┘                        └────────────┘
           │                                      │
           ▼                                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Next.js App Router (Frontend)                  │
├──────────────────────────────────────────────────────────────────┤
│  • AdminProgramEditor (Form + Preview)                           │
│  • BeagleProgramPage (Reusable Layout)                           │
│  • ProductBuilder (Dynamic Product Editor)                       │
│  • ProgramProductCard (Product Display)                          │
└──────────┬─────────────────────────────────────────────────────┬─┘
           │                                                      │
           ▼                                                      ▼
    [Client Components]                                   [Server Components]
    (React Hooks,State,                                  (Data Fetching,
     Form Handling)                                       Metadata Generation)
           │                                                      │
           └──────────────────┬─────────────────────────────────┘
                              │
                           ◄─┼─►
                              │
           ┌──────────────────▼────────────────────┐
           │  Next.js Route Handlers (Backend)     │
           │         API Layer                     │
           ├──────────────────────────────────────┤
           │ PUBLIC API:                           │
           │ • GET /api/beagle-programs?slug=...  │
           │                                      │
           │ ADMIN API (with auth):               │
           │ • GET /api/admin/beagle-programs     │
           │ • GET /api/admin/beagle-programs/:id │
           │ • POST /api/admin/beagle-programs    │
           │ • PUT /api/admin/beagle-programs/:id │
           │ • PATCH /:id/publish                 │
           └──────────────────┬───────────────────┘
                              │
                           ◄─┼─►
                              │
           ┌──────────────────▼────────────────────┐
           │    Prisma ORM (Data Layer)            │
           ├──────────────────────────────────────┤
           │  • Database client                    │
           │  • Query builder                      │
           │  • Type generation                    │
           └──────────────────┬───────────────────┘
                              │
                           ◄─┼─►
                              │
           ┌──────────────────▼────────────────────┐
           │  PostgreSQL Database                  │
           ├──────────────────────────────────────┤
           │  BeagleProgram Table:                 │
           │  • id, createdAt, updatedAt           │
           │  • propertyManagerName/Slug           │
           │  • pageTitle, introText               │
           │  • insuranceVerificationUrl           │
           │  • programHeading, programSubheading  │
           │  • products (JSON), isPublished       │
           └──────────────────────────────────────┘
```

## Component Hierarchy

```
BeagleProgramPage (Main Container)
├── BeagleLogo (Header)
│   └── SVG Icon + Text
├── Section: Insurance Verification
│   ├── Heading (Page Title)
│   ├── Intro Text Paragraph
│   └── Call-to-Action Link
└── Section: Program Products
    ├── Program Heading
    ├── Property Manager Name (Orange)
    ├── Subheading Text
    └── Products Grid (Responsive)
        └── ProgramProductCard (x multiple)
            ├── Product Name (Bold)
            ├── Price Label (Orange, Optional)
            ├── Description Paragraph
            └── Bullet Points List (Optional)
```

## Data Flow

### Editing Program (Admin Flow)

```
1. Admin clicks "Edit" or "New Program"
   │
   ▼
2. AdminProgramEditor loads
   ├─ [If edit] Fetch from GET /api/admin/beagle-programs/:id
   ├─ [If edit] Populate form with program data
   └─ Initialize form state with defaults
   │
   ▼
3. Admin edits form fields
   ├─ Update local state (React hooks)
   ├─ Trigger live preview updates
   └─ Validate fields client-side
   │
   ▼
4. Admin clicks "Save Draft"
   ├─ Validate all required fields
   ├─ POST/PUT to /api/admin/beagle-programs
   │  ├─ Prisma creates/updates record
   │  └─ Returns updated program data
   ├─ Update local state with server response
   └─ Show success message
   │
   ▼
5. [Optional] Admin clicks "Publish"
   ├─ Validate required fields
   ├─ PATCH to /api/admin/beagle-programs/:id/publish
   │  ├─ Prisma updates isPublished = true
   │  └─ Returns updated program
   ├─ Update local state
   └─ Toggle button appearance
```

### Viewing Published Program (Public Flow)

```
1. Tenant visits /programs/[slug]
   │
   ▼
2. Next.js Server Component
   ├─ Fetches from GET /api/beagle-programs?slug=[slug]
   ├─ Validates published status
   └─ Generates metadata (title, description)
   │
   ▼
3. [If not found or unpublished] Show 404
   │
   ▼
4. [If found and published] Render BeagleProgramPage
   ├─ Pass fetched program data as props
   ├─ Render with mode="notice"
   └─ No children (form mode) for now
   │
   ▼
5. Browser renders page with:
   ├─ Beagle logo header
   ├─ Insurance verification section
   ├─ Program products section
   └─ Responsive product cards
   │
   ▼
6. Tenant clicks "Submit your 3rd party policy here"
   └─ Navigates to insuranceVerificationUrl (external)
```

## File Organization

```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── beagle-programs/route.ts          # Public API
│   │   └── admin/
│   │       └── beagle-programs/
│   │           ├── route.ts                  # Admin list/create
│   │           └── [id]/
│   │               ├── route.ts              # Admin get/update
│   │               └── publish/route.ts      # Publish toggle
│   ├── admin/
│   │   └── beagle-programs/
│   │       ├── page.tsx                      # Admin list page
│   │       ├── new/page.tsx                  # Create new
│   │       └── [id]/page.tsx                 # Edit page
│   ├── programs/
│   │   └── [slug]/page.tsx                   # Public view
│   ├── layout.tsx                            # Root layout
│   └── page.tsx                              # Home page
│
├── components/                   # React Components
│   ├── AdminProgramEditor.tsx    # Form + preview
│   ├── ProductBuilder.tsx        # Product editor
│   ├── BeagleProgramPage.tsx     # Main layout
│   ├── ProgramProductCard.tsx    # Product card
│   └── BeagleLogo.tsx            # Logo component
│
├── lib/                          # Utilities
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Helper functions
│
├── types/                        # TypeScript Types
│   └── index.ts                  # All type definitions
│
└── styles/                       # Styling
    └── globals.css               # Global CSS
```

## Database Schema

```sql
CREATE TABLE "BeagleProgram" (
  id                        TEXT PRIMARY KEY,
  createdAt                 TIMESTAMP DEFAULT NOW(),
  updatedAt                 TIMESTAMP DEFAULT NOW(),
  
  propertyManagerName       TEXT NOT NULL,
  propertyManagerSlug       TEXT NOT NULL UNIQUE,
  
  pageTitle                 TEXT NOT NULL,
  introText                 TEXT NOT NULL,
  insuranceVerificationUrl  TEXT NOT NULL,
  
  programHeading            TEXT DEFAULT 'View your Beagle program',
  programSubheading         TEXT NOT NULL,
  
  products                  JSON DEFAULT '[]',
  isPublished               BOOLEAN DEFAULT false,
  
  INDEX propertyManagerSlug_index,
  INDEX isPublished_index
);
```

## Request/Response Flow

### Create Program Request
```
POST /api/admin/beagle-programs
Content-Type: application/json

{
  "propertyManagerName": "Santa Fe PM",
  "insuranceVerificationUrl": "https://...",
  // optional fields...
}
  │
  ▼
[Validation] (required fields)
  │
  ▼
[Generate slug] (if not provided)
  │
  ▼
[Create Prisma record]
  │
  ▼
Response 201:
{
  "data": {
    "id": "cuid123",
    "propertyManagerName": "Santa Fe PM",
    "propertyManagerSlug": "santa-fe-pm",
    // ... full program object
  }
}
```

### Get Public Program Request
```
GET /api/beagle-programs?slug=santa-fe-pm
  │
  ▼
[Fetch from Prisma where slug]
  │
  ▼
[Check if found] → 404 if not found
  │
  ▼
[Check if published] → 404 if not published
  │
  ▼
Response 200:
{
  "data": {
    "id": "cuid123",
    "propertyManagerName": "Santa Fe PM",
    "isPublished": true,
    // ... full program object
  }
}
```

## Type Safety Flow

```
Backend
┌────────────────────────────┐
│ Prisma Schema              │
│ (schema.prisma)            │
└───────────┬────────────────┘
            │
            ▼
        ┌─────────────────┐
        │ prisma generate │
        └────────┬────────┘
                 │
            ▼
┌────────────────────────────┐
│ Generated Types            │
│ (@prisma/client)           │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ src/types/index.ts         │
│ (Custom types)             │
└────────┬───────────────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
    API Handlers         Components
    (type-safe)         (type-safe)
```

## Authentication Stubs

Currently:
```
✓ Public endpoints: No auth required
✗ Admin endpoints: Auth checks stubbed with TODO
```

When implementing auth:
```
1. Create middleware: verifyAdminSession(request)
2. Uncomment TODO comments in:
   - src/app/api/admin/beagle-programs/route.ts
   - src/app/api/admin/beagle-programs/[id]/route.ts
   - src/app/api/admin/beagle-programs/[id]/publish/route.ts
3. Add Authorization header to requests
```

## Deployment Architecture

### Development
```
Local Machine
├── Node.js (npm start)
├── PostgreSQL (local)
└── Browser (localhost:3000)
```

### Production (Example)
```
Vercel / Netlify
├── Next.js server (auto-scaling)
├── Database (Vercel Postgres / Supabase)
└── CDN (edge network)
```

## Performance Considerations

### Database
- Indexed on `propertyManagerSlug` (fast lookups)
- Indexed on `isPublished` (fast filtering)
- JSON products stored inline (no separate table)

### Caching
- Public programs: Could cache with longer TTL
- Admin programs: Cache-busting on updates
- Static generation: Could use ISR (Incremental Static Regeneration)

### Component Rendering
- Server Components: Data fetching on server
- Client Components: Admin form with React hooks
- Responsive images: Tailwind optimization

## Future Extensibility

```
Current: "Notice Mode"
├── Displays program information
└── Links to insurance verification

Future: "Form Mode"
├── Extends BeagleProgramPage with children
├── Adds tenant form submission
├── Tracks opt-in/opt-out
└── Records submissions in database
```

## Error Handling Architecture

```
Client Errors (4xx)
├── 400: Bad request (validation)
├── 401: Unauthorized (auth required)
├── 404: Not found
└── 409: Conflict (duplicate slug)

Server Errors (5xx)
├── 500: Internal server error
├── Try/catch in all handlers
├── Console logging for debugging
└── User-friendly error messages
```

---

## Key Design Decisions

1. **JSON for products** - Flexibility without schema migrations
2. **Slug-based URLs** - Human-readable, SEO-friendly
3. **Component composition** - Reusable BeagleProgramPage
4. **Prisma ORM** - Type-safe database access
5. **Tailwind CSS** - Utility-first styling, responsive by default
6. **Server Components** - Faster initial load, secure data fetching
7. **Auth stubs** - Easy to integrate your auth system

---

For more details, see:
- [README.md](./README.md)
- [SETUP.md](./SETUP.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

