# Quote Builder - Claude Code Development Guide

## Quick Start

```bash
npm install    # Install dependencies
npm run dev    # Start dev server at http://localhost:5173
npm run build  # Production build
```

## Project Overview

HVAC equipment quote building application with an Excel-like interface for sales professionals to create detailed pricing quotes.

**Tech Stack:** React 18 + Vite + Tailwind CSS + Lucide React icons

## Architecture

### Data Model

The app uses a flat data structure with foreign key relationships (SQL-ready):

```
Quote Package (top level)
  └── Equipment Group (category)
        └── Line Item (priced component)
              └── Sub Line Item (nested under line items)
```

### Key Entities

- **Quote Packages**: Top-level containers with default markup
- **Equipment Groups**: Categories within packages, with description fields for Word doc generation
- **Line Items**: Priced components with full pricing columns
- **Sub Line Items**: Nested items inheriting parent properties

### Pricing Formula

```
Mfg Net    = Qty × List Price × Multiplier × (1 + Price Increase %)
Mfg Comm   = Mfg Net × Pay %
Total Net  = Mfg Net + Freight
Bid Price  = Total Net × Markup
Sales Comm = (Bid Price - Total Net) + Mfg Comm
```

## File Structure

```
src/
├── main.jsx                    # React app entry point
├── QuoteBuilder.jsx            # Main component with state management
├── index.css                   # Tailwind CSS imports
├── components/
│   ├── index.js                # Component exports
│   ├── Modal.jsx               # Reusable modal component
│   ├── Legend.jsx              # UI legend for cell types
│   ├── LineItemRow.jsx         # Table row for line items
│   ├── EquipmentGroup.jsx      # Equipment group section
│   ├── QuotePackage.jsx        # Top-level package component
│   ├── cells/
│   │   ├── index.js
│   │   ├── TextCell.jsx        # Editable text/number/currency cell
│   │   ├── DropdownCell.jsx    # Dropdown selection cell
│   │   └── LineNumberCell.jsx  # Line number cell with move support
│   └── modals/
│       ├── index.js
│       ├── NewPackageModal.jsx
│       ├── NewEquipmentGroupModal.jsx
│       └── EquipmentGroupDescriptionModal.jsx
├── context/
│   └── NavigationContext.jsx   # Excel-like navigation state
├── data/
│   └── initialData.js          # Sample data
└── utils/
    ├── helpers.js              # Utility functions (formatCurrency, etc.)
    ├── calculations.js         # Pricing calculation logic
    └── constants.js            # Column definitions for navigation
```

## Key Components

| Component | Purpose |
|-----------|---------|
| `NavigationProvider` | Context for Excel-like cell navigation |
| `TextCell` | Editable text/number/currency/percent input |
| `DropdownCell` | Selectable dropdown field |
| `LineItemRow` | Table row for a line item |
| `EquipmentGroup` | Section containing line items |
| `QuotePackage` | Top-level package section |

## Development Notes

### State Management
- Uses React Context API (`NavigationContext`) for cell navigation
- All data state managed with `useState` hooks
- No external state library needed for current scale

### Keyboard Navigation
- Arrow keys: Navigate between cells
- Enter/F2: Start editing cell
- Space: Open dropdown
- Escape: Cancel edit
- Tab/Shift+Tab: Move right/left

### Column Order (for navigation)
```javascript
['lineNum', 'qty', 'supplier', 'manufacturer', 'equipment', 'model', 'list', 'priceInc', 'multi', 'pay', 'freight', 'markup']
```

## Code Style

- ESLint configured for React best practices
- Tailwind CSS for styling (utility-first approach)
- Components use functional style with hooks

## Testing

```bash
npm run lint   # Run ESLint
npm run build  # Type-check via build
```

## Common Tasks

### Adding a new column to line items:
1. Add field to `src/data/initialData.js` lineItems objects
2. Add column to `EDITABLE_COLUMNS` in `src/utils/constants.js`
3. Add `<td>` with appropriate cell component in `src/components/LineItemRow.jsx`
4. Add header in `src/components/EquipmentGroup.jsx` table header

### Adding a new dropdown option:
1. Add entry to appropriate array in `src/data/initialData.js` (suppliers, manufacturers, equipmentTypes)

### Modifying calculations:
1. Update `calculateLineItem()` in `src/utils/calculations.js`
2. Update display in `src/components/LineItemRow.jsx`

## Roadmap Features (from README)

- [ ] Copy/duplicate operations
- [ ] Drag-and-drop reordering
- [ ] Equipment templates
- [ ] Word document export
- [ ] JSON import/export
- [ ] Backend integration
