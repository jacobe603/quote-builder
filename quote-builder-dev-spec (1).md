# Quote Builder Application - Development Specification

## Project Overview

A React-based quote building application for HVAC equipment sales. The application allows salespeople to create detailed quotes with a hierarchical structure, calculate pricing, and generate customer-facing quote descriptions.

### Key Principles

- **Excel-like interface**: Inline cell editing, no modals for data entry
- **Collapsible hierarchy**: Expandable/collapsible sections at each level
- **SQL-ready data**: Flat arrays with foreign keys for future database migration
- **Two views**: Pricing View and Description View
- **No backend**: Local state management with easily exportable JSON structure

---

## Data Model

### Entity Relationship Overview

```
Quote (1) → (M) Quote Package (1) → (M) Equipment Group (1) → (M) Line Item (1) → (M) Sub Line Item
```

### Quote

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Quote name |
| projectId | string (FK) | Reference to Project |
| customerId | string (FK) | Specific customer for this quote |
| customerName | string | Denormalized customer name |
| customerContact | string | Contact person name |
| customerEmail | string | Email for sending quote |
| revision | number | Revision number |
| status | enum | draft, sent, revised, won, lost, expired |
| createdAt | datetime | Creation timestamp |
| modifiedAt | datetime | Last modified timestamp |

### Quote Package

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| quoteId | string (FK) | Parent quote |
| name | string | Package name |
| defaultMU | number | Default markup (e.g., 1.35) pushed to all lines |
| sortOrder | number | Display order |

**Calculated Totals (display only, not stored):**
- Total Net (sum of all line items)
- Bid Price (sum of all line items)
- Commission (sum of all line items)

### Equipment Group

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| packageId | string (FK) | Parent package |
| equipmentTypeId | string (FK) | Equipment type |
| manufacturerId | string (FK) | Manufacturer |
| modelSeriesId | string (FK) | Model series |
| headerText | string | Auto-generated, editable override |
| customNotes | string | Free text for quote descriptions |
| sortOrder | number | Display order |

### Line Item (also used for Sub Line Items)

Single table design with `parentLineItemId` to distinguish:
- `parentLineItemId = null` → Line Item
- `parentLineItemId = [id]` → Sub Line Item

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| equipmentGroupId | string (FK) | Parent equipment group |
| parentLineItemId | string (FK) | Null for Line Items, parent ID for Sub Line Items |
| qty | number | Quantity |
| supplierId | string (FK) | Supplier |
| manufacturerId | string (FK) | Manufacturer |
| equipmentTypeId | string (FK) | Equipment type |
| model | string | Model number/name |
| listPrice | number | List price (per unit) |
| priceIncrease | number | Price increase as decimal (0.03 = 3%) |
| multiplier | number | Multiplier (e.g., 0.42) |
| pay | number | Manufacturer commission % as decimal (0.05 = 5%) |
| freight | number | Freight cost (total, not per unit) |
| markup | number | Markup multiplier (e.g., 1.35) |
| shorthand | string | Internal description |
| quoteDescription | string | Customer-facing description |
| showOnQuote | boolean | Whether to display on quote output |
| sortOrder | number | Display order |

**Calculated Fields (not stored):**
- mfgNet: `qty * listPrice * multiplier * (1 + priceIncrease)`
- mfgComm: `mfgNet * pay`
- totalNet: `mfgNet + freight`
- bidPrice: `totalNet * markup`
- salesComm: `(bidPrice - totalNet) + mfgComm`

---

## Master Data (Admin-Managed)

### Equipment Type

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Internal name (e.g., "RTU") |
| quoteDisplay | string | Display name (e.g., "Packaged Rooftop Units") |
| active | boolean | Is active |

### Manufacturer

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Name (e.g., "AAON") |
| quoteDisplay | string | Display name |
| active | boolean | Is active |

### Model Series

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| manufacturerId | string (FK) | Parent manufacturer |
| equipmentTypeId | string (FK) | Associated equipment type |
| name | string | Name (e.g., "RN") |
| quoteDisplay | string | Display name (e.g., "RN Series") |
| active | boolean | Is active |

### Supplier

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Name (e.g., "SVL") |
| active | boolean | Is active |

### Option

Options are additive based on level (Equipment Type → Manufacturer → Model Series).

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| shorthand | string | Internal name |
| quoteDescription | string | Customer-facing description |
| level | enum | equipmentType, manufacturer, modelSeries |
| equipmentTypeId | string (FK) | Required |
| manufacturerId | string (FK) | Null if equipmentType level |
| modelSeriesId | string (FK) | Null if equipmentType or manufacturer level |
| defaultSelected | boolean | Pre-checked when creating Equipment Group |
| active | boolean | Is active |

### Equipment Group Option (Junction Table)

| Field | Type | Description |
|-------|------|-------------|
| equipmentGroupId | string (FK) | Equipment group |
| optionId | string (FK) | Selected option |

### Equipment Group Template

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| equipmentTypeId | string (FK) | 1:1 with Equipment Type |
| name | string | Template name |
| active | boolean | Is active |

### Template Line Item

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| templateId | string (FK) | Parent template |
| name | string | Line item name |
| defaultEquipmentTypeId | string (FK) | Optional pre-fill |
| defaultManufacturerId | string (FK) | Optional pre-fill |
| required | boolean | Required (always added) vs Optional (user selects) |
| sortOrder | number | Display order |

---

## Pricing Calculations

### Formula Chain

```
Mfg Net    = Qty × List Price × Multiplier × (1 + Price Increase %)
Mfg Comm   = Mfg Net × Pay %
Total Net  = Mfg Net + Freight
Bid Price  = Total Net × Markup
Sales Comm = (Bid Price - Total Net) + Mfg Comm
```

### Example Calculation

| Input | Value |
|-------|-------|
| Qty | 3 |
| List Price | $18,000 |
| Price Increase | 3% (0.03) |
| Multiplier | 0.42 |
| Pay | 5% (0.05) |
| Freight | $1,200 |
| Markup | 1.35 |

```
Mfg Net    = 3 × $18,000 × 0.42 × 1.03 = $23,360.40
Mfg Comm   = $23,360.40 × 0.05 = $1,168.02
Total Net  = $23,360.40 + $1,200 = $24,560.40
Bid Price  = $24,560.40 × 1.35 = $33,156.54
Sales Comm = ($33,156.54 - $24,560.40) + $1,168.02 = $9,764.16
```

### Roll-Up Calculations

| Level | Calculation |
|-------|-------------|
| Line Item | Own calculated values + sum of all Sub Line Item values |
| Equipment Group | Sum of all Line Item totals |
| Quote Package | Sum of all Equipment Group totals (display Total Net, Bid Price, Commission only) |

---

## User Interface

### Pricing View - Column Order

| # | Column | Type | Width |
|---|--------|------|-------|
| 1 | Qty | Input | narrow |
| 2 | Supplier | Dropdown | medium |
| 3 | Manufacturer | Dropdown | medium |
| 4 | Equipment | Dropdown | medium |
| 5 | Model | Input | medium |
| 6 | List | Input (currency) | medium |
| 7 | $ ↑ | Input (%) | narrow |
| 8 | Multi | Input (decimal) | narrow |
| 9 | Pay | Input (%) | narrow |
| 10 | Mfg. Net | Calculated | medium |
| 11 | Comm | Calculated | medium |
| 12 | Freight | Input (currency) | medium |
| 13 | Total Net | Calculated | medium |
| 14 | MU | Input (decimal) | narrow |
| 15 | Comm | Calculated | medium |
| 16 | Bid Price | Calculated | medium |

### Collapsible Hierarchy

```
Quote Package: [Name]                              Total Net | Bid Price | Comm
├─ ▼ Equipment Group: [Header Text]
│  ├─ ▼ Line Item Row (with sub-items)
│  │  ├─ Sub Line Item Row (indented)
│  │  └─ Sub Line Item Row (indented)
│  ├─ ► Line Item Row (collapsed, has sub-items)
│  └─ Line Item Row (no sub-items, no toggle)
└─ ► Equipment Group: [Header Text] (collapsed)
```

**Collapse Behavior:**
- Equipment Group: Toggle shows/hides all Line Items within
- Line Item: Toggle shows/hides Sub Line Items (only if has children)
- Items without children: No expand/collapse icon

**Visual Indicators:**
- ▼ = Expanded
- ► = Collapsed
- Sub Line Items indented under parent
- Lines with markup differing from package default show indicator (asterisk or highlight)

### Excel-Like Editing

- Click any input cell to edit directly
- Tab to move between cells
- Enter to confirm and move down
- Escape to cancel edit
- No edit modals - all inline
- Dropdowns for Supplier, Manufacturer, Equipment Type (filterable)
- Numeric inputs for prices, percentages, multipliers

### Package-Level Markup Push

- Package has a Default MU field
- When changed, prompt user:
  - "Apply to all lines" → Overwrites all line markups
  - "Apply to new lines only" → Only future lines get default
  - "Cancel" → No change
- Visual indicator on lines where MU differs from package default

---

## Actions by Level

### Quote Package Actions

| Action | Description |
|--------|-------------|
| Create | New empty package with name |
| Copy | Deep copy all Equipment Groups, Line Items, Sub Line Items |
| Delete | Remove package and all children (with confirmation) |
| Combine | Select 2+ packages → merge into one new package (originals deleted) |
| Split | Select Equipment Groups to move to new package (original modified) |

### Equipment Group Actions

| Action | Description |
|--------|-------------|
| Create | New blank group OR from template (if Equipment Type has template) |
| Copy | Duplicate with all Line Items and Sub Line Items |
| Delete | Remove group and all children |
| Move | Move to different Quote Package |

### Line Item Actions

| Action | Description |
|--------|-------------|
| Create | New blank line item |
| Copy | Duplicate with all Sub Line Items |
| Delete | Remove line and all Sub Line Items |
| Move | Move to different Equipment Group |

### Sub Line Item Actions

| Action | Description |
|--------|-------------|
| Create | New blank sub line item under parent |
| Copy | Duplicate |
| Delete | Remove |
| Move | Move to different parent Line Item |

---

## Equipment Group Templates

### Template Application Workflow

1. User clicks "Add Equipment Group"
2. User selects Equipment Type
3. If template exists for Equipment Type, show dialog:
   - List all template line items
   - Required items: checked and disabled
   - Optional items: unchecked by default, user toggles
4. User clicks "Add to Quote"
5. Equipment Group created with selected Line Items (pricing fields empty)

### Template Dialog UI

```
┌─────────────────────────────────────────────────────────┐
│  Add Equipment Group: Rooftop Units                     │
├─────────────────────────────────────────────────────────┤
│  The following items will be added:                     │
│                                                         │
│  ☑  RTUs                          (required)            │
│  ☑  Roof Curbs                    (required)            │
│  ☑  Controls                      (required)            │
│  ☑  Startup (CTS)                 (required)            │
│  ☐  Extended Warranty             (optional)            │
│  ☐  Hail Guards                   (optional)            │
│                                                         │
│             [ Cancel ]  [ Add to Quote ]                │
└─────────────────────────────────────────────────────────┘
```

---

## Options System

### Option Inheritance (Additive)

When creating/viewing Equipment Group with Type + Manufacturer + Model Series, show all options where:
- Option.equipmentTypeId matches (Equipment Type level), OR
- Option.equipmentTypeId + manufacturerId match (Manufacturer level), OR
- Option.equipmentTypeId + manufacturerId + modelSeriesId match (Model Series level)

### Option Selection

- Options with `defaultSelected = true` are pre-checked
- User can toggle any option on/off
- Selected options stored in junction table `equipmentGroupOptions`
- Selected options appear in Description View output

---

## Description View

### Structure

Mirrors pricing structure - same hierarchy, different content.

```
┌──────────────────────────────────────────────────────────────────────┐
│ Equipment Group: RTU - AAON RN Series Packaged Rooftop Units         │
├──────────────────────────────────────────────────────────────────────┤
│ Header Text: [editable text field]                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Included Options:                                                    │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ ☑ Digital Scroll Compressors                                     │ │
│ │ ☑ EC Condenser Fans                                              │ │
│ │ ☑ MERV 13 Filters                                                │ │
│ │ ☐ Non-Fused Disconnect                                           │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ Line Item Descriptions:                                              │
│ ┌────────────────────────────────────────────────────────────┬─────┐ │
│ │ Shorthand      │ Quote Description                         │Show │ │
│ ├────────────────┼───────────────────────────────────────────┼─────┤ │
│ │ RN-030         │ AAON Model RN-030, 30-ton RTU, 460/3/60   │ ☑   │ │
│ │  └ Economizer  │ Airside economizer with barometric relief │ ☑   │ │
│ │  └ Hail Guards │ Factory-installed hail guards             │ ☑   │ │
│ │ RN-040         │ AAON Model RN-040, 40-ton RTU, 460/3/60   │ ☑   │ │
│ │ Roof Curbs     │ Factory roof curbs with wood nailer       │ ☑   │ │
│ │ Controls       │ BACnet MS/TP controls integration         │ ☑   │ │
│ │ Startup        │ Factory-authorized startup                │ ☑   │ │
│ │ Freight        │                                           │ ☐   │ │
│ └────────────────┴───────────────────────────────────────────┴─────┘ │
├──────────────────────────────────────────────────────────────────────┤
│ Custom Notes:                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ [free text area]                                                 │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Quote Output Generation

Generate text per Equipment Group:

```
ROOFTOP UNITS - AAON RN SERIES PACKAGED ROOFTOP UNITS

Included features:
• Digital scroll compressors for enhanced part-load efficiency
• Electronically commutated (EC) condenser fan motors
• MERV 13 pleated filters

Equipment:
• (3) AAON Model RN-030, 30-ton packaged rooftop unit, 460/3/60
    - Airside economizer with barometric relief
    - Factory-installed hail guards
• (2) AAON Model RN-040, 40-ton packaged rooftop unit, 460/3/60

Also included:
• Factory roof curbs with wood nailer
• BACnet MS/TP controls integration
• Factory-authorized startup and commissioning

[Custom notes if any]
```

---

## Sample Data Structure

```javascript
const initialData = {
  // Core quote data
  quotes: [
    {
      id: "q1",
      name: "Building A HVAC",
      projectId: "proj1",
      customerId: "cust1",
      customerName: "ABC General Contractors",
      customerContact: "John Smith",
      customerEmail: "john@abcgc.com",
      revision: 1,
      status: "draft",
      createdAt: "2025-01-02T10:00:00Z",
      modifiedAt: "2025-01-02T14:30:00Z"
    }
  ],

  quotePackages: [
    {
      id: "pkg1",
      quoteId: "q1",
      name: "Rooftop Units",
      defaultMU: 1.35,
      sortOrder: 1
    }
  ],

  equipmentGroups: [
    {
      id: "grp1",
      packageId: "pkg1",
      equipmentTypeId: "et1",
      manufacturerId: "mfr1",
      modelSeriesId: "ms1",
      headerText: "RTU - AAON RN Series Packaged Rooftop Units",
      customNotes: "",
      sortOrder: 1
    }
  ],

  lineItems: [
    {
      id: "li1",
      equipmentGroupId: "grp1",
      parentLineItemId: null,
      qty: 3,
      supplierId: "sup1",
      manufacturerId: "mfr1",
      equipmentTypeId: "et1",
      model: "RN-030",
      listPrice: 18000,
      priceIncrease: 0.03,
      multiplier: 0.42,
      pay: 0.05,
      freight: 1200,
      markup: 1.35,
      shorthand: "RN-030",
      quoteDescription: "AAON Model RN-030, 30-ton packaged rooftop unit, 460/3/60",
      showOnQuote: true,
      sortOrder: 1
    },
    {
      id: "li2",
      equipmentGroupId: "grp1",
      parentLineItemId: "li1",
      qty: 1,
      supplierId: "sup1",
      manufacturerId: "mfr1",
      equipmentTypeId: "et2",
      model: "Economizer",
      listPrice: 3200,
      priceIncrease: 0.03,
      multiplier: 0.42,
      pay: 0,
      freight: 0,
      markup: 1.35,
      shorthand: "Economizer",
      quoteDescription: "Airside economizer with barometric relief",
      showOnQuote: true,
      sortOrder: 1
    },
    {
      id: "li3",
      equipmentGroupId: "grp1",
      parentLineItemId: "li1",
      qty: 1,
      supplierId: "sup1",
      manufacturerId: "mfr1",
      equipmentTypeId: "et2",
      model: "Hail Guards",
      listPrice: 1800,
      priceIncrease: 0.03,
      multiplier: 0.42,
      pay: 0,
      freight: 0,
      markup: 1.35,
      shorthand: "Hail Guards",
      quoteDescription: "Factory-installed hail guards",
      showOnQuote: true,
      sortOrder: 2
    },
    {
      id: "li4",
      equipmentGroupId: "grp1",
      parentLineItemId: null,
      qty: 2,
      supplierId: "sup1",
      manufacturerId: "mfr1",
      equipmentTypeId: "et1",
      model: "RN-040",
      listPrice: 22000,
      priceIncrease: 0.03,
      multiplier: 0.42,
      pay: 0.05,
      freight: 800,
      markup: 1.35,
      shorthand: "RN-040",
      quoteDescription: "AAON Model RN-040, 40-ton packaged rooftop unit, 460/3/60",
      showOnQuote: true,
      sortOrder: 2
    },
    {
      id: "li5",
      equipmentGroupId: "grp1",
      parentLineItemId: null,
      qty: 5,
      supplierId: "sup1",
      manufacturerId: "mfr1",
      equipmentTypeId: "et3",
      model: "RN-Curb",
      listPrice: 1200,
      priceIncrease: 0.03,
      multiplier: 0.42,
      pay: 0,
      freight: 400,
      markup: 1.35,
      shorthand: "Roof Curbs",
      quoteDescription: "Factory roof curbs with wood nailer and cant strip",
      showOnQuote: true,
      sortOrder: 3
    },
    {
      id: "li6",
      equipmentGroupId: "grp1",
      parentLineItemId: null,
      qty: 1,
      supplierId: "sup2",
      manufacturerId: "mfr2",
      equipmentTypeId: "et4",
      model: "JACE-8000",
      listPrice: 4500,
      priceIncrease: 0,
      multiplier: 0.65,
      pay: 0,
      freight: 0,
      markup: 1.40,
      shorthand: "Controls",
      quoteDescription: "BACnet MS/TP controls integration with building automation",
      showOnQuote: true,
      sortOrder: 4
    },
    {
      id: "li7",
      equipmentGroupId: "grp1",
      parentLineItemId: null,
      qty: 1,
      supplierId: "sup1",
      manufacturerId: "mfr1",
      equipmentTypeId: "et5",
      model: "Startup",
      listPrice: 2100,
      priceIncrease: 0,
      multiplier: 1.0,
      pay: 0,
      freight: 0,
      markup: 1.35,
      shorthand: "Startup",
      quoteDescription: "Factory-authorized startup and commissioning",
      showOnQuote: true,
      sortOrder: 5
    }
  ],

  equipmentGroupOptions: [
    { equipmentGroupId: "grp1", optionId: "opt1" },
    { equipmentGroupId: "grp1", optionId: "opt2" },
    { equipmentGroupId: "grp1", optionId: "opt3" }
  ],

  // Master data
  equipmentTypes: [
    { id: "et1", name: "RTU", quoteDisplay: "Packaged Rooftop Units", active: true },
    { id: "et2", name: "Accessory", quoteDisplay: "Accessories", active: true },
    { id: "et3", name: "Curb", quoteDisplay: "Roof Curbs", active: true },
    { id: "et4", name: "Controls", quoteDisplay: "Controls", active: true },
    { id: "et5", name: "Service", quoteDisplay: "Services", active: true }
  ],

  manufacturers: [
    { id: "mfr1", name: "AAON", quoteDisplay: "AAON", active: true },
    { id: "mfr2", name: "Tridium", quoteDisplay: "Tridium", active: true },
    { id: "mfr3", name: "Daikin", quoteDisplay: "Daikin Applied", active: true }
  ],

  modelSeries: [
    { id: "ms1", manufacturerId: "mfr1", equipmentTypeId: "et1", name: "RN", quoteDisplay: "RN Series", active: true },
    { id: "ms2", manufacturerId: "mfr1", equipmentTypeId: "et1", name: "RQ", quoteDisplay: "RQ Series", active: true },
    { id: "ms3", manufacturerId: "mfr3", equipmentTypeId: "et1", name: "Rebel", quoteDisplay: "Rebel Series", active: true }
  ],

  suppliers: [
    { id: "sup1", name: "SVL", active: true },
    { id: "sup2", name: "ControlCo", active: true }
  ],

  options: [
    {
      id: "opt1",
      shorthand: "Digital Scroll",
      quoteDescription: "Digital scroll compressors for enhanced part-load efficiency",
      level: "modelSeries",
      equipmentTypeId: "et1",
      manufacturerId: "mfr1",
      modelSeriesId: "ms1",
      defaultSelected: true,
      active: true
    },
    {
      id: "opt2",
      shorthand: "EC Condenser Fans",
      quoteDescription: "Electronically commutated (EC) condenser fan motors",
      level: "modelSeries",
      equipmentTypeId: "et1",
      manufacturerId: "mfr1",
      modelSeriesId: "ms1",
      defaultSelected: true,
      active: true
    },
    {
      id: "opt3",
      shorthand: "MERV 13 Filters",
      quoteDescription: "MERV 13 pleated filters",
      level: "modelSeries",
      equipmentTypeId: "et1",
      manufacturerId: "mfr1",
      modelSeriesId: "ms1",
      defaultSelected: true,
      active: true
    },
    {
      id: "opt4",
      shorthand: "Non-Fused Disconnect",
      quoteDescription: "Factory-installed non-fused disconnect switch",
      level: "modelSeries",
      equipmentTypeId: "et1",
      manufacturerId: "mfr1",
      modelSeriesId: "ms1",
      defaultSelected: false,
      active: true
    },
    {
      id: "opt5",
      shorthand: "Coil Coating",
      quoteDescription: "Factory-applied corrosion-resistant coil coating",
      level: "manufacturer",
      equipmentTypeId: "et1",
      manufacturerId: "mfr1",
      modelSeriesId: null,
      defaultSelected: false,
      active: true
    },
    {
      id: "opt6",
      shorthand: "Roof Curbs",
      quoteDescription: "Factory roof curbs",
      level: "equipmentType",
      equipmentTypeId: "et1",
      manufacturerId: null,
      modelSeriesId: null,
      defaultSelected: false,
      active: true
    }
  ],

  equipmentGroupTemplates: [
    { id: "tpl1", equipmentTypeId: "et1", name: "Standard RTU Package", active: true }
  ],

  templateLineItems: [
    { id: "tli1", templateId: "tpl1", name: "Units", defaultEquipmentTypeId: "et1", defaultManufacturerId: null, required: true, sortOrder: 1 },
    { id: "tli2", templateId: "tpl1", name: "Roof Curbs", defaultEquipmentTypeId: "et3", defaultManufacturerId: null, required: true, sortOrder: 2 },
    { id: "tli3", templateId: "tpl1", name: "Controls", defaultEquipmentTypeId: "et4", defaultManufacturerId: null, required: true, sortOrder: 3 },
    { id: "tli4", templateId: "tpl1", name: "Startup", defaultEquipmentTypeId: "et5", defaultManufacturerId: null, required: true, sortOrder: 4 },
    { id: "tli5", templateId: "tpl1", name: "Freight", defaultEquipmentTypeId: null, defaultManufacturerId: null, required: true, sortOrder: 5 },
    { id: "tli6", templateId: "tpl1", name: "Extended Warranty", defaultEquipmentTypeId: null, defaultManufacturerId: null, required: false, sortOrder: 6 }
  ]
};
```

---

## Development Phases

### Phase 1: Core Pricing Interface

**Goal:** Functional pricing view with Excel-like editing

**Features:**
- [ ] Project setup (React + Vite or Create React App)
- [ ] Data structure and state management
- [ ] Quote Package display with totals
- [ ] Equipment Group collapsible sections
- [ ] Line Item rows with all 16 columns
- [ ] Sub Line Item rows (indented, collapsible under parent)
- [ ] Inline cell editing (click to edit, tab navigation)
- [ ] Dropdown selects for Supplier, Manufacturer, Equipment Type
- [ ] Auto-calculation of Mfg Net, Mfg Comm, Total Net, Bid Price, Sales Comm
- [ ] Roll-up totals at Package level
- [ ] Package-level default MU with push-down to lines
- [ ] Add Line Item / Add Sub Line Item buttons
- [ ] Delete Line Item / Sub Line Item

### Phase 2: Full CRUD + Reorganization

**Goal:** Complete create, copy, delete, move operations

**Features:**
- [ ] Create Quote Package
- [ ] Copy Quote Package (deep copy)
- [ ] Delete Quote Package
- [ ] Combine Quote Packages
- [ ] Split Quote Package
- [ ] Create Equipment Group (blank)
- [ ] Copy Equipment Group
- [ ] Delete Equipment Group
- [ ] Move Equipment Group to different Package
- [ ] Copy Line Item
- [ ] Move Line Item to different Equipment Group
- [ ] Move Sub Line Item to different parent Line Item
- [ ] Drag-and-drop reordering (optional, nice-to-have)

### Phase 3: Templates

**Goal:** Equipment Group templates for faster quote creation

**Features:**
- [ ] Template selection when creating Equipment Group
- [ ] Template dialog with Required/Optional line items
- [ ] Auto-populate line items from template
- [ ] Admin UI for managing templates (can be simple for now)

### Phase 4: Description View

**Goal:** Second view for managing quote descriptions

**Features:**
- [ ] Toggle between Pricing View and Description View
- [ ] Equipment Group header text editing
- [ ] Options selection (checkboxes, inherited by level)
- [ ] Line Item shorthand and quote description editing
- [ ] Show on Quote toggle
- [ ] Custom notes field
- [ ] Quote text output generation (preview)

### Phase 5: Polish & Export

**Goal:** Production-ready features

**Features:**
- [ ] Quote status management
- [ ] Customer information editing
- [ ] Export data as JSON
- [ ] Import data from JSON
- [ ] Copy quote output text to clipboard
- [ ] Print-friendly quote view
- [ ] Admin UI for master data (Equipment Types, Manufacturers, etc.)

---

## Technical Recommendations

### State Management

Use React Context + useReducer for global state, or Zustand for simpler API:

```javascript
// Recommended: Zustand
import { create } from 'zustand';

const useQuoteStore = create((set, get) => ({
  quotes: [],
  quotePackages: [],
  equipmentGroups: [],
  lineItems: [],
  // ... other data
  
  // Actions
  addLineItem: (lineItem) => set((state) => ({
    lineItems: [...state.lineItems, lineItem]
  })),
  
  updateLineItem: (id, updates) => set((state) => ({
    lineItems: state.lineItems.map(li => 
      li.id === id ? { ...li, ...updates } : li
    )
  })),
  
  deleteLineItem: (id) => set((state) => ({
    lineItems: state.lineItems.filter(li => li.id !== id && li.parentLineItemId !== id)
  })),
  
  // Computed
  getLineItemsForGroup: (groupId) => {
    return get().lineItems.filter(li => li.equipmentGroupId === groupId);
  },
  
  getSubLineItems: (parentId) => {
    return get().lineItems.filter(li => li.parentLineItemId === parentId);
  }
}));
```

### Component Structure

```
src/
├── components/
│   ├── QuoteBuilder/
│   │   ├── QuoteBuilder.jsx          # Main container
│   │   ├── QuotePackage.jsx          # Package with totals
│   │   ├── EquipmentGroup.jsx        # Collapsible group
│   │   ├── LineItemRow.jsx           # Line item row
│   │   ├── SubLineItemRow.jsx        # Sub line item row (or reuse LineItemRow with indent)
│   │   ├── EditableCell.jsx          # Inline editable cell
│   │   ├── DropdownCell.jsx          # Dropdown select cell
│   │   └── PricingHeader.jsx         # Column headers
│   ├── DescriptionView/
│   │   ├── DescriptionView.jsx
│   │   ├── OptionsSelector.jsx
│   │   └── QuoteOutput.jsx
│   └── common/
│       ├── CollapsibleSection.jsx
│       └── ConfirmDialog.jsx
├── store/
│   └── quoteStore.js                 # Zustand store
├── utils/
│   ├── calculations.js               # Pricing formulas
│   └── idGenerator.js                # UUID generation
├── data/
│   └── initialData.js                # Sample/seed data
└── App.jsx
```

### Key Utility Functions

```javascript
// calculations.js
export const calculateLineItem = (item) => {
  const mfgNet = item.qty * item.listPrice * item.multiplier * (1 + item.priceIncrease);
  const mfgComm = mfgNet * item.pay;
  const totalNet = mfgNet + item.freight;
  const bidPrice = totalNet * item.markup;
  const salesComm = (bidPrice - totalNet) + mfgComm;
  
  return {
    mfgNet: Math.round(mfgNet * 100) / 100,
    mfgComm: Math.round(mfgComm * 100) / 100,
    totalNet: Math.round(totalNet * 100) / 100,
    bidPrice: Math.round(bidPrice * 100) / 100,
    salesComm: Math.round(salesComm * 100) / 100
  };
};

export const calculateGroupTotals = (lineItems, subLineItems) => {
  // Sum all line items and their sub items
  let totalNet = 0;
  let bidPrice = 0;
  let salesComm = 0;
  
  lineItems.forEach(li => {
    const calc = calculateLineItem(li);
    totalNet += calc.totalNet;
    bidPrice += calc.bidPrice;
    salesComm += calc.salesComm;
    
    // Add sub items
    const subs = subLineItems.filter(s => s.parentLineItemId === li.id);
    subs.forEach(sub => {
      const subCalc = calculateLineItem(sub);
      totalNet += subCalc.totalNet;
      bidPrice += subCalc.bidPrice;
      salesComm += subCalc.salesComm;
    });
  });
  
  return { totalNet, bidPrice, salesComm };
};
```

---

## Notes for Development

1. **ID Generation**: Use UUID v4 for all IDs (e.g., `crypto.randomUUID()` or `uuid` package)

2. **Sorting**: Always respect `sortOrder` when displaying items. Update sort orders when reordering.

3. **Deletion Cascade**: When deleting:
   - Quote Package: Delete all Equipment Groups, Line Items, Sub Line Items, and Equipment Group Options
   - Equipment Group: Delete all Line Items, Sub Line Items, and Equipment Group Options
   - Line Item: Delete all Sub Line Items

4. **Move Operations**: Just update the parent FK. No need to delete/recreate.

5. **Currency Formatting**: Display as currency ($1,234.56) but store as raw numbers.

6. **Percentage Inputs**: Display as percentage (3%) but store as decimal (0.03). Handle conversion on input/display.

7. **Null Handling**: Some fields can be null/empty (freight, pay, etc.). Treat null as 0 in calculations.

8. **Validation**: Minimal for prototype. Ensure numeric fields are numbers, required FKs are set.

---

## Glossary

| Term | Definition |
|------|------------|
| Quote Package | Top-level sellable unit with final pricing totals |
| Equipment Group | Logical grouping by Equipment Type + Manufacturer + Model Series |
| Line Item | Primary priced item within an Equipment Group |
| Sub Line Item | Child item under a Line Item (accessories, options) |
| MU / Markup | Multiplier applied to Total Net to get Bid Price (e.g., 1.35 = 35% markup) |
| Multiplier / Multi | Discount multiplier from list price (e.g., 0.42 = 58% off list) |
| Pay | Manufacturer commission percentage paid to SVL |
| Mfg Net | Manufacturer net cost after multiplier and price increase |
| Mfg Comm | Dollar amount of manufacturer commission |
| Total Net | True cost (Mfg Net + Freight) |
| Bid Price | Customer-facing sell price |
| Sales Comm | Total gross profit (markup margin + manufacturer commission) |
| Option | Factory feature included in equipment (not separately priced) |
