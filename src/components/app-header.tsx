"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

interface AppHeaderProps {
  firstName?: string | null;
  lastName?: string | null;
}

export function AppHeader({ firstName, lastName }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <h1 className="text-xl font-semibold">Lifting Diary</h1>
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <ThemeToggle />
          <p>
            {firstName}, {lastName}
          </p>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
