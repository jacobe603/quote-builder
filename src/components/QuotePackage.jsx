import { useState } from 'react';
import { Package, Layers, Trash2 } from 'lucide-react';
import EquipmentGroup from './EquipmentGroup';
import { calculateGroupTotals } from '../utils/calculations';
import { formatCurrency } from '../utils/helpers';

/**
 * Quote Package Component
 * Top-level container for equipment groups
 */
const QuotePackage = ({
  pkg,
  packageNumber,
  groups,
  lineItems,
  onUpdateLineItem,
  onDeleteLineItem,
  onAddLineItem,
  onAddSubItem,
  onMoveLineItem,
  onUpdatePackageMU,
  onUpdatePackage,
  onDeletePackage,
  onAddEquipmentGroup,
  onDeleteEquipmentGroup,
  onUpdateEquipmentGroup,
  onOpenDescription,
  data
}) => {
  const [editingName, setEditingName] = useState(false);
  const [packageName, setPackageName] = useState(pkg.name);

  // Calculate package totals
  const packageTotals = calculateGroupTotals(lineItems);

  const handleNameSave = () => {
    setEditingName(false);
    onUpdatePackage(pkg.id, 'name', packageName);
  };

  return (
    <div className="mb-8">
      {/* Package Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-4 rounded-t-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-500 text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center">
                {packageNumber}
              </span>
              <Package size={20} className="text-slate-400" />
              {editingName ? (
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                  className="bg-slate-700 border border-slate-500 rounded px-2 py-1 text-lg font-bold w-64"
                />
              ) : (
                <h2
                  className="text-xl font-bold cursor-pointer hover:bg-slate-700 px-2 py-1 rounded"
                  onClick={() => setEditingName(true)}
                  title="Click to edit name"
                >
                  {pkg.name}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm bg-slate-700 px-3 py-1 rounded">
              <span className="text-gray-400">Default MU:</span>
              <input
                type="text"
                value={pkg.defaultMU}
                onChange={(e) => onUpdatePackageMU(pkg.id, parseFloat(e.target.value) || 1)}
                className="w-16 px-2 py-0.5 text-sm bg-slate-600 border border-slate-500 rounded text-center text-white"
              />
            </div>
            <button
              onClick={() => onDeletePackage(pkg.id)}
              className="p-1.5 hover:bg-red-500/30 rounded text-red-400"
              title="Delete Quote Package"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Total Net</div>
              <div className="text-lg font-semibold">{formatCurrency(packageTotals.totalNet)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Commission</div>
              <div className="text-lg font-semibold text-green-400">{formatCurrency(packageTotals.salesComm)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Bid Price</div>
              <div className="text-xl font-bold text-blue-400">{formatCurrency(packageTotals.bidPrice)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Content */}
      <div className="bg-gray-50 border-x border-b border-gray-200 rounded-b-xl p-4">
        {groups.map((group) => {
          const groupLineItems = lineItems.filter(li => li.equipmentGroupId === group.id);
          return (
            <EquipmentGroup
              key={group.id}
              group={group}
              lineItems={groupLineItems}
              packageNumber={packageNumber}
              onUpdateLineItem={onUpdateLineItem}
              onDeleteLineItem={onDeleteLineItem}
              onAddLineItem={onAddLineItem}
              onAddSubItem={onAddSubItem}
              onMoveLineItem={onMoveLineItem}
              onDeleteGroup={onDeleteEquipmentGroup}
              onUpdateGroup={onUpdateEquipmentGroup}
              onOpenDescription={onOpenDescription}
              data={data}
            />
          );
        })}

        {/* Add Equipment Group Button */}
        <button
          onClick={() => onAddEquipmentGroup(pkg.id)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg border-2 border-dashed border-slate-300 w-full justify-center"
        >
          <Layers size={16} />
          Add Equipment Group
        </button>
      </div>
    </div>
  );
};

export default QuotePackage;
