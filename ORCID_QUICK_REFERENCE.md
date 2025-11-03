# ORCID Quick Reference

## Get ORCID ID from Session

```tsx
import { useSession } from 'next-auth/react';

const MyComponent = () => {
  const { data: session } = useSession();
  const orcidId = (session?.user as any)?.orcidId;
  
  return (
    <div>
      {orcidId ? (
        <p>Verified ORCID: {orcidId}</p>
      ) : (
        <p>No ORCID linked</p>
      )}
    </div>
  );
};
```

## Display ORCID Badge

```tsx
import ORCIDBadge from '@/components/ORCIDBadge';

// Automatic - gets ORCID from session
<ORCIDBadge />

// Manual - provide specific ORCID ID
<ORCIDBadge orcidId="0000-0002-1825-0097" />

// With custom styling
<ORCIDBadge className="mt-4" />
```

## Check if User Has ORCID

```tsx
const { data: session } = useSession();
const hasORCID = !!(session?.user as any)?.orcidId;

{hasORCID && <ORCIDBadge />}
```

## ORCID Sign-In Button

Already implemented in `/auth/signin/page.tsx`:

```tsx
<button
  onClick={() => signIn('orcid', { callbackUrl: '/dashboard' })}
  className="..."
>
  Continue with ORCID
</button>
```

## Environment Variables

```env
# Required for ORCID authentication
ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXX
ORCID_CLIENT_SECRET=your-secret-here
```

## Database Query

```typescript
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Find user by ORCID
const user = await db.query.users.findFirst({
  where: eq(users.orcidId, '0000-0002-1825-0097'),
});

// Check if ORCID exists
const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com'),
});
if (user?.orcidId) {
  console.log('User has verified ORCID:', user.orcidId);
}
```

## API Route Example

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const orcidId = (session.user as any).orcidId;
  
  return Response.json({ 
    orcidId,
    hasVerifiedORCID: !!orcidId 
  });
}
```

## Conditional Features for ORCID Users

```tsx
const { data: session } = useSession();
const orcidId = (session?.user as any)?.orcidId;

return (
  <div>
    {orcidId ? (
      // Features for verified researchers
      <>
        <ORCIDBadge />
        <button>Publish Research</button>
        <button>Create Trial</button>
      </>
    ) : (
      // Prompt to verify
      <div className="bg-yellow-50 p-4 rounded">
        <p>Verify your researcher identity with ORCID</p>
        <button onClick={() => signIn('orcid')}>
          Link ORCID Account
        </button>
      </div>
    )}
  </div>
);
```

## TypeScript Types

```typescript
// Session type includes orcidId
interface Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    orcidId?: string | null; // ✅ Available
  }
}
```

## ORCID Profile Link

```tsx
const orcidId = "0000-0002-1825-0097";
const profileUrl = `https://orcid.org/${orcidId}`;

<a href={profileUrl} target="_blank" rel="noopener noreferrer">
  View ORCID Profile
</a>
```

## ORCID Badge Styling

The badge uses official ORCID colors:
- Primary: `#a6ce39` (ORCID green)
- Text: `#gray-700`
- Border: `#a6ce39`

## Setup Checklist

- [ ] Register at https://orcid.org/developer-tools
- [ ] Get Client ID and Secret
- [ ] Add to `.env.local`
- [ ] Add redirect URI: `http://localhost:3000/api/auth/callback/orcid`
- [ ] Restart development server
- [ ] Test sign-in flow
- [ ] Verify badge appears

## Common Use Cases

### 1. Researcher Profile Page
```tsx
<ORCIDBadge />
```

### 2. Search Results
```tsx
{researchers.map(r => (
  <div key={r.id}>
    <h3>{r.name}</h3>
    {r.orcidId && <ORCIDBadge orcidId={r.orcidId} />}
  </div>
))}
```

### 3. Verification Required
```tsx
const ProtectedResearcherFeature = () => {
  const { data: session } = useSession();
  const isVerified = !!(session?.user as any)?.orcidId;
  
  if (!isVerified) {
    return <div>Please verify with ORCID to access this feature</div>;
  }
  
  return <ResearcherOnlyFeature />;
};
```

## Resources

- Full Setup Guide: `ORCID_SETUP.md`
- Implementation Details: `ORCID_IMPLEMENTATION.md`
- ORCID Docs: https://info.orcid.org/documentation/
