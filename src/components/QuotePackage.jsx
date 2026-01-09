import { useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import LineItemRow from './LineItemRow';
import { calculateGroupTotals } from '../utils/calculations';
import { formatCurrency } from '../utils/helpers';

/**
 * Quote Package Component
 * Top-level container with primary lines and sub-lines in a single table
 */
const QuotePackage = ({
  pkg,
  packageNumber,
  lineItems,
  onUpdateLineItem,
  onDeleteLineItem,
  onAddPrimaryLine,
  onAddSubLine,
  onMoveLineItem,
  onMovePackage,
  onUpdatePackageMU,
  onUpdatePackage,
  onDeletePackage,
  onOpenDescription,
  data
}) => {
  const [editingName, setEditingName] = useState(false);
  const [packageName, setPackageName] = useState(pkg.name);
  const [editingPackageNum, setEditingPackageNum] = useState(false);
  const [packageNumValue, setPackageNumValue] = useState(String(packageNumber));
  const [collapsedPrimaries, setCollapsedPrimaries] = useState({});

  // Calculate package totals
  const packageTotals = calculateGroupTotals(lineItems);

  // Get primary lines (no parent) sorted by sortOrder
  const primaryLines = lineItems
    .filter(li => li.parentLineItemId === null)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Get sub-lines for a given primary line
  const getSubLines = (primaryId) => lineItems
    .filter(li => li.parentLineItemId === primaryId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const togglePrimary = (primaryId) => {
    setCollapsedPrimaries(prev => ({
      ...prev,
      [primaryId]: !prev[primaryId]
    }));
  };

  const handleNameSave = () => {
    setEditingName(false);
    onUpdatePackage(pkg.id, 'name', packageName);
  };

  const handlePackageNumSave = () => {
    setEditingPackageNum(false);
    const newNum = parseInt(packageNumValue, 10);
    if (!isNaN(newNum) && newNum !== packageNumber) {
      onMovePackage(pkg.id, newNum);
    }
    setPackageNumValue(String(packageNumber));
  };

  // Check if a primary line has description content
  const hasDescription = (item) => item.equipmentHeading || item.equipmentBullets || item.notes;

  return (
    <div className="mb-8">
      {/* Package Header */}
      <div className="bg-svl-orange-light border border-svl-orange px-4 py-2 rounded-t-xl shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {editingPackageNum ? (
                <input
                  type="text"
                  value={packageNumValue}
                  onChange={(e) => setPackageNumValue(e.target.value)}
                  onBlur={handlePackageNumSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePackageNumSave();
                    if (e.key === 'Escape') {
                      setPackageNumValue(String(packageNumber));
                      setEditingPackageNum(false);
                    }
                  }}
                  autoFocus
                  className="bg-svl-orange text-white text-sm font-bold w-8 h-7 rounded-full text-center border-2 border-svl-burnt"
                />
              ) : (
                <span
                  className="bg-svl-orange text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-svl-burnt"
                  onClick={() => {
                    setPackageNumValue(String(packageNumber));
                    setEditingPackageNum(true);
                  }}
                  title="Click to change package order"
                >
                  {packageNumber}
                </span>
              )}
              <Package size={18} className="text-svl-burnt" />
              {editingName ? (
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                  className="bg-white border border-svl-orange rounded px-2 py-0.5 text-base font-bold w-64 text-svl-burnt"
                />
              ) : (
                <h2
                  className="text-lg font-bold text-svl-burnt cursor-pointer hover:bg-svl-orange/20 px-2 py-0.5 rounded"
                  onClick={() => setEditingName(true)}
                  title="Click to edit name"
                >
                  {pkg.name}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs bg-white/50 border border-svl-orange/30 px-2 py-0.5 rounded">
              <span className="text-svl-gray-dark">Default MU:</span>
              <input
                type="text"
                value={pkg.defaultMU}
                onChange={(e) => onUpdatePackageMU(pkg.id, parseFloat(e.target.value) || 1)}
                className="w-14 px-1.5 py-0.5 text-xs bg-white border border-svl-gray rounded text-center text-svl-black"
              />
            </div>
            <button
              onClick={() => onDeletePackage(pkg.id)}
              className="p-1 hover:bg-svl-red-light rounded text-svl-red"
              title="Delete Quote Package"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-xs text-svl-gray-dark uppercase tracking-wide">Total Net</div>
              <div className="text-sm font-semibold text-svl-black">{formatCurrency(packageTotals.totalNet)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-svl-gray-dark uppercase tracking-wide">Commission</div>
              <div className="text-sm font-semibold text-svl-green">{formatCurrency(packageTotals.salesComm)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-svl-gray-dark uppercase tracking-wide">Bid Price</div>
              <div className="text-base font-bold text-svl-orange">{formatCurrency(packageTotals.bidPrice)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Content - Single Table */}
      <div className="bg-white border-x border-b border-svl-gray rounded-b-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-svl-gray-light text-xs text-svl-gray-dark border-b-2 border-svl-gray">
                <th className="py-2 px-1 text-center w-8"></th>
                <th className="py-2 px-1 text-center w-20 bg-svl-gray border-r border-svl-gray">#</th>
                <th className="py-2 px-1 text-left w-12">Qty</th>
                <th className="py-2 px-1 text-left w-20">Supplier</th>
                <th className="py-2 px-1 text-left w-20">Mfr</th>
                <th className="py-2 px-1 text-left w-20">Equip</th>
                <th className="py-2 px-1 text-left w-28">Model</th>
                <th className="py-2 px-1 text-right w-24">List</th>
                <th className="py-2 px-1 text-right w-14">$ ↑</th>
                <th className="py-2 px-1 text-right w-14">Multi</th>
                <th className="py-2 px-1 text-right w-14">Pay</th>
                <th className="py-2 px-1 text-right w-24 bg-svl-gray/50">Mfg Net</th>
                <th className="py-2 px-1 text-right w-20 bg-svl-gray/50">Mfg Comm</th>
                <th className="py-2 px-1 text-right w-20">Freight</th>
                <th className="py-2 px-1 text-right w-24 bg-svl-gray/50">Total Net</th>
                <th className="py-2 px-1 text-right w-14">MU</th>
                <th className="py-2 px-1 text-right w-24 bg-svl-green-light">Comm</th>
                <th className="py-2 px-1 text-right w-28 bg-svl-blue-light">Bid Price</th>
                <th className="py-2 px-1 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {primaryLines.map((primary, primaryIdx) => {
                const primaryNumber = primaryIdx + 1;
                const subLines = getSubLines(primary.id);
                const isCollapsed = collapsedPrimaries[primary.id];
                const hasSubLines = subLines.length > 0;

                return (
                  <>
                    {/* Primary Line Row */}
                    <LineItemRow
                      key={primary.id}
                      item={primary}
                      lineNumber={`${packageNumber}.${primaryNumber}`}
                      isPrimary={true}
                      isCollapsed={isCollapsed}
                      hasSubLines={hasSubLines}
                      onToggle={() => togglePrimary(primary.id)}
                      onUpdate={(field, value) => onUpdateLineItem(primary.id, field, value)}
                      onDelete={() => onDeleteLineItem(primary.id)}
                      onAddSubLine={() => onAddSubLine(primary.id)}
                      onOpenDescription={() => onOpenDescription(primary)}
                      hasDescription={hasDescription(primary)}
                      onMove={onMoveLineItem}
                      data={data}
                    />
                    {/* Sub-line Rows */}
                    {!isCollapsed && subLines.map((subLine, subIdx) => (
                      <LineItemRow
                        key={subLine.id}
                        item={subLine}
                        lineNumber={`${packageNumber}.${primaryNumber}.${subIdx + 1}`}
                        isPrimary={false}
                        onUpdate={(field, value) => onUpdateLineItem(subLine.id, field, value)}
                        onDelete={() => onDeleteLineItem(subLine.id)}
                        onMove={onMoveLineItem}
                        data={data}
                      />
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Primary Line Button */}
        <div className="p-3 border-t border-svl-gray">
          <button
            onClick={() => onAddPrimaryLine(pkg.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-svl-blue-bright hover:bg-svl-blue-light rounded-lg border border-svl-blue-bright"
          >
            <Plus size={16} />
            Add Primary Line
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotePackage;
