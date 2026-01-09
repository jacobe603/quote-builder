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
      <div className="bg-svl-navy text-white px-5 py-4 rounded-t-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-svl-blue-bright text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center">
                {packageNumber}
              </span>
              <Package size={20} className="text-svl-gray" />
              {editingName ? (
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                  className="bg-svl-blue/50 border border-svl-blue rounded px-2 py-1 text-lg font-bold w-64"
                />
              ) : (
                <h2
                  className="text-xl font-bold cursor-pointer hover:bg-svl-blue/30 px-2 py-1 rounded"
                  onClick={() => setEditingName(true)}
                  title="Click to edit name"
                >
                  {pkg.name}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm bg-svl-blue/30 px-3 py-1 rounded">
              <span className="text-svl-gray">Default MU:</span>
              <input
                type="text"
                value={pkg.defaultMU}
                onChange={(e) => onUpdatePackageMU(pkg.id, parseFloat(e.target.value) || 1)}
                className="w-16 px-2 py-0.5 text-sm bg-svl-blue/50 border border-svl-blue rounded text-center text-white"
              />
            </div>
            <button
              onClick={() => onDeletePackage(pkg.id)}
              className="p-1.5 hover:bg-svl-red/30 rounded text-svl-red-light"
              title="Delete Quote Package"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <div className="text-xs text-svl-gray uppercase tracking-wide">Total Net</div>
              <div className="text-lg font-semibold">{formatCurrency(packageTotals.totalNet)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-svl-gray uppercase tracking-wide">Commission</div>
              <div className="text-lg font-semibold text-svl-green">{formatCurrency(packageTotals.salesComm)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-svl-gray uppercase tracking-wide">Bid Price</div>
              <div className="text-xl font-bold text-svl-blue-bright">{formatCurrency(packageTotals.bidPrice)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Content */}
      <div className="bg-white border-x border-b border-svl-gray rounded-b-xl p-4">
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
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-svl-gray-dark hover:bg-svl-gray-light rounded-lg border-2 border-dashed border-svl-gray w-full justify-center"
        >
          <Layers size={16} />
          Add Equipment Group
        </button>
      </div>
    </div>
  );
};

export default QuotePackage;
