# Quote Builder

HVAC equipment quote building application with Excel-like interface for pricing and project management.

## Features

- **Hierarchical Structure**: Quote Package → Equipment Group → Line Item → Sub Line Item
- **Excel-like Navigation**: Arrow keys to move between cells, Enter to edit
- **Inline Editing**: Click or double-click cells to edit, Tab to navigate
- **Auto-calculations**: Mfg Net, Total Net, Bid Price, Commission all calculate automatically
- **Line Number Reorganization**: Edit line numbers (e.g., 1.2 → 1.1) to move items
- **Equipment Group Descriptions**: Modal for heading, bullet points, and notes (for Word doc generation)

## Pricing Formula

```
Mfg Net    = Qty × List × Multiplier × (1 + Price Increase %)
Mfg Comm   = Mfg Net × Pay %
Total Net  = Mfg Net + Freight
Bid Price  = Total Net × Markup
Sales Comm = (Bid Price - Total Net) + Mfg Comm
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow keys | Navigate between cells |
| Enter / F2 | Start editing cell |
| Space | Open dropdown (for dropdown cells) |
| Escape | Cancel edit |
| Tab | Move right, save current edit |
| Shift+Tab | Move left |

## Data Structure

The app uses a flat data structure with foreign key relationships, ready for SQL backend:

- **Quote Packages**: Top-level containers with default markup
- **Equipment Groups**: Categories within packages, with description fields
- **Line Items**: Priced components with full pricing columns
- **Sub Line Items**: Nested items under line items

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## Roadmap

- [ ] Copy/duplicate operations
- [ ] Drag-and-drop reordering  
- [ ] Equipment templates
- [ ] Word document export
- [ ] JSON import/export
- [ ] Backend integration
