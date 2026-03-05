# UI/UX Reviewer Memory

## Project Context
- Lifting Diary application built with Next.js 16, React 19, Tailwind CSS v4
- Authentication via Clerk
- Uses shadcn/ui component library with custom Card, Calendar, Button components
- Design system uses OKLCH color space for colors

## Key Design Patterns

### Color System
- Primary: oklch(0.205 0 0) - near black
- Background: white/zinc-50 light theme
- Muted text: oklch(0.556 0 0) - mid gray
- Border: oklch(0.922 0 0) - very light gray
- Error/destructive: oklch(0.577 0.245 27.325) - red
- Border radius: 0.625rem base

### Component Patterns
- **Cards**: Use rounded-xl, shadow-sm, border, py-6 spacing
- **Calendar**: Custom DayPicker with ghost button variants for dates
- **Section Headers**: h2 with text-2xl font-semibold, optional muted subtitle
- **Header**: Fixed top-0, border-b, with authentication buttons right-aligned

### Layout Conventions
- Container max-width: max-w-6xl
- Grid layouts: lg:grid-cols-3 for sidebar + main content pattern
- Spacing: p-6 container padding, gap-6 between grid items
- Card padding: px-6 horizontal, py-6 vertical

## Known Issues Found

### Navigation & Information Architecture
- Home page (/) has minimal content when unauthenticated - just empty space
- No clear navigation between pages - missing links from home to dashboard
- Dashboard is not linked from anywhere visible

### API/Data Loading
- tRPC endpoint returning errors for workout.getByDate query
- Error state showing but needs better UX treatment

### Accessibility
- Header user name display uses plain `<p>` tag instead of semantic element
- Calendar selected state uses background color only (needs better contrast/indication)

## Best Practices to Follow
- Maintain consistent spacing with p-6, gap-6 pattern
- Use muted-foreground for secondary text
- Keep cards with rounded-xl and shadow-sm
- Use semantic HTML (h1, h2, nav, etc.)
- Provide loading states for async data
