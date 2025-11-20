# Environment Variables Guide

## Required Environment Variables

### NEXT_PUBLIC_BASE_URL
**Purpose**: Base URL for all API calls across the application

**Format**: `https://[domain]/api`

**Examples**:
```env
# Local Development
NEXT_PUBLIC_BASE_URL=https://localhost:7113/api

# Staging
NEXT_PUBLIC_BASE_URL=https://staging-api.garapro.com/api

# Production
NEXT_PUBLIC_BASE_URL=https://api.garapro.com/api
```

**Important Notes**:
- Must include the `/api` suffix
- Used by all services in the application
- OData and SignalR services automatically adjust the path as needed

### NEXT_PUBLIC_GOOGLE_CLIENT_ID
**Purpose**: Google OAuth client ID for authentication

**Format**: `[your-google-client-id]`

**Example**:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## File Locations

### Development
- `.env.local` (not committed to git)
- `.env.development` (optional, committed to git)

### Production
- `.env.production` (committed to git)
- Environment variables set in deployment platform

## Usage in Code

### Standard API Calls
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:7113/api';
```

### OData Endpoints
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:7113/api";
const API_URL = `${API_BASE_URL.replace('/api', '')}/odata/Endpoint`;
```

### SignalR Hubs
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:7113/api";
const hubUrl = `${baseUrl.replace('/api', '')}/hubs/hubname`;
```

## Deployment

When deploying to a new environment:

1. Create/update the appropriate `.env` file
2. Set `NEXT_PUBLIC_BASE_URL` to your API server URL
3. Ensure the URL includes the `/api` suffix
4. Rebuild the application (`npm run build`)
5. Verify API calls are reaching the correct server

## Troubleshooting

### API calls failing
- Check that `NEXT_PUBLIC_BASE_URL` is set correctly
- Verify the URL includes `/api` suffix
- Check browser console for the actual URL being called
- Ensure the API server is accessible from the client

### Environment variable not updating
- Restart the development server after changing `.env.local`
- Clear Next.js cache: `rm -rf .next`
- Rebuild the application

### CORS errors
- Ensure your API server allows requests from your frontend domain
- Check API server CORS configuration
- Verify the API URL is correct

## Security Notes

- Never commit `.env.local` to version control
- Use different values for development, staging, and production
- Keep sensitive values (like API keys) in `.env.local` only
- Use environment variables in your deployment platform for production

## Team Coordination

All team members should:
1. Use the same `NEXT_PUBLIC_BASE_URL` value for local development
2. Update their `.env.local` file when the API server changes
3. Communicate any changes to environment variables
4. Document any new environment variables in this guide
