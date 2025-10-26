# Motor PH Payroll Management System - Design Guidelines

## Design Approach

**Selected Approach**: Enterprise Design System (Carbon Design/Fluent Design hybrid)
**Justification**: This is a data-intensive, productivity-focused application requiring clarity, efficiency, and professional credibility. The system prioritizes information hierarchy, data visualization, and role-based workflows over aesthetic expression.

**Core Principles**:
- Information clarity over decorative elements
- Consistent data presentation across all modules
- Trust and professionalism through structured layouts
- Efficient task completion with minimal cognitive load

---

## Typography System

**Font Family**: Proxima Nova (as specified) throughout entire application

**Hierarchy**:
- **Page Titles**: Proxima Nova Bold, text-3xl (30px), tracking-tight
- **Section Headers**: Proxima Nova Semibold, text-2xl (24px)
- **Card Titles**: Proxima Nova Semibold, text-lg (18px)
- **Data Labels**: Proxima Nova Medium, text-sm (14px), text-gray-600
- **Data Values**: Proxima Nova Semibold, text-base (16px), text-gray-900
- **Body Text**: Proxima Nova Regular, text-base (16px), leading-relaxed
- **Table Headers**: Proxima Nova Medium, text-sm (14px), uppercase, tracking-wide
- **Table Data**: Proxima Nova Regular, text-sm (14px)
- **Metric Values**: Proxima Nova Bold, text-4xl (36px) for dashboard KPIs
- **Currency Display**: Proxima Nova Semibold with ₱ symbol, tabular-nums for alignment

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 for consistent rhythm
- Component padding: p-4, p-6
- Card spacing: p-6, p-8 for larger cards
- Section gaps: gap-4, gap-6
- Page margins: px-6, py-8
- Form field spacing: space-y-4

**Grid Structure**:
- **Dashboard Metrics**: 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4) for KPI cards
- **Data Tables**: Full-width with horizontal scroll on mobile
- **Forms**: Single column (max-w-2xl) with clear field groupings
- **Sidebar Navigation**: Fixed 64 width (w-64) on desktop, slide-out drawer on mobile

**Container Strategy**:
- Main content area: max-w-7xl with mx-auto
- Form containers: max-w-2xl centered
- Full-width tables with internal max-width constraints

---

## Component Library

### Navigation & Sidebar

**HR/Admin Sidebar**:
- Fixed left sidebar (w-64) with company logo at top (h-16)
- Navigation items with icons (left-aligned), text-sm, py-3, px-4
- Active state: background with subtle accent, left border (border-l-4)
- Collapsed mobile drawer with hamburger toggle
- User profile section at bottom with role badge

**Employee Sidebar**:
- Simplified navigation with 8 core items
- Same structure as admin but streamlined options
- Profile picture thumbnail (h-10 w-10) with name and employee ID

### Dashboard Components

**Welcome Header**:
- Full-width banner with gradient background
- Personalized greeting (text-3xl, font-bold)
- Current date/time display
- Next pay date countdown prominently featured

**KPI Metric Cards**:
- White background, rounded-lg, shadow-sm
- Metric label (text-sm, uppercase, tracking-wide, text-gray-500)
- Large value display (text-4xl, font-bold, tabular-nums)
- Currency values with ₱ symbol (Proxima Nova Semibold)
- Subtle icon in top-right corner
- Trend indicator (up/down arrow with percentage) where applicable
- Hover state: shadow-md transition

**Tax Breakdown Section**:
- Accordion-style expandable cards
- Each tax type (SSS, PhilHealth, Pag-IBIG, Withholding) in separate card
- Calculation breakdown in tabular format (2-column: label | amount)
- Total row with emphasized styling (font-semibold, border-t-2)

### Data Tables

**Standard Table Structure**:
- Zebra striping (alternate row backgrounds)
- Header row: sticky, bg-gray-50, border-b-2
- Sortable columns with arrow indicators
- Pagination controls (10, 25, 50, 100 items per page)
- Search/filter bar above table
- Row hover state with subtle background change
- Action buttons (icon-only) in last column
- Mobile: Cards instead of table rows

**Attendance Calendar**:
- Month view grid (7 columns for days)
- Date cells with status indicators (colored dot or background)
- Legend: Present (green), Absent (red), Late (orange), Overtime (blue)
- Employee selector dropdown above calendar (for HR view)
- Day detail popup on click showing time in/out, notes

### Forms

**Input Fields**:
- Label above input (text-sm, font-medium, mb-2)
- Input height: h-10, px-4, rounded-md
- Border: border, focus:ring-2 focus:ring-offset-1
- Error states: border-red-500, text-red-600 helper text
- Required indicator: red asterisk after label
- Disabled state: bg-gray-100, cursor-not-allowed

**Leave Request Form**:
- Dropdown for leave type (custom styled select)
- Date range picker (start/end date)
- Textarea for reason (h-24, resize-none)
- File upload area with drag-drop zone
- Live leave balance display (highlighted box, text-lg)
- Submit button: primary CTA (w-full on mobile, w-auto on desktop)

**Overtime Entry Form**:
- Date picker
- Time range inputs (start time, end time)
- Auto-calculated hours display
- Rate multiplier selector (radio buttons: Regular, Holiday, Night Diff)
- Earnings preview (large, highlighted, ₱ formatted)
- Reason textarea

### Payroll Processing Interface

**Payroll Generator (HR/Admin)**:
- Multi-step wizard layout
- Step 1: Employee selection (checkbox list or multi-select dropdown)
- Step 2: Pay period configuration (date range, pay frequency)
- Step 3: Review & preview (summary table)
- Step 4: Generate & download (progress indicator, bulk PDF generation)
- Action buttons: "Previous", "Next", "Generate Payroll"

**Payslip Display**:
- Professional document layout
- Motor PH header with logo
- Employee details section (2-column grid)
- Earnings breakdown table
- Deductions breakdown table
- Net pay prominently displayed (large box, emphasized)
- PDF download button (icon + text)

### Status Indicators & Badges

**Status Badges**:
- Pending: yellow/amber background, rounded-full, px-3, py-1, text-xs
- Approved: green background
- Rejected: red background
- Processing: blue background
- Pill-shaped with icon prefix

**Notifications**:
- Toast notifications (top-right corner)
- Success: green with checkmark icon
- Error: red with X icon
- Warning: yellow with alert icon
- Info: blue with info icon
- Auto-dismiss after 5 seconds, manual close button

### Policy Information Hub

**Content Layout**:
- Left sidebar with category navigation
- Main content area with article-style formatting
- Breadcrumb navigation at top
- Search bar with real-time filtering
- Expandable FAQ sections (accordion)
- Download links for policy documents (PDF icons)

---

## Responsive Breakpoints

- **Mobile**: < 768px - Single column, stacked cards, drawer navigation
- **Tablet**: 768px - 1024px - 2-column grids, condensed sidebar
- **Desktop**: > 1024px - Full multi-column layouts, fixed sidebar

---

## Interaction Patterns

**Loading States**:
- Skeleton screens for data tables during load
- Spinner for form submissions
- Progress bars for bulk operations (payroll generation)

**Empty States**:
- Centered icon + message for empty tables/lists
- "Add First Entry" CTA button
- Helpful hint text explaining the feature

**Confirmation Dialogs**:
- Modal overlay (max-w-md)
- Clear action description
- Destructive actions (delete, reject) in red
- Cancel (secondary) + Confirm (primary) buttons

**Filter & Search**:
- Persistent search bar above data tables
- Filter chips showing active filters (removable)
- Advanced filter panel (slide-out from right)

---

## Data Visualization

**Chart Usage** (minimal, focused):
- Bar charts for monthly salary trends
- Pie charts for deduction breakdowns
- Line graphs for attendance patterns
- Simple, clean styling without excessive decoration

---

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Focus indicators (ring-2 ring-offset-2)
- Screen reader labels for icon-only buttons
- Proper heading hierarchy (h1 → h6)
- Color contrast ratios: 4.5:1 minimum for text
- Form validation with clear error messages

---

## Special Considerations

**Currency Formatting**: Always use ₱ symbol, comma separators for thousands (₱32,543.00), tabular-nums class for alignment in tables

**Role-Based UI**: Conditionally render navigation items and features based on user role (Employee vs HR/Admin vs Payroll Staff)

**Philippine Context**: Date formats (MM/DD/YYYY), tax terminology (BIR, SSS, PhilHealth, Pag-IBIG)