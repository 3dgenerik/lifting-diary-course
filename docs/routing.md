# Routing Standards

## Overview

This document defines the routing architecture and authentication patterns for the lifting diary application. All application routes are organized under the `/dashboard` prefix and protected using Next.js middleware with Clerk authentication.

## Route Structure

### Base Route Pattern
All authenticated routes MUST use the `/dashboard` prefix:

```
/                    - Public home/landing page
/dashboard           - Main dashboard (protected)
/dashboard/workouts  - Workouts list page (protected)
/dashboard/exercises - Exercises management (protected)
/dashboard/progress  - Progress tracking (protected)
/dashboard/profile   - User profile (protected)
```

### File Organization

Routes are organized using Next.js App Router conventions in `src/app/(pages)/dashboard/`:

```
src/app/
  (pages)/                    # Route group (doesn't affect URL)
    dashboard/
      page.tsx                # /dashboard
      layout.tsx              # Shared layout for dashboard routes
      workouts/
        page.tsx              # /dashboard/workouts
        [id]/
          page.tsx            # /dashboard/workouts/:id
      exercises/
        page.tsx              # /dashboard/exercises
      progress/
        page.tsx              # /dashboard/progress
      profile/
        page.tsx              # /dashboard/profile
```

**Why use route groups `(pages)`?**
- Organizes routes without affecting the URL structure
- Keeps dashboard routes separate from other route types (e.g., API routes)
- Allows for shared layouts without adding URL segments

## Authentication & Route Protection

### Middleware Configuration

Route protection is implemented in `src/proxy.ts` using Clerk's middleware with **server-side redirects**:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',  // Protects /dashboard and all sub-routes
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      // Server-side redirect - returns HTTP 307 before rendering
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

**Why server-side redirect?**
- Authentication check happens on the server before any page content is rendered
- Returns an HTTP 307 redirect, preventing unauthorized users from ever seeing protected content
- No flash of unauthorized content or UI flicker
- Completely secure - cannot be bypassed by disabling JavaScript

### Key Concepts

#### `createRouteMatcher(patterns)`
- Creates a function to match routes against patterns
- Supports wildcards: `/dashboard(.*)` matches `/dashboard` and all sub-paths
- Case-insensitive by default

#### `NextResponse.redirect()` for Server-Side Redirects
- Returns an HTTP 307 redirect response before any page rendering occurs
- Completely server-controlled and secure - cannot be bypassed
- Prevents flash of unauthorized content (no UI flicker)
- Redirect happens at the network level, not in the browser JavaScript

### Protected vs Public Routes

**Protected Routes (require authentication):**
- `/dashboard` and all sub-routes
- Automatically redirect to sign-in if not authenticated

**Public Routes (no authentication required):**
- `/` - Landing page
- Any route not matching `/dashboard(.*)`

## Server-Side vs Client-Side Protection

### Server-Side Protection (Recommended - Our Standard)

**Our current approach** uses server-side authentication checks in middleware (`src/proxy.ts`). This is the **recommended and secure** way to protect routes.

**How it works:**
1. User requests `/dashboard`
2. Middleware intercepts the request on the server
3. Server checks authentication before rendering anything
4. If unauthenticated: Server returns HTTP 307 redirect to `/`
5. If authenticated: Server renders and returns the protected page

**Advantages:**
- **Security:** User never receives protected content - check happens before rendering
- **Performance:** No unnecessary page loads or client-side redirects
- **No UI flicker:** User never sees a flash of unauthorized content
- **SEO-safe:** Search engines see proper redirects
- **Cannot be bypassed:** Works even with JavaScript disabled

**Code example (current implementation):**
```typescript
// src/proxy.ts
export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
});
```

### Client-Side Protection (Not Recommended)

Client-side protection relies on JavaScript running in the browser to check authentication and redirect users.

**How it would work (DON'T DO THIS):**
1. User requests `/dashboard`
2. Server sends the full protected page HTML
3. React hydrates in the browser
4. `useAuth()` hook checks authentication
5. JavaScript redirects user if unauthenticated

**Why this is problematic:**
- **Security risk:** Protected HTML is sent to the browser before auth check
- **Flash of content:** User briefly sees protected content before redirect
- **Bypassable:** User can disable JavaScript and view content
- **Slower:** Requires full page load, React hydration, then redirect
- **Bad UX:** Jarring redirect after page has loaded
- **SEO issues:** Search engines may index protected content

**Anti-pattern example (DON'T USE):**
```typescript
// ❌ WRONG - Don't do client-side protection
'use client';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/'); // Client-side redirect - TOO LATE!
    }
  }, [userId, isLoaded, router]);

  // This content gets rendered before redirect!
  return <div>Protected content</div>;
}
```

### When to Use Each Approach

| Scenario | Approach | Reason |
|----------|----------|--------|
| **Protecting entire routes** | Server-side (middleware) | Security, performance, UX |
| **Protecting data/features** | Server-side (middleware) | Security requirement |
| **Soft UI customization** | Client-side (conditional rendering) | Not for security, just UI |
| **Showing/hiding UI elements** | Client-side (`<SignedIn>`, `<SignedOut>`) | Cosmetic only, not protection |

**Important:** Client-side auth checks with `useAuth()` or `<SignedIn>` should **NEVER** be used as the primary route protection mechanism. They are only suitable for cosmetic UI changes (e.g., showing different buttons for logged-in users), not for security.

**Correct client-side usage (UI customization only):**
```typescript
// ✅ CORRECT - Using client-side checks for UI only, not protection
'use client';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
```

## Implementation Patterns

### Creating a New Protected Route

1. **Create the route file** in `src/app/(pages)/dashboard/`:
   ```typescript
   // src/app/(pages)/dashboard/new-feature/page.tsx
   export default function NewFeaturePage() {
     return <div>New Feature</div>;
   }
   ```

2. **Access user data** using Clerk hooks:
   ```typescript
   import { auth } from '@clerk/nextjs/server';

   export default async function NewFeaturePage() {
     const { userId } = await auth();

     // userId is guaranteed to exist because route is protected
     // Fetch user-specific data here

     return <div>New Feature for {userId}</div>;
   }
   ```

3. **No additional configuration needed** - the middleware automatically protects it!

### Dynamic Routes

For routes with dynamic segments (e.g., `/dashboard/workouts/[id]`):

```typescript
// src/app/(pages)/dashboard/workouts/[id]/page.tsx
interface WorkoutDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutDetailPage({
  params
}: WorkoutDetailPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  // Fetch workout with authorization check
  const workout = await getWorkout(id, userId);

  return <div>Workout {id}</div>;
}
```

**Important:** In Next.js 15+, `params` is a Promise and must be awaited.

### Shared Dashboard Layout

Use `layout.tsx` to wrap all dashboard routes with shared UI:

```typescript
// src/app/(pages)/dashboard/layout.tsx
import { auth } from '@clerk/nextjs/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <div className="dashboard-container">
      <nav>{/* Dashboard navigation */}</nav>
      <main>{children}</main>
    </div>
  );
}
```

## Best Practices

### ✅ DO

- **Use `/dashboard` prefix** for all authenticated routes
- **Rely on middleware** for authentication - don't duplicate auth checks in page components
- **Use server-side redirect** in `src/proxy.ts` with `NextResponse.redirect()` for all route protection
- **Let middleware handle auth before rendering** - this prevents any protected content from reaching the client
- **Use explicit `NextResponse.redirect()`** for predictable, secure redirect behavior
- **Use route groups** `(pages)` to organize without affecting URLs
- **Access auth in Server Components** using `await auth()`
- **Validate authorization** - just because a user is authenticated doesn't mean they can access all data
- **Use dynamic routes** for resource-specific pages (`[id]`)
- **Use client-side auth components** (`<SignedIn>`, `<SignedOut>`) only for UI customization, not security

### ❌ DON'T

- **Don't create top-level authenticated routes** - use `/dashboard/*` instead
- **Don't check authentication in page components** - let middleware handle it
- **Don't use client-side auth protection** with `useAuth()` + `router.push()` as primary protection
- **Don't rely on client-side checks for security** - they can be bypassed
- **Don't use conditional rendering** (`<SignedIn>`) as route protection - use middleware instead
- **Don't expose sensitive data** in public routes or client components
- **Don't forget authorization** - always verify users can access the specific resource
- **Don't use Pages Router patterns** - this is an App Router project
- **Don't assume client-side redirects are secure** - always protect routes on the server

## Route Examples

### Example 1: Workout List Page
```typescript
// src/app/(pages)/dashboard/workouts/page.tsx
import { auth } from '@clerk/nextjs/server';
import { getWorkouts } from '@/server/queries';

export default async function WorkoutsPage() {
  const { userId } = await auth();
  const workouts = await getWorkouts(userId);

  return (
    <div>
      <h1>My Workouts</h1>
      {workouts.map(workout => (
        <div key={workout.id}>{workout.name}</div>
      ))}
    </div>
  );
}
```

### Example 2: Workout Detail Page
```typescript
// src/app/(pages)/dashboard/workouts/[id]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { getWorkout } from '@/server/queries';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  const workout = await getWorkout(id, userId);

  if (!workout) {
    notFound();
  }

  return (
    <div>
      <h1>{workout.name}</h1>
      {/* Workout details */}
    </div>
  );
}
```

## Testing Protected Routes

### Manual Testing Checklist

1. **Unauthenticated Access (Server-Side Redirect):**
   - Visit `/dashboard` while logged out
   - **Expected behavior:**
     - Server returns **HTTP 307** redirect status
     - Browser redirects to `/` (home page)
     - **No protected HTML content is sent to the client**
     - Check Network tab: response should be redirect, not HTML content
   - After sign-in, should be able to access `/dashboard`

2. **Authenticated Access:**
   - Sign in through Clerk
   - Navigate to `/dashboard`
   - Should see dashboard content
   - User-specific data should load correctly

3. **Authorization:**
   - Try accessing another user's workout by ID
   - Should return 404 or error (not unauthorized user's data)

4. **Network-Level Verification:**
   - Open browser DevTools → Network tab
   - While logged out, navigate to `/dashboard`
   - Verify:
     - Initial request returns **307 Temporary Redirect**
     - Response body is empty or contains minimal redirect info
     - No React hydration occurs before redirect
     - Redirect happens before any content is rendered

### Development Testing

```bash
# Start dev server
npm run dev

# Test routes:
# http://localhost:3000/              - Public (should work)
# http://localhost:3000/dashboard     - Protected (should redirect with HTTP 307)
```

### Expected HTTP Behavior

**Unauthenticated request to protected route:**
```
GET /dashboard HTTP/1.1
Host: localhost:3000

HTTP/1.1 307 Temporary Redirect
Location: /
```

**Authenticated request to protected route:**
```
GET /dashboard HTTP/1.1
Host: localhost:3000
Cookie: __session=...

HTTP/1.1 200 OK
Content-Type: text/html
```

### Verifying Security

**✅ Correct (Server-Side):**
- Network tab shows 307 redirect
- No protected content in response body
- Redirect happens instantly (before page load)

**❌ Incorrect (Client-Side):**
- Network tab shows 200 OK with full HTML
- Protected content visible in response body
- Page loads, then redirects (flash of content)

## Common Patterns

### Pattern: User-Specific Data Fetching
```typescript
// src/server/queries.ts
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';

export async function getWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return db.query.workouts.findMany({
    where: (workouts, { eq }) => eq(workouts.userId, userId),
  });
}
```

### Pattern: Resource Authorization
```typescript
export async function getWorkout(workoutId: string, userId: string) {
  const workout = await db.query.workouts.findFirst({
    where: (workouts, { eq, and }) =>
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId)
      ),
  });

  return workout;
}
```

## Migration Guide

If you have existing routes outside `/dashboard`:

1. Move route files to `src/app/(pages)/dashboard/`
2. Update internal links to use `/dashboard` prefix
3. Test authentication flow
4. Update any hard-coded URLs in code or tests

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
