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

Route protection is implemented in `src/proxy.ts` using Clerk's middleware:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',  // Protects /dashboard and all sub-routes
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
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

### Key Concepts

#### `createRouteMatcher(patterns)`
- Creates a function to match routes against patterns
- Supports wildcards: `/dashboard(.*)` matches `/dashboard` and all sub-paths
- Case-insensitive by default

#### `auth.protect()`
- Redirects unauthenticated users to Clerk's sign-in page
- Automatically returns users to the protected route after sign-in
- Throws error if authentication fails (caught by Clerk)

### Protected vs Public Routes

**Protected Routes (require authentication):**
- `/dashboard` and all sub-routes
- Automatically redirect to sign-in if not authenticated

**Public Routes (no authentication required):**
- `/` - Landing page
- Any route not matching `/dashboard(.*)`

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
- **Use route groups** `(pages)` to organize without affecting URLs
- **Access auth in Server Components** using `await auth()`
- **Validate authorization** - just because a user is authenticated doesn't mean they can access all data
- **Use dynamic routes** for resource-specific pages (`[id]`)

### ❌ DON'T

- **Don't create top-level authenticated routes** - use `/dashboard/*` instead
- **Don't check authentication in page components** - let middleware handle it
- **Don't expose sensitive data** in public routes or client components
- **Don't forget authorization** - always verify users can access the specific resource
- **Don't use Pages Router patterns** - this is an App Router project

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

1. **Unauthenticated Access:**
   - Visit `/dashboard` while logged out
   - Should redirect to Clerk sign-in page
   - After sign-in, should return to `/dashboard`

2. **Authenticated Access:**
   - Sign in through Clerk
   - Navigate to `/dashboard`
   - Should see dashboard content
   - User-specific data should load correctly

3. **Authorization:**
   - Try accessing another user's workout by ID
   - Should return 404 or error (not unauthorized user's data)

### Development Testing

```bash
# Start dev server
npm run dev

# Test routes:
# http://localhost:3000/              - Public (should work)
# http://localhost:3000/dashboard     - Protected (should redirect to sign-in)
```

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
