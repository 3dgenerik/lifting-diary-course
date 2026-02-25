# Clerk Appearance Customization Guide

## Variables (Boje i Osnovno)

```typescript
variables: {
  // Boje
  colorPrimary: "#18181b",           // Glavna boja (dugmad, linkovi)
  colorDanger: "#ef4444",            // Boja za greške
  colorSuccess: "#22c55e",           // Boja za uspeh
  colorWarning: "#f59e0b",           // Boja za upozorenja

  // Tekst
  colorText: "#18181b",              // Glavni tekst
  colorTextSecondary: "#71717a",     // Sekundarni tekst
  colorTextOnPrimaryBackground: "#ffffff", // Tekst na primary boji

  // Pozadina
  colorBackground: "#ffffff",        // Glavna pozadina
  colorInputBackground: "#ffffff",   // Input pozadina

  // Radius
  borderRadius: "0.375rem",          // Border radius (rounded-md)

  // Font
  fontFamily: "var(--font-geist-sans)",
  fontSize: "1rem",
  fontWeight: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
}
```

## Elements (Specifični Elementi)

```typescript
elements: {
  // Kartica
  card: "shadow-lg border border-zinc-200",

  // Header
  headerTitle: "text-2xl font-bold text-zinc-900",
  headerSubtitle: "text-zinc-600 text-sm",

  // Dugmad
  formButtonPrimary: "bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md",
  formButtonSecondary: "border border-zinc-300 hover:bg-zinc-50",

  // Input polja
  formFieldLabel: "text-zinc-700 font-medium text-sm mb-1",
  formFieldInput: "border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10",
  formFieldInputShowPasswordButton: "text-zinc-500 hover:text-zinc-700",

  // Social buttons (Google, GitHub, etc.)
  socialButtonsBlockButton: "border-zinc-200 hover:bg-zinc-50 text-zinc-700",
  socialButtonsBlockButtonText: "font-medium",

  // Footer
  footerActionLink: "text-zinc-900 hover:text-zinc-700 font-medium",
  footerActionText: "text-zinc-600",

  // Divider
  dividerLine: "bg-zinc-200",
  dividerText: "text-zinc-500 text-sm",

  // Identity Preview (Profile)
  identityPreviewText: "text-zinc-700",
  identityPreviewEditButton: "text-zinc-600 hover:text-zinc-900",

  // Alert
  alertText: "text-sm",

  // Links
  otpCodeFieldInput: "border-zinc-300 text-center text-lg font-semibold",
}
```

## Dark Mode Support

Za dark mode, možeš koristiti `baseTheme: dark()` ili custom logic:

```typescript
import { dark } from '@clerk/themes';

appearance={{
  baseTheme: dark,
  variables: {
    colorPrimary: "#ffffff",
    colorBackground: "#000000",
    // ...
  }
}}
```

## Responsive & Layout

```typescript
layout: {
  socialButtonsPlacement: "bottom", // ili "top"
  socialButtonsVariant: "iconButton", // ili "blockButton"
  showOptionalFields: true,
}
```

## Više opcija na:
https://clerk.com/docs/customization/overview
