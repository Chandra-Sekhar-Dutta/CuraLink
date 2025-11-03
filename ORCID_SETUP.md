# ORCID Integration Setup Guide

## What is ORCID?

ORCID (Open Researcher and Contributor ID) provides a persistent digital identifier that distinguishes researchers and their work. It's widely used in academic and research communities.

## Benefits

- ✅ **FREE** - ORCID Public API is completely free
- ✅ **Trusted** - Used by major publishers and research institutions worldwide
- ✅ **Verified** - Authenticates researchers with their official ORCID iD
- ✅ **Persistent** - ORCID IDs never change, even if email or institution changes

## Setup Instructions

### Step 1: Register for ORCID Public API Credentials

1. Visit: https://orcid.org/developer-tools
2. Click "Register for the public API" or "Get your credentials"
3. Sign in to your ORCID account (or create one if you don't have it)
4. Fill out the registration form:
   - **Name**: ReGeneX Platform
   - **Description**: Healthcare research collaboration platform connecting patients and researchers
   - **Website URL**: Your production URL or `http://localhost:3000` for development
   - **Redirect URIs**: Add these URLs:
     - Development: `http://localhost:3000/api/auth/callback/orcid`
     - Production: `https://your-domain.com/api/auth/callback/orcid`

### Step 2: Get Your Credentials

After registration, you'll receive:
- **Client ID**: Your public identifier
- **Client Secret**: Keep this secure!

### Step 3: Add to Environment Variables

Add these to your `.env.local` file:

```env
# ORCID OAuth (FREE Public API)
ORCID_CLIENT_ID=your-client-id-here
ORCID_CLIENT_SECRET=your-client-secret-here
```

### Step 4: Restart Development Server

```bash
npm run dev
```

### Step 5: Test ORCID Sign-In

1. Go to `/auth/signin`
2. Click "Continue with ORCID"
3. Sign in with your ORCID credentials
4. Authorize the ReGeneX app
5. You'll be redirected back with your verified ORCID iD!

## Features Implemented

### 1. OAuth Sign-In
- Users can sign in with their ORCID account
- ORCID iD is automatically stored in the database
- Email verification is handled by ORCID

### 2. ORCID Badge Component
Display verified ORCID on researcher profiles:

```tsx
import ORCIDBadge from '@/components/ORCIDBadge';

<ORCIDBadge orcidId="0000-0002-1825-0097" />
```

### 3. Session Integration
ORCID iD is available in the session:

```tsx
const { data: session } = useSession();
const orcidId = session?.user?.orcidId;
```

## Testing

### Using ORCID Sandbox (Optional)

For testing without affecting your production ORCID registry:

1. Register at: https://sandbox.orcid.org/
2. Get sandbox credentials from: https://sandbox.orcid.org/developer-tools
3. Update `auth.ts` to use sandbox endpoints:
   - Change `https://orcid.org` to `https://sandbox.orcid.org`
   - Change `https://pub.orcid.org` to `https://pub.sandbox.orcid.org`

## API Limits

### Public API (FREE)
- ✅ Unlimited read requests
- ✅ OAuth authentication
- ✅ Read public data from ORCID records
- ✅ Search the ORCID registry
- ❌ Cannot write to user records (requires Member API)

### Member API (Paid)
- Institutions can become ORCID members for additional features
- Can write to user records with permission
- Costs vary by institution type and country

## Best Practices

1. **Display ORCID Badge**: Always show the official ORCID badge when displaying ORCID iDs
2. **Link to Profile**: Make ORCID iDs clickable to open the full profile
3. **Respect Privacy**: Only display ORCID information for users who have authenticated
4. **Keep Credentials Secret**: Never commit credentials to version control
5. **Use HTTPS**: Always use HTTPS in production for OAuth callbacks

## Troubleshooting

### "Invalid redirect_uri"
- Make sure you registered the exact callback URL in your ORCID app settings
- Check for typos in the URL
- Ensure the protocol (http vs https) matches

### "Invalid client credentials"
- Verify your Client ID and Secret are correct in `.env.local`
- Restart your development server after adding credentials

### ORCID profile not loading
- Check your internet connection
- Verify the ORCID API is accessible from your server
- Check for rate limiting (unlikely with Public API)

## Resources

- ORCID Documentation: https://info.orcid.org/documentation/
- Public API Guide: https://info.orcid.org/documentation/features/public-api/
- API Tutorial: https://info.orcid.org/documentation/api-tutorials/
- Brand Guidelines: https://info.orcid.org/brand-guidelines/

## Support

For ORCID-specific issues:
- Email: support@orcid.org
- Help Center: https://support.orcid.org/

For ReGeneX integration issues:
- Check this README first
- Review the auth configuration in `auth.ts`
- Test with ORCID Sandbox environment
