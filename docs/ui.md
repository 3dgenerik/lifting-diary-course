# UI Coding Standards

This document outlines the strict UI coding standards for this project. **ALL developers must adhere to these guidelines without exception.**

---

## Component Library: shadcn/ui

### Core Principle
**ONLY shadcn/ui components shall be used for ALL UI elements in this project.**

### Strict Rules

1. **NO Custom Components**: Do NOT create custom UI components from scratch
2. **Use shadcn/ui Exclusively**: All buttons, inputs, dialogs, cards, forms, and other UI elements MUST come from shadcn/ui
3. **No Alternatives**: Do not use other component libraries (MUI, Ant Design, Chakra UI, etc.)
4. **Extend, Don't Replace**: If shadcn/ui components need customization, extend them using the existing component files in `src/components/ui/` - never create alternatives

### Implementation

- Install shadcn/ui components using: `npx shadcn@latest add <component-name>`
- Components are installed to `src/components/ui/` directory
- Import components from the ui directory: `import { Button } from "@/components/ui/button"`
- Refer to the official documentation: https://ui.shadcn.com/

### Examples

✅ **CORRECT**
```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

<Button variant="default">Click me</Button>
<Card>Content here</Card>
```

❌ **INCORRECT**
```tsx
// Never create custom components like this
const CustomButton = () => <button className="...">Click me</button>

// Never use other libraries
import { Button } from "@mui/material"
```

---

## Date Formatting

### Library: date-fns

**ALL date formatting must be done using the `date-fns` library.**

### Required Format

Dates must be formatted as: **`1st Sep 2025`**

Format breakdown:
- Day of month with ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
- Three-letter month abbreviation (Jan, Feb, Mar, etc.)
- Full year (2025, 2026, etc.)

### Implementation

```tsx
import { format } from "date-fns"

// Format a date
const formattedDate = format(new Date(), "do MMM yyyy")
// Output: "1st Sep 2025", "2nd Aug 2025", "3rd Jan 2026", etc.
```

### Examples

✅ **CORRECT**
```tsx
import { format } from "date-fns"

const displayDate = format(workout.date, "do MMM yyyy")
// Results: "1st Sep 2025", "2nd Aug 2025", "3rd Jan 2026", "4th Jun 2024"
```

❌ **INCORRECT**
```tsx
// Never use native Date methods
const date = new Date().toLocaleDateString()

// Never use other date libraries
import dayjs from "dayjs"
const date = dayjs().format("DD MMM YYYY")

// Never use custom formatting functions
const formatDate = (date) => { /* custom logic */ }
```

---

## Summary

1. **Components**: ONLY shadcn/ui - NO custom components
2. **Dates**: ONLY date-fns with format `"do MMM yyyy"` (e.g., "1st Sep 2025")
3. **No Exceptions**: These rules apply to ALL UI code in this project

**Consistency is critical. Follow these standards in every component, every page, and every feature.**
