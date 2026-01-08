# Quote Builder Application - Concept Overview

## What This Application Does

The Quote Builder is a tool for HVAC equipment salespeople to create detailed quotes for commercial construction projects. It replaces the current Excel-based workflow with a purpose-built application that handles pricing calculations, organizes equipment logically, and generates professional quote descriptions for customers.

The application has two main functions: calculating accurate pricing and producing customer-facing quote documentation. These are handled through two distinct views of the same underlying data.

---

## The Quote Structure

Quotes are organized in a four-level hierarchy that mirrors how HVAC projects are actually structured and sold.

### Quote Packages

A Quote Package is the top level of the hierarchy and represents what the customer actually buys. It's the sellable unit with a final price attached. A single quote might have multiple packages if the customer wants to see different options priced separately, or if certain equipment could be purchased independently.

For example, a contractor might want Air Handling Units and their associated Condensing Units quoted as one package (since they work together and shouldn't be sold separately), while Rooftop Units for a different part of the building could be a separate package they might choose to buy or not.

The Quote Package displays three summary totals: Total Net (our true cost), Bid Price (what we're selling it for), and Commission (our total profit including any manufacturer rebates).

### Equipment Groups

Within each Quote Package, equipment is organized into Equipment Groups. These are logical groupings based on what the equipment is—defined by three characteristics: Equipment Type, Manufacturer, and Model Series.

For instance, "RTU - AAON RN Series" would be one Equipment Group containing all AAON RN model rooftop units. If the same project also included AAON RQ Series units, those would be a separate Equipment Group because they're a different model series.

Equipment Groups also hold the description information that appears on customer-facing quotes—a header describing the equipment, selected factory options, and any custom notes.

### Line Items

Line Items are the individual priced components within an Equipment Group. These are the rows in our pricing spreadsheet—each one representing something with a cost: specific equipment models, roof curbs, controls, startup services, freight, and so on.

Every Line Item has the full set of pricing fields: quantity, supplier, manufacturer, equipment type, model, list price, price increase percentage, multiplier, manufacturer pay percentage, freight, and markup. The system calculates the rest automatically.

### Sub Line Items

Sub Line Items add one more level of detail beneath Line Items. These are accessories, options, or components that are tied to a specific parent item rather than standing alone.

For example, under a Line Item for "(3) AAON RN-030 Units," you might have Sub Line Items for Economizers, Hail Guards, and Convenience Outlets. These are priced separately but logically belong to those specific units.

Sub Line Items have the same pricing fields as Line Items—they're essentially the same thing, just nested under a parent for organizational clarity.

---

## Pricing Logic

### The Calculation Chain

Every priced line (whether a Line Item or Sub Line Item) follows the same calculation:

**Manufacturer Net** is what we actually pay for the equipment. Start with the List Price, multiply by the Multiplier (our discount off list), multiply by the Quantity, and factor in any anticipated Price Increase.

**Manufacturer Commission** is money we receive back from certain manufacturers as a rebate. It's calculated as a percentage of the Manufacturer Net.

**Total Net** is our true all-in cost: Manufacturer Net plus Freight.

**Bid Price** is what we charge the customer: Total Net multiplied by our Markup.

**Sales Commission** represents our total gross profit on the line: the markup margin (Bid Price minus Total Net) plus any Manufacturer Commission we receive.

### Package-Level Markup

While every line has its own Markup field, Quote Packages have a Default Markup that can be pushed down to all lines within that package. This makes it easy to set a standard margin across an entire package while still allowing individual lines to be adjusted when needed (for instance, marking up accessories more than primary equipment, or reducing margin on a competitive item).

### Roll-Up Totals

Totals flow upward through the hierarchy. Sub Line Items roll up into their parent Line Item. Line Items roll up into their Equipment Group. Equipment Groups roll up into the Quote Package, which displays the final Total Net, Bid Price, and Commission for everything within it.

---

## Two Views of the Same Data

### Pricing View

The Pricing View is where salespeople do their number work. It looks and feels like Excel—a grid of rows and columns where you can click into any cell and edit directly. No popup dialogs or separate edit screens; just click, type, and move on.

The columns match the familiar Excel workflow: Qty, Supplier, Manufacturer, Equipment, Model, List, Price Increase %, Multiplier, Pay %, Mfg Net, Mfg Commission, Freight, Total Net, Markup, Sales Commission, and Bid Price. Calculated fields update automatically as inputs change.

The hierarchy is represented through collapsible sections. Equipment Groups can be expanded or collapsed to show or hide their Line Items. Line Items with Sub Items can be expanded to show those nested rows, which appear indented beneath their parent.

### Description View

The Description View is for managing what the customer sees on the final quote document. It shows the same hierarchical structure but focuses on text rather than numbers.

For each Equipment Group, you can edit the header text (which defaults to something like "RTU - AAON RN Series Packaged Rooftop Units" but can be customized), select which factory options to list as included features, write or edit descriptions for each Line Item and Sub Line Item, toggle whether each item should appear on the quote at all, and add custom notes.

The Description View ultimately generates the formatted text that goes into the quote document sent to customers.

---

## Factory Options

Some features are built into the equipment price rather than being separate line items. Digital scroll compressors, EC condenser fans, MERV 13 filters, factory coatings—these are factory-installed options that may not even have individual costs broken out. They're just part of what we're quoting.

The Options system lets salespeople indicate which of these features are included in the quoted equipment. Options are defined at three levels that stack additively:

**Equipment Type level** options apply to all equipment of that type regardless of manufacturer (like "Roof Curbs" being available for any RTU).

**Manufacturer level** options apply to all of that manufacturer's equipment of that type (like "AAON Vue BAS Integration" being available on any AAON RTU).

**Model Series level** options are specific to particular product lines (like "Digital Scroll Compressors" being specific to the AAON RN Series).

When creating an Equipment Group, the salesperson sees all applicable options combined and can check which ones are included. Selected options appear as bullet points in the quote description under "Included Features."

---

## Templates

To speed up quote creation, Equipment Groups can be created from templates. Each Equipment Type can have a template that pre-populates common Line Items.

For example, an RTU template might automatically add Line Items for: Units, Roof Curbs, Controls, Startup, and Freight. Some template items are marked Required (always added) while others are Optional (salesperson chooses whether to include them, like Extended Warranty).

When a salesperson creates a new Equipment Group and selects an Equipment Type that has a template, they're shown a dialog listing all the template items. Required items are pre-checked and locked. Optional items can be toggled on or off. The selected items are then created as empty Line Items ready for pricing.

---

## Working with Quote Packages

Quote Packages can be created, copied, deleted, combined, and split.

**Copying** a package creates a complete duplicate including all Equipment Groups, Line Items, and Sub Line Items. Useful for creating alternate pricing scenarios or starting a similar quote.

**Combining** takes two or more packages and merges them into one. The original packages are removed, and their Equipment Groups are moved into a new combined package. This is for situations where items were initially quoted separately but the customer wants one price for everything.

**Splitting** is the reverse—taking one package and dividing its Equipment Groups into multiple new packages. The original package is removed. This handles situations where a customer decides they want to buy only part of what was quoted together.

These operations work by moving the underlying data (Line Items are unique objects that get re-parented) rather than duplicating and deleting.

---

## Master Data

Several reference tables define the valid options throughout the application. All of this master data is managed by administrators, not regular users.

**Equipment Types** define the categories of equipment: RTU, AHU, Chiller, Curb, Controls, Service, etc. Each has an internal name and a customer-facing display name.

**Manufacturers** are the equipment brands: AAON, Daikin, Trane, Carrier, etc.

**Model Series** are specific product lines within a manufacturer, tied to an equipment type. AAON's RN Series and RQ Series are different Model Series, both for the RTU equipment type.

**Suppliers** are the companies SVL buys from, which may be different from manufacturers (SVL might buy AAON equipment through a distributor, for example).

**Options** are the factory features described above, defined with their level (Equipment Type, Manufacturer, or Model Series), display text, and whether they should be selected by default.

**Equipment Group Templates** define the default Line Items for each Equipment Type.

---

## Quote Context

Each Quote exists within a larger context. It belongs to a Project (which has its own customer list and other project details), but a specific Quote may be addressed to just one customer from that project. The Quote stores the customer name, contact person, and email directly so it's clear who this particular quote is for.

Quotes also have a Status (Draft, Sent, Revised, Won, Lost, or Expired) and a Revision number. If a quote needs significant changes after being sent, a new Quote Revision would typically be created rather than editing the original.

---

## The Excel-Like Experience

A core design principle is that the Pricing View should feel like working in Excel. Salespeople are comfortable with spreadsheets, and the existing workflow is spreadsheet-based. The application shouldn't fight that familiarity.

This means: click a cell to edit it directly, tab to move between cells, see calculations update instantly, collapse and expand sections to focus on what you're working on, and generally stay in a flow state without interruption from popups or page navigations.

The structure adds value over plain Excel by enforcing the hierarchy, automating the calculations, preventing formula errors, connecting to master data for consistent dropdowns, and generating formatted quote output—but the moment-to-moment experience of entering and adjusting numbers should feel natural to anyone who's used a spreadsheet.
