import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import { currentUser } from "@clerk/nextjs/server";
import { QueryProvider } from "@/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lifting Diary",
  description: "Track your lifting progress",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#18181b",
          colorTextOnPrimaryBackground: "#fff",
          colorBackground: "#fff",
          colorInputBackground: "#fff",
          colorInputText: "#18181b",
          fontFamily: "var(--font-geist-sans)",
          borderRadius: ".2rem", // rounded-md
        },
        elements: {
          formButtonPrimary:
            "bg-zink-900 hover:bg-zink-800 text-sm font-medium",
          card: "shadow-lg",
          headerTitle: "text-2xl font-semibold",
          headerSubtitle: "text-zink-600",
          socialButtonsBlockButton:
            "border-zink-200 hover:bg-zink-50 text-zink-700",
          formFieldLabel: "text-zinc-700 font-medium",
          formFieldInput:
            "border-zinc-200 focus:border-zink-900 focus:ring-1 focus:ring-zinc-900",
          footerActionLink: "text-zinc-900 hover:text-zinc-700 font-medium",
          identityPreviewText: "text-zinc-700",
          identityPreviewEditButton: "text-zink-600 hover:text-zink-900",
          footer: "hidden",
          footerPages: "hidden",
          footerPagesLink: "hidden",
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        >
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
                <p>{user?.firstName}, {user?.lastName}</p>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          <main className="pt-[73px]">
            <QueryProvider>{children}</QueryProvider>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
