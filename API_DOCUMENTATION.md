# Beagle Program API Documentation

Complete API reference for the Beagle Program Notice system.

## Base URL

```
http://localhost:3000
```

In production, replace with your deployed URL.

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "data": {
    "id": "...",
    "propertyManagerName": "...",
    // ... other fields
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

### Paginated Response
```json
{
  "data": [ /* array of items */ ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

## Public API

These endpoints are available without authentication and return published programs only.

### Get Program by Slug

```
GET /api/beagle-programs?slug={propertyManagerSlug}
```

**Query Parameters:**
- `slug` (required): The URL-friendly slug of the property manager

**Example Request:**
```bash
curl http://localhost:3000/api/beagle-programs?slug=santa-fe-property-management
```

**Success Response (200):**
```json
{
  "data": {
    "id": "cuid123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "propertyManagerName": "Santa Fe Property Management",
    "propertyManagerSlug": "santa-fe-property-management",
    "pageTitle": "Insurance Verification – Santa Fe Property Management",
    "introText": "Your lease requires renters insurance...",
    "insuranceVerificationUrl": "https://example.com/verify",
    "programHeading": "View your Beagle program",
    "programSubheading": "See the protections available to you...",
    "products": [
      {
        "id": "prod_abc123",
        "name": "Tenant Liability Waiver",
        "shortDescription": "Comprehensive coverage...",
        "priceLabel": "$13/month",
        "bulletPoints": ["Covers damages", "24/7 support"]
      }
    ],
    "isPublished": true
  }
}
```

**Error Responses:**
- `400` Bad Request - Missing slug parameter
- `404` Not Found - Program not found or not published

---

## Admin API

**Note**: These endpoints require authentication. See "Authentication" section below for implementation details.

### List Programs (Paginated)

```
GET /api/admin/beagle-programs?page={page}&pageSize={pageSize}
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 10, max: 100): Items per page

**Example Request:**
```bash
curl http://localhost:3000/api/admin/beagle-programs?page=1&pageSize=10 \
  -H "Authorization: Bearer {token}"
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "cuid1",
      "propertyManagerName": "Santa Fe",
      // ... full program object
    },
    // ... more programs
  ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

### Get Single Program

```
GET /api/admin/beagle-programs/{id}
```

**Path Parameters:**
- `id` (required): Program CUID

**Example Request:**
```bash
curl http://localhost:3000/api/admin/beagle-programs/cuid123 \
  -H "Authorization: Bearer {token}"
```

**Success Response (200):**
```json
{
  "data": {
    "id": "cuid123",
    "propertyManagerName": "Santa Fe Property Management",
    // ... full program object
  }
}
```

**Error Responses:**
- `404` Not Found - Program doesn't exist

### Create Program

```
POST /api/admin/beagle-programs
```

**Request Body:**
```json
{
  "propertyManagerName": "Santa Fe Property Management",
  "propertyManagerSlug": "santa-fe-property-management",
  "insuranceVerificationUrl": "https://example.com/verify",
  "pageTitle": "Insurance Verification – Santa Fe Property Management",
  "introText": "Your lease requires renters insurance...",
  "programHeading": "View your Beagle program",
  "programSubheading": "See the protections available to you...",
  "products": [
    {
      "name": "Tenant Liability Waiver",
      "shortDescription": "Comprehensive coverage for your belongings",
      "priceLabel": "$13/month",
      "bulletPoints": ["Covers personal property", "24/7 support"]
    }
  ]
}
```

**Required Fields:**
- `propertyManagerName`
- `insuranceVerificationUrl`

**Optional Fields (with defaults):**
- `propertyManagerSlug` - Auto-generated from property manager name if omitted
- `pageTitle` - "Insurance Verification – {propertyManagerName}"
- `introText` - Empty string
- `programHeading` - "View your Beagle program"
- `programSubheading` - "See the renter protections and services that you have access to..."
- `products` - Empty array

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/admin/beagle-programs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "propertyManagerName": "Santa Fe Property Management",
    "insuranceVerificationUrl": "https://example.com/verify"
  }'
```

**Success Response (201):**
```json
{
  "data": {
    "id": "cuid123",
    "propertyManagerName": "Santa Fe Property Management",
    "propertyManagerSlug": "santa-fe-property-management",
    "pageTitle": "Insurance Verification – Santa Fe Property Management",
    "introText": "",
    "insuranceVerificationUrl": "https://example.com/verify",
    "programHeading": "View your Beagle program",
    "programSubheading": "See the renter protections and services that you have access to...",
    "products": [],
    "isPublished": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` Bad Request - Missing required fields
- `409` Conflict - Slug already exists

### Update Program

```
PUT /api/admin/beagle-programs/{id}
```

**Path Parameters:**
- `id` (required): Program CUID

**Request Body:**
Same fields as POST, all optional for partial updates.

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/admin/beagle-programs/cuid123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "pageTitle": "Updated Title",
    "products": [
      {
        "name": "Tenant Liability Waiver",
        "shortDescription": "Updated description"
      }
    ]
  }'
```

**Success Response (200):**
```json
{
  "data": {
    "id": "cuid123",
    // ... updated program object
  }
}
```

**Error Responses:**
- `404` Not Found - Program doesn't exist

### Publish/Unpublish Program

```
PATCH /api/admin/beagle-programs/{id}/publish
```

Toggles the `isPublished` boolean. If currently false, sets to true (and vice versa).

**Path Parameters:**
- `id` (required): Program CUID

**Request Body:**
Empty object required: `{}`

**Validation Before Publishing:**
The API validates that required fields are present before allowing publishing:
- `pageTitle` must not be empty
- `introText` must not be empty
- `insuranceVerificationUrl` must not be empty

**Example Request:**
```bash
curl -X PATCH http://localhost:3000/api/admin/beagle-programs/cuid123/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{}'
```

**Success Response (200):**
```json
{
  "data": {
    "id": "cuid123",
    "isPublished": true,
    // ... full program object
  },
  "message": "Program published"
}
```

**Error Responses:**
- `400` Bad Request - Missing required fields (when trying to publish)
- `404` Not Found - Program doesn't exist

---

## Data Types

### ProgramProduct

```typescript
interface ProgramProduct {
  id: string;              // Unique identifier (e.g., "prod_abc123")
  name: string;            // Product name (e.g., "Tenant Liability Waiver")
  shortDescription: string; // One or two sentences
  priceLabel?: string;     // Optional price (e.g., "$13/month")
  bulletPoints?: string[]; // Optional list of features/benefits
}
```

**Example:**
```json
{
  "id": "prod_abc123",
  "name": "Tenant Liability Waiver",
  "shortDescription": "Comprehensive coverage for your belongings and liability",
  "priceLabel": "$13/month",
  "bulletPoints": [
    "Covers personal property damage",
    "Includes liability protection",
    "24/7 customer support",
    "Easy claims process"
  ]
}
```

### BeagleProgramData

```typescript
interface BeagleProgramData {
  id: string;                        // Unique identifier (CUID)
  createdAt: string;                 // ISO 8601 timestamp
  updatedAt: string;                 // ISO 8601 timestamp
  propertyManagerName: string;       // Full PM name
  propertyManagerSlug: string;       // URL-friendly slug (unique)
  pageTitle: string;                 // Main heading on the page
  introText: string;                 // Intro paragraph
  insuranceVerificationUrl: string;  // URL for insurance submission
  programHeading: string;            // Section heading (default: "View your Beagle program")
  programSubheading: string;         // Section subheading
  products: ProgramProduct[];        // Array of products
  isPublished: boolean;              // Publication status
}
```

---

## Authentication

**Current Status**: Authentication checks are stubbed with `TODO` comments in all admin endpoints.

To implement authentication:

1. **Choose your auth method** (JWT, session cookies, API tokens, etc.)

2. **Implement middleware**:
```typescript
async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  // Your auth logic here
  const token = request.headers.get('Authorization');
  // Verify token and return true/false
}
```

3. **Uncomment in endpoints**:
```typescript
if (!await verifyAdminSession(request)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

4. **Add auth header to requests**:
```bash
curl -H "Authorization: Bearer {your-token}" ...
```

---

## Status Codes Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Missing/invalid parameters or validation errors |
| 401 | Unauthorized | Authentication required (when implemented) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate slug) |
| 500 | Internal Server Error | Unexpected server error |

---

## Error Handling Examples

### Invalid Slug Parameter
```bash
$ curl http://localhost:3000/api/beagle-programs
```
**Response (400):**
```json
{
  "error": "Missing required query parameter: slug"
}
```

### Program Not Found
```bash
$ curl http://localhost:3000/api/beagle-programs?slug=nonexistent
```
**Response (404):**
```json
{
  "error": "Program not found"
}
```

### Unpublished Program
```bash
$ curl http://localhost:3000/api/beagle-programs?slug=santa-fe-property-management
```
**Response (404):** (if `isPublished = false`)
```json
{
  "error": "Program not published"
}
```

### Missing Required Field
```bash
$ curl -X POST http://localhost:3000/api/admin/beagle-programs \
  -H "Content-Type: application/json" \
  -d '{"propertyManagerName": "Test"}'
```
**Response (400):**
```json
{
  "error": "Missing required fields: propertyManagerName, insuranceVerificationUrl"
}
```

### Duplicate Slug
```bash
$ curl -X POST http://localhost:3000/api/admin/beagle-programs \
  -H "Content-Type: application/json" \
  -d '{
    "propertyManagerName": "Santa Fe",
    "propertyManagerSlug": "santa-fe",
    "insuranceVerificationUrl": "https://example.com"
  }'
```
**Response (409):**
```json
{
  "error": "Program with slug \"santa-fe\" already exists"
}
```

---

## Testing with cURL

### List all programs
```bash
curl http://localhost:3000/api/admin/beagle-programs?page=1&pageSize=10
```

### Get specific program
```bash
curl http://localhost:3000/api/admin/beagle-programs/cuid123
```

### Create new program
```bash
curl -X POST http://localhost:3000/api/admin/beagle-programs \
  -H "Content-Type: application/json" \
  -d '{
    "propertyManagerName": "Test PM",
    "insuranceVerificationUrl": "https://example.com/verify"
  }'
```

### Update program
```bash
curl -X PUT http://localhost:3000/api/admin/beagle-programs/cuid123 \
  -H "Content-Type: application/json" \
  -d '{
    "pageTitle": "New Title"
  }'
```

### Publish program
```bash
curl -X PATCH http://localhost:3000/api/admin/beagle-programs/cuid123/publish \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Get published program (public)
```bash
curl http://localhost:3000/api/beagle-programs?slug=test-pm
```

---

## Postman Collection

You can import these as Postman requests using the examples above.

---

## Rate Limiting

Currently not implemented. Consider adding in production:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Webhooks (Future)

Could emit events on:
- `program.created`
- `program.updated`
- `program.published`
- `program.unpublished`

---

## Best Practices for API Usage

1. **Always include Content-Type header** for POST/PUT/PATCH requests
2. **Validate slug format** on client before sending
3. **Handle 409 conflicts** gracefully (suggest slug alternatives)
4. **Cache published programs** on the client side
5. **Implement exponential backoff** for retries on 5xx errors
6. **Log API responses** for debugging

---

## Troubleshooting

### "Cannot POST /api/admin/beagle-programs"

Check:
- URL is correct: `/api/admin/beagle-programs` (not `/admin/api/...`)
- HTTP method is POST
- Content-Type header is `application/json`
- Request body is valid JSON

### "Program with slug already exists"

- Slug must be unique
- Try a different slug or delete the existing program first
- Slugs are auto-generated from names using: lowercase + hyphens + trimmed

### "Database connection failed"

- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Verify database name exists

---

## Contact & Support

For API issues:
1. Check error response for details
2. Review this documentation
3. Check console logs for server-side errors
4. Use Prisma Studio to inspect database: `npx prisma studio`

