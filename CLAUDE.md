# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1.6 application built with TypeScript, React 19, and Tailwind CSS v4. The project appears to be a lifting diary application ("lifting-diary-course").

## Development Guidelines

**IMPORTANT**: When generating any code, ALWAYS first refer to the relevant documentation files in the `/docs` directory. These docs contain critical context, patterns, and guidelines specific to this project. Review the appropriate documentation before writing or modifying code to ensure consistency with established patterns and best practices.

- /docs/data-fetching.md
- /docs/routing.md
- /docs/ui.md

## Development Commands

```bash
# Start development server at http://localhost:3000
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture

### Next.js App Router
This project uses the **App Router** architecture (not Pages Router). All routes are defined in the `src/app` directory:
- `src/app/layout.tsx` - Root layout with Geist fonts
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global styles including Tailwind directives

### TypeScript Configuration
- Path alias configured: `@/*` maps to `./src/*`
- Strict mode enabled
- Target: ES2017

### Styling
Uses Tailwind CSS v4 with PostCSS. Tailwind classes are applied inline in components.

### Authentication (Clerk)
Authentication is handled by Clerk using the current App Router approach:
- **Proxy Middleware**: `src/proxy.ts` uses `clerkMiddleware()` from `@clerk/nextjs/server` (Next.js 16 uses "proxy" instead of "middleware")
- **Provider**: App is wrapped with `<ClerkProvider>` in `src/app/layout.tsx`
- **Components**: Uses Clerk's React components (`SignInButton`, `SignUpButton`, `UserButton`, `SignedIn`, `SignedOut`)
- **Environment Variables**: Stored in `.env.local` (already in .gitignore)
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Get your keys from: https://dashboard.clerk.com/last-active?path=api-keys

## Key Technologies

- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist and Geist Mono (via next/font/google)
- **Authentication**: Clerk (@clerk/nextjs)
- **Linting**: ESLint with eslint-config-next

## Project Structure

```
src/
  proxy.ts          # Clerk authentication proxy middleware (Next.js 16)
  app/
    layout.tsx      # Root layout with ClerkProvider and auth UI
    page.tsx        # Home page
    globals.css     # Global styles + Tailwind
    favicon.ico     # Site icon
```

## Notes

- No test framework is configured yet
- Dark mode is supported via Tailwind's `dark:` variant
- Images are optimized using Next.js Image component
