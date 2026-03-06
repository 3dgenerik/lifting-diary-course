import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { currentUser } from "@clerk/nextjs/server";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AppHeader } from "@/components/app-header";

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
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        >
          <ThemeProvider>
            <AppHeader firstName={user?.firstName} lastName={user?.lastName} />
            <main className="pt-[73px]">
              <QueryProvider>{children}</QueryProvider>
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
