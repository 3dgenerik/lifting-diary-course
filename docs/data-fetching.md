# Data Fetching Guidelines (tRPC + TanStack Query Edition)

This document outlines the **mandatory** data fetching patterns and security practices for this application using tRPC and TanStack Query.

## Core Principles

### 1. Client-Side Data Fetching Only

**ALL data fetching within this app MUST be done via client components using tRPC hooks (which internally use TanStack Query).**

- Server components should NOT fetch data directly  
- Use `'use client'` directive for components that fetch data  
- All data fetching logic must go through custom tRPC hooks  

### 2. Custom Hook Architecture

**All API calls must be wrapped in custom hooks located in the `/hooks` folder.**  

```typescript
'use client';
import { trpc } from '@/utils/trpc';

export function useEntities(entityName: string) {
  return trpc[entityName].getAll.useQuery();
}
```

**Do NOT fetch data directly in components using useEffect or fetch.**



### 3. Mutations with Optimistic Updates

**For all POST, PUT, DELETE operations:**
- **MUST use optimistic updates** for instant UI feedback
- **Mutations MUST invalidate query** after server response

```typescript
'use client';
import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';

export function useCreateEntity(entityName: string) {
  const queryClient = useQueryClient();

  return trpc[entityName].create.useMutation({
    onMutate: async (newItem) => {
      await queryClient.cancelQueries([entityName]);

      const previousData = queryClient.getQueryData([entityName]);

      queryClient.setQueryData([entityName], (old: any[] = []) => [
        ...old,
        { ...newItem, id: 'temp-id', createdAt: new Date() },
      ]);

      return { previousData };
    },

    onError: (err, newItem, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([entityName], context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries([entityName]);
    },
  });
}
```

### 4. Database Queries with Drizzle ORM in tRPC

**Database queries must ALWAYS be done using Drizzle ORM in tRPC resolve functions.**

**DO NOT USE RAW SQL.**

```typescript
import { createRouter } from '@/server/trpc';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

export const entityRouter = createRouter()
  .query('getAll', {
    input: z.object({}),
    resolve: async () => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');

      return await db.select().from('your_table_here').where(eq('userId', userId));
    },
  })
  .mutation('create', {
    input: z.object({ /* your fields here */ }),
    resolve: async ({ input }) => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');

      const newItem = await db.insert('your_table_here').values({ ...input, userId }).returning('*');
      return newItem[0];
    },
  });
```


## Security: User Data Isolation

### 🔒 CRITICAL SECURITY REQUIREMENT

**It's incredibly IMPORTANT that a logged in user can ONLY access their own data. They SHOULD NOT be able to access any other data other than their own.**

- tRPC resolve functions MUST verify authentication and filter queries by userId
- Do not expose all records

```typescript
export const entityRouter = createRouter()
  .query('getAll', {
    resolve: async () => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return await db.select().from('your_table_here').where(eq('userId', userId));
    },
  });
```


## Query Key Conventions

**Query keys in tRPC hooks / TanStack Query MUST be unique per user.**

Always include `userId` in query keys to ensure proper cache isolation:

```typescript
// ✅ Correct
trpc.entity.getAll.useQuery({ userId });
trpc.entity.getOne.useQuery({ id, userId });

```

```typescript
// ❌ Incorrect
trpc.entity.getAll.useQuery(); // missing userId → cached across users
```

## Complete Example (tRPC + Hooks + Optimistic Update)

Here's a complete example following all guidelines:

**`/hooks/useWorkouts.ts`:**
```typescript
'use client';
import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';

export function useEntities() {
  return trpc.entity.getAll.useQuery();
}

export function useDeleteEntity() {
  const queryClient = useQueryClient();
  return trpc.entity.delete.useMutation({
    onMutate: async (id: string) => {
      await queryClient.cancelQueries(['entity']);
      const previous = queryClient.getQueryData(['entity']);
      queryClient.setQueryData(['entity'], (old: any[] = []) => old.filter(item => item.id !== id));
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) queryClient.setQueryData(['entity'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['entity']);
    },
  });
}
```


## Summary

- Use tRPC hooks in client components for all data fetching
- Wrap API calls in custom hooks in /hooks folder
- Use optimistic updates for mutations
- Drizzle ORM is used only in tRPC resolve functions
- Never use raw SQL
- Always verify authentication and filter by userId
- Include userId in query keys to avoid cache collisions
- This applies to all entities: todos, workouts, projects, etc.
