import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Layers, FileText } from 'lucide-react';
import LineItemRow from './LineItemRow';
import { calculateGroupTotals } from '../utils/calculations';
import { formatCurrency } from '../utils/helpers';

/**
 * Equipment Group Component
 * Contains a group of line items within a package
 */
const EquipmentGroup = ({
  group,
  lineItems,
  packageNumber,
  onUpdateLineItem,
  onDeleteLineItem,
  onAddLineItem,
  onAddSubItem,
  onMoveLineItem,
  onDeleteGroup,
  onUpdateGroup,
  onOpenDescription,
  data
}) => {
  const [expanded, setExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [editingName, setEditingName] = useState(false);
  const [groupName, setGroupName] = useState(group.name);

  const parentItems = lineItems
    .filter(li => li.parentLineItemId === null)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const getSubItems = (parentId) => lineItems
    .filter(li => li.parentLineItemId === parentId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Calculate group totals
  const groupTotals = calculateGroupTotals(lineItems);

  const handleNameSave = () => {
    setEditingName(false);
    onUpdateGroup(group.id, 'name', groupName);
  };

  // Check if description has content
  const hasDescription = group.equipmentHeading || group.equipmentBullets || group.notes;

  // Generate line numbers
  let lineCounter = 0;

  return (
    <div className="mb-6 rounded-lg overflow-hidden shadow-sm border border-svl-gray">
      {/* Group Header */}
      <div className="flex items-center justify-between bg-svl-blue text-white px-4 py-2.5">
        <div className="flex items-center gap-2 flex-1">
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 hover:bg-svl-navy rounded">
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          <Layers size={16} className="text-svl-blue-light" />
          {editingName ? (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              autoFocus
              className="bg-svl-navy border border-svl-blue-bright rounded px-2 py-0.5 text-sm flex-1 max-w-md"
            />
          ) : (
            <span
              className="font-medium cursor-pointer hover:bg-svl-navy px-2 py-0.5 rounded"
              onClick={() => setEditingName(true)}
              title="Click to edit name"
            >
              {group.name}
            </span>
          )}
          {/* Description Button */}
          <button
            onClick={() => onOpenDescription(group)}
            className={`p-1.5 rounded flex items-center gap-1 text-xs ${
              hasDescription
                ? 'bg-svl-blue-bright/30 text-svl-blue-light hover:bg-svl-blue-bright/50'
                : 'hover:bg-svl-navy text-svl-blue-light'
            }`}
            title="Edit Description"
          >
            <FileText size={14} />
            {hasDescription && <span>Description</span>}
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-6 text-sm">
            <span className="text-svl-blue-light">Net: <span className="text-white">{formatCurrency(groupTotals.totalNet)}</span></span>
            <span className="text-svl-blue-light">Comm: <span className="text-svl-green-light">{formatCurrency(groupTotals.salesComm)}</span></span>
            <span className="text-svl-blue-light">Bid: <span className="text-white font-semibold">{formatCurrency(groupTotals.bidPrice)}</span></span>
          </div>
          <button
            onClick={() => onDeleteGroup(group.id)}
            className="p-1 hover:bg-svl-red/30 rounded text-svl-red-light"
            title="Delete Equipment Group"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-svl-gray-light text-xs text-svl-gray-dark border-b-2 border-svl-gray">
                <th className="py-2 px-1 text-center w-16 bg-svl-gray border-r border-svl-gray">#</th>
                <th className="py-2 px-1 text-left w-8"></th>
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
                <th className="py-2 px-1 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parentItems.map((item) => {
                lineCounter++;
                const currentLineNum = lineCounter;
                const subItems = getSubItems(item.id);
                const hasChildren = subItems.length > 0;
                const isItemExpanded = expandedItems[item.id] !== false;
                const lineNumber = `${packageNumber}.${currentLineNum}`;

                return (
                  <React.Fragment key={item.id}>
                    <LineItemRow
                      item={item}
                      lineNumber={lineNumber}
                      isSubItem={false}
                      hasChildren={hasChildren}
                      isExpanded={isItemExpanded}
                      onToggle={() => toggleItem(item.id)}
                      onUpdate={(field, value) => onUpdateLineItem(item.id, field, value)}
                      onDelete={() => onDeleteLineItem(item.id)}
                      onAddSubItem={() => onAddSubItem(item.id)}
                      onMove={onMoveLineItem}
                      data={data}
                    />
                    {hasChildren && isItemExpanded && subItems.map((subItem, subIdx) => (
                      <LineItemRow
                        key={subItem.id}
                        item={subItem}
                        lineNumber={`${lineNumber}.${subIdx + 1}`}
                        isSubItem={true}
                        hasChildren={false}
                        isExpanded={false}
                        onToggle={() => {}}
                        onUpdate={(field, value) => onUpdateLineItem(subItem.id, field, value)}
                        onDelete={() => onDeleteLineItem(subItem.id)}
                        onAddSubItem={() => {}}
                        onMove={onMoveLineItem}
                        data={data}
                      />
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <div className="p-2 bg-svl-gray-light border-t border-svl-gray">
            <button
              onClick={() => onAddLineItem(group.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-svl-blue-bright hover:bg-svl-blue-light rounded border border-svl-blue-bright"
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentGroup;
