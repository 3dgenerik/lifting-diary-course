# Authentication Guidelines (Clerk Edition)

This document outlines the **mandatory** authentication patterns and security practices for this application using Clerk.

## Core Principles

### 1. Clerk as the Authentication Provider

**This application uses Clerk (@clerk/nextjs) for all authentication and user management.**

- DO NOT implement custom authentication logic
- DO NOT use other authentication libraries (Auth.js, NextAuth, Passport, etc.)
- All authentication flows must go through Clerk's provided components and utilities

### 2. Next.js 16 Proxy Architecture

**This project uses Next.js 16's proxy middleware pattern (NOT the older middleware.ts pattern).**

The authentication proxy is configured in `src/proxy.ts`:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

**DO NOT create a `middleware.ts` file** - Next.js 16 uses the proxy pattern instead.

### 3. ClerkProvider Wrapping

**The entire application must be wrapped in `<ClerkProvider>` at the root layout.**

Located in `src/app/layout.tsx`:

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default async function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Setup and Configuration

### Environment Variables

**Authentication credentials MUST be stored in `.env.local` (already gitignored).**

Required variables:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Get your keys from: [Clerk Dashboard API Keys](https://dashboard.clerk.com/last-active?path=api-keys)

**DO NOT:**
- Commit API keys to git
- Use environment variables without the `NEXT_PUBLIC_` prefix for client-side access
- Hardcode credentials anywhere in the codebase

## Client-Side Authentication

### Authentication Components

Clerk provides ready-to-use React components. **Always use these instead of building custom auth UI.**

#### SignedIn / SignedOut

Conditionally render content based on authentication state:

```typescript
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <SignedOut>
        <p>Please sign in to continue</p>
      </SignedOut>
      <SignedIn>
        <p>Welcome back!</p>
      </SignedIn>
    </>
  );
}
```

#### SignInButton / SignUpButton

Trigger authentication flows:

```typescript
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <div>
      <SignInButton mode="modal">
        <button>Sign In</button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button>Sign Up</button>
      </SignUpButton>
    </div>
  );
}
```

**Mode options:**
- `"modal"` - Opens auth in a modal (recommended for better UX)
- `"redirect"` - Navigates to Clerk's hosted pages

#### UserButton

Displays user avatar and account management dropdown:

```typescript
import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <SignedIn>
      <UserButton />
    </SignedIn>
  );
}
```

## Server-Side Authentication

### In tRPC Resolvers (API Routes)

**EVERY tRPC resolver that accesses user data MUST verify authentication using `auth()`.**

```typescript
import { createRouter } from '@/server/trpc';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

export const workoutRouter = createRouter()
  .query('getAll', {
    resolve: async () => {
      const { userId } = await auth();

      // 🔒 CRITICAL: Always check if user is authenticated
      if (!userId) {
        throw new Error('Unauthorized');
      }

      // ✅ Filter by userId to ensure data isolation
      return await db.select()
        .from(workouts)
        .where(eq(workouts.userId, userId));
    },
  })
  .mutation('create', {
    input: z.object({
      name: z.string(),
      exercises: z.array(z.string()),
    }),
    resolve: async ({ input }) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error('Unauthorized');
      }

      // ✅ Always include userId when creating records
      return await db.insert(workouts)
        .values({ ...input, userId })
        .returning();
    },
  });
```

### In Server Components

For server components that need user information:

```typescript
import { currentUser } from "@clerk/nextjs/server";

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Email: {user.emailAddresses[0].emailAddress}</p>
    </div>
  );
}
```

**Available user properties:**
- `user.id` - Unique user identifier (use this for database relations)
- `user.firstName` / `user.lastName`
- `user.emailAddresses`
- `user.imageUrl`
- [Full User object reference](https://clerk.com/docs/references/javascript/user/user)

## Security Best Practices

### 🔒 CRITICAL: User Data Isolation

**Every database query MUST be filtered by the authenticated user's ID.**

```typescript
// ✅ CORRECT - Data is filtered by userId
const { userId } = await auth();
if (!userId) throw new Error('Unauthorized');

return await db.select()
  .from(workouts)
  .where(eq(workouts.userId, userId));
```

```typescript
// ❌ WRONG - Returns all users' data
return await db.select().from(workouts);
```

### Never Trust Client Input for User Identity

**NEVER accept userId from the client. ALWAYS get it from `auth()` on the server.**

```typescript
// ❌ WRONG - Client could send another user's ID
mutation('delete', {
  input: z.object({ id: z.string(), userId: z.string() }), // ❌ Never accept userId from client
  resolve: async ({ input }) => {
    return await db.delete(workouts).where(eq(workouts.userId, input.userId));
  },
});
```

```typescript
// ✅ CORRECT - Get userId from authenticated session
mutation('delete', {
  input: z.object({ id: z.string() }),
  resolve: async ({ input }) => {
    const { userId } = await auth(); // ✅ Always get from auth()
    if (!userId) throw new Error('Unauthorized');

    return await db.delete(workouts)
      .where(
        and(
          eq(workouts.id, input.id),
          eq(workouts.userId, userId) // ✅ Verify ownership
        )
      );
  },
});
```

### Protect All tRPC Routes

**Default to protected routes. Every resolver should verify authentication unless explicitly public.**

```typescript
// ✅ Protected route (default pattern)
export const protectedRouter = createRouter()
  .query('getData', {
    resolve: async () => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      // ... fetch user-specific data
    },
  });

// ⚠️ Public route (explicitly marked as public)
export const publicRouter = createRouter()
  .query('getPublicStats', {
    // Public endpoint - no auth check needed
    resolve: async () => {
      return { totalUsers: 1000, totalWorkouts: 50000 };
    },
  });
```

## Customization

### Appearance Customization

Clerk components can be styled to match your design system:

```typescript
<ClerkProvider
  appearance={{
    baseTheme: undefined, // or use Clerk's built-in themes
    variables: {
      colorPrimary: "#18181b",
      colorTextOnPrimaryBackground: "#fff",
      colorBackground: "#fff",
      colorInputBackground: "#fff",
      colorInputText: "#18181b",
      fontFamily: "var(--font-geist-sans)",
      borderRadius: ".2rem",
    },
    elements: {
      formButtonPrimary: "bg-zinc-900 hover:bg-zinc-800 text-sm font-medium",
      card: "shadow-lg",
      headerTitle: "text-2xl font-semibold",
      // ... more custom styles
    },
  }}
>
  {children}
</ClerkProvider>
```

**Reference:** [Clerk Appearance Customization Docs](https://clerk.com/docs/customization/overview)

## Common Patterns

### Pattern 1: Protected Page

```typescript
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <div>Protected content for {user.firstName}</div>;
}
```

### Pattern 2: Conditional Rendering Based on Auth

```typescript
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <>
      <SignedOut>
        <h1>Welcome! Please sign in to get started.</h1>
        <SignInButton mode="modal">
          <button>Get Started</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <h1>Welcome back!</h1>
        <a href="/dashboard">Go to Dashboard</a>
      </SignedIn>
    </>
  );
}
```

### Pattern 3: User-Scoped tRPC Query

```typescript
// hooks/useWorkouts.ts
'use client';
import { trpc } from '@/utils/trpc';

export function useWorkouts() {
  // tRPC automatically includes auth context
  return trpc.workout.getAll.useQuery();
}

// server/routers/workout.ts
export const workoutRouter = createRouter()
  .query('getAll', {
    resolve: async () => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');

      return await db.select()
        .from(workouts)
        .where(eq(workouts.userId, userId));
    },
  });
```

## Complete Example: Authenticated Feature

Here's a complete example showing authentication integration:

**`app/workouts/page.tsx` (Server Component):**
```typescript
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WorkoutList from "@/components/WorkoutList";

export default async function WorkoutsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div>
      <h1>My Workouts</h1>
      <WorkoutList />
    </div>
  );
}
```

**`components/WorkoutList.tsx` (Client Component):**
```typescript
'use client';
import { useWorkouts } from "@/hooks/useWorkouts";

export default function WorkoutList() {
  const { data: workouts, isLoading } = useWorkouts();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {workouts?.map(workout => (
        <li key={workout.id}>{workout.name}</li>
      ))}
    </ul>
  );
}
```

**`hooks/useWorkouts.ts`:**
```typescript
'use client';
import { trpc } from '@/utils/trpc';

export function useWorkouts() {
  return trpc.workout.getAll.useQuery();
}
```

**`server/routers/workout.ts`:**
```typescript
import { createRouter } from '@/server/trpc';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { workouts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const workoutRouter = createRouter()
  .query('getAll', {
    resolve: async () => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');

      return await db.select()
        .from(workouts)
        .where(eq(workouts.userId, userId));
    },
  });
```

## Summary

- **Use Clerk** for all authentication (never implement custom auth)
- **Proxy middleware** in `src/proxy.ts` (NOT `middleware.ts` for Next.js 16)
- **ClerkProvider** must wrap the entire app in root layout
- **Use Clerk components** (`SignedIn`, `SignedOut`, `SignInButton`, `SignUpButton`, `UserButton`)
- **Verify auth in tRPC** using `auth()` from `@clerk/nextjs/server`
- **Always filter by userId** in database queries to ensure data isolation
- **Never trust client input** for user identity - always get userId from `auth()` on server
- **Customize appearance** through ClerkProvider props to match your design system
- **Default to protected** - every tRPC resolver should verify authentication unless explicitly public

**Security is paramount:** A logged-in user must ONLY access their own data. Never expose other users' data.
