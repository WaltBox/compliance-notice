# Beagle Program Notice + Program Webview System

A complete system for managing property management program notices and tenant-facing webviews using Next.js 14, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- **Admin Dashboard** – Create, edit, and publish program notices
- **Live Preview** – See changes in real-time while editing
- **Dynamic Products** – Add/remove/reorder products with descriptions and bullet points
- **Public Webview** – Beautiful tenant-facing pages with proper branding
- **Beagle Branding** – Orange/brown color scheme with Montserrat typography
- **Responsive Design** – Mobile-first layout that works on all devices
- **Type-Safe** – Full TypeScript support throughout

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **Fonts**: Montserrat (from Google Fonts)
- **UI Components**: React 18+

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── beagle-programs/          # Public API
│   │   │   └── route.ts
│   │   └── admin/beagle-programs/    # Admin API
│   │       ├── route.ts
│   │       └── [id]/
│   │           ├── route.ts
│   │           └── publish/route.ts
│   ├── admin/beagle-programs/        # Admin UI
│   │   ├── page.tsx                  # List programs
│   │   ├── new/page.tsx              # Create new
│   │   └── [id]/page.tsx             # Edit program
│   ├── programs/[slug]/              # Public webview
│   │   └── page.tsx
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── components/
│   ├── AdminProgramEditor.tsx        # Admin form + preview
│   ├── BeagleProgramPage.tsx         # Reusable page component
│   ├── BeagleLogo.tsx                # Logo component
│   ├── ProgramProductCard.tsx        # Product card
│   └── ProductBuilder.tsx            # Dynamic product editor
├── lib/
│   ├── prisma.ts                     # Prisma client
│   └── utils.ts                      # Utility functions
├── styles/
│   └── globals.css                   # Global styles
└── types/
    └── index.ts                      # TypeScript types

prisma/
└── schema.prisma                     # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and navigate to the directory**

```bash
cd comp-notice
npm install
```

2. **Set up environment variables**

Create a `.env.local` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/beagle_programs"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

3. **Set up the database**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. **Start the development server**

```bash
npm run dev
```

Visit `http://localhost:3000` to see the home page.

## Usage

### Admin Panel

1. Navigate to `http://localhost:3000/admin/beagle-programs`
2. Click "New Program" to create a new program
3. Fill in the form fields:
   - **Property Manager Name** – e.g., "Santa Fe Property Management"
   - **Page Title** – Auto-suggested, can be customized
   - **Intro Text** – Main paragraph explaining the program
   - **Insurance Verification URL** – Link where tenants submit policies
   - **Program Heading** – Defaults to "View your Beagle program"
   - **Program Subheading** – Explanatory text
4. Add products using the "Add Product" button:
   - Product name
   - Short description
   - Optional price label
   - Optional bullet points
5. See live preview on the right side
6. Click "Save Draft" to save without publishing
7. Click "Create & Publish" to create and publish immediately

### Admin List View

- View all programs with their status (Draft/Published)
- Sort by creation date
- Edit or view public pages directly
- Pagination support

### Public Webview

Once published, tenants can view the program at:

```
http://localhost:3000/programs/[property-manager-slug]
```

Example: `http://localhost:3000/programs/santa-fe-property-management`

## API Endpoints

### Public API

```
GET /api/beagle-programs?slug={slug}
```

Returns published program data (404 if not found or not published)

### Admin API

```
GET /api/admin/beagle-programs
```
Returns paginated list of all programs

```
GET /api/admin/beagle-programs/{id}
```
Returns single program for editing

```
POST /api/admin/beagle-programs
```
Creates new program

Request body:
```json
{
  "propertyManagerName": "Property Name",
  "propertyManagerSlug": "property-slug",
  "insuranceVerificationUrl": "https://...",
  "pageTitle": "Optional title",
  "introText": "Optional intro",
  "programHeading": "Optional heading",
  "programSubheading": "Optional subheading",
  "products": []
}
```

```
PUT /api/admin/beagle-programs/{id}
```
Updates program

```
PATCH /api/admin/beagle-programs/{id}/publish
```
Toggles published status

## Data Model

### BeagleProgram

```prisma
model BeagleProgram {
  id                        String   @id @default(cuid())
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
  
  propertyManagerName       String
  propertyManagerSlug       String   @unique
  
  pageTitle                 String
  introText                 String
  insuranceVerificationUrl  String
  
  programHeading            String
  programSubheading         String
  
  products                  Json     // ProgramProduct[]
  isPublished               Boolean  @default(false)
}
```

### ProgramProduct

```typescript
interface ProgramProduct {
  id: string;
  name: string;
  shortDescription: string;
  priceLabel?: string;
  bulletPoints?: string[];
}
```

## Styling

### Brand Colors

- **Primary Orange**: `#ff8a26`
- **Dark Brown**: `#3a2415`
- **Light Background**: `#f8f5f0`

### Typography

- **Font**: Montserrat (all weights 400-800)
- **Line Height**: Generous spacing for readability
- **Mobile-First**: Responsive design with Tailwind breakpoints

## Extensibility

The system is designed for future extensibility:

1. **Form Mode** – The `BeagleProgramPage` component accepts a `mode` prop and `children` for footer content. Future "form" mode can render opt-in/opt-out sections.

2. **Authentication** – API endpoints have TODOs for adding admin session middleware. Implement your auth system and uncomment the checks.

3. **Advanced Validation** – The admin UI validates required fields. Add server-side validation as needed.

4. **Styling** – All Tailwind classes can be easily customized via `tailwind.config.js`.

## Development Tips

- **Preview Responsive** – Use browser DevTools to test mobile layout
- **API Testing** – Use Postman or similar to test endpoints directly
- **Database** – Use `npx prisma studio` to view/manage database
- **Hot Reload** – Changes to components/pages refresh automatically
- **Type Checking** – Run `tsc --noEmit` to check for type errors

## Common Tasks

### Reset Database

```bash
npx prisma migrate reset
```

### View Database

```bash
npx prisma studio
```

### Build for Production

```bash
npm run build
npm start
```

### Generate Prisma Client

```bash
npx prisma generate
```

## Future Enhancements

- [ ] Form submission endpoints
- [ ] Email notifications
- [ ] Tenant opt-in/opt-out tracking
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Custom domain mapping
- [ ] Email template customization
- [ ] API rate limiting and auth tokens

## Support

For issues or questions, check the code comments marked with `TODO` for integration points.

## License

MIT

