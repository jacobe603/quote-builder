import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, CornerDownRight, Package, Layers, X, FileText } from 'lucide-react';

// Navigation Context for managing active cell
const NavigationContext = createContext();

const useNavigation = () => useContext(NavigationContext);

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${(value * 100).toFixed(1)}%`;
};

const calculateLineItem = (item) => {
  const qty = item.qty || 0;
  const listPrice = item.listPrice || 0;
  const multiplier = item.multiplier || 0;
  const priceIncrease = item.priceIncrease || 0;
  const pay = item.pay || 0;
  const freight = item.freight || 0;
  const markup = item.markup || 1;

  const mfgNet = qty * listPrice * multiplier * (1 + priceIncrease);
  const mfgComm = mfgNet * pay;
  const totalNet = mfgNet + freight;
  const bidPrice = totalNet * markup;
  const salesComm = (bidPrice - totalNet) + mfgComm;

  return {
    mfgNet: Math.round(mfgNet * 100) / 100,
    mfgComm: Math.round(mfgComm * 100) / 100,
    totalNet: Math.round(totalNet * 100) / 100,
    bidPrice: Math.round(bidPrice * 100) / 100,
    salesComm: Math.round(salesComm * 100) / 100
  };
};

// Parse line number like "1.2.3" into components
const parseLineNumber = (lineNum) => {
  const parts = lineNum.split('.').map(p => parseInt(p, 10));
  return {
    packageNum: parts[0] || null,
    lineNum: parts[1] || null,
    subLineNum: parts[2] || null,
    depth: parts.filter(p => !isNaN(p)).length
  };
};

// Column definitions for navigation
const EDITABLE_COLUMNS = ['lineNum', 'qty', 'supplier', 'manufacturer', 'equipment', 'model', 'list', 'priceInc', 'multi', 'pay', 'freight', 'markup'];

// Sample data
const initialData = {
  suppliers: [
    { id: 'sup1', name: 'SVL' },
    { id: 'sup2', name: 'ControlCo' }
  ],
  manufacturers: [
    { id: 'mfr1', name: 'AAON' },
    { id: 'mfr2', name: 'Tridium' },
    { id: 'mfr3', name: 'Daikin' }
  ],
  equipmentTypes: [
    { id: 'et1', name: 'RTU' },
    { id: 'et2', name: 'Accessory' },
    { id: 'et3', name: 'Curb' },
    { id: 'et4', name: 'Controls' },
    { id: 'et5', name: 'Service' }
  ],
  quotePackages: [
    { id: 'pkg1', name: 'Rooftop Units', defaultMU: 1.35, sortOrder: 1 }
  ],
  equipmentGroups: [
    { 
      id: 'grp1', 
      packageId: 'pkg1', 
      name: 'RTU - AAON RN Series', 
      sortOrder: 1,
      equipmentHeading: '',
      equipmentBullets: '',
      notes: ''
    }
  ],
  lineItems: [
    {
      id: 'li1', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 3, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et1',
      model: 'RN-030', listPrice: 18000, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0.05, freight: 1200, markup: 1.35, shorthand: '(3) RN-030', sortOrder: 1
    },
    {
      id: 'li2', equipmentGroupId: 'grp1', parentLineItemId: 'li1',
      qty: 3, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et2',
      model: 'Economizer', listPrice: 1100, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0, freight: 0, markup: 1.35, shorthand: 'Economizers', sortOrder: 1
    },
    {
      id: 'li3', equipmentGroupId: 'grp1', parentLineItemId: 'li1',
      qty: 3, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et2',
      model: 'Hail Guards', listPrice: 600, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0, freight: 0, markup: 1.35, shorthand: 'Hail Guards', sortOrder: 2
    },
    {
      id: 'li4', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 2, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et1',
      model: 'RN-040', listPrice: 22000, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0.05, freight: 800, markup: 1.35, shorthand: '(2) RN-040', sortOrder: 2
    },
    {
      id: 'li5', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 5, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et3',
      model: 'RN-Curb', listPrice: 1200, priceIncrease: 0.03, multiplier: 0.42,
      pay: 0, freight: 400, markup: 1.35, shorthand: 'Roof Curbs', sortOrder: 3
    },
    {
      id: 'li6', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 1, supplierId: 'sup2', manufacturerId: 'mfr2', equipmentTypeId: 'et4',
      model: 'JACE-8000', listPrice: 4500, priceIncrease: 0, multiplier: 0.65,
      pay: 0, freight: 0, markup: 1.40, shorthand: 'Controls', sortOrder: 4
    },
    {
      id: 'li7', equipmentGroupId: 'grp1', parentLineItemId: null,
      qty: 1, supplierId: 'sup1', manufacturerId: 'mfr1', equipmentTypeId: 'et5',
      model: 'Startup', listPrice: 2100, priceIncrease: 0, multiplier: 1.0,
      pay: 0, freight: 0, markup: 1.35, shorthand: 'Startup', sortOrder: 5
    }
  ]
};

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-4 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Equipment Group Description Modal
const EquipmentGroupDescriptionModal = ({ isOpen, onClose, group, onSave }) => {
  const [equipmentHeading, setEquipmentHeading] = useState(group?.equipmentHeading || '');
  const [equipmentBullets, setEquipmentBullets] = useState(group?.equipmentBullets || '');
  const [notes, setNotes] = useState(group?.notes || '');

  // Reset form when group changes
  useEffect(() => {
    if (group) {
      setEquipmentHeading(group.equipmentHeading || '');
      setEquipmentBullets(group.equipmentBullets || '');
      setNotes(group.notes || '');
    }
  }, [group]);

  const handleSave = () => {
    onSave({
      equipmentHeading,
      equipmentBullets,
      notes
    });
    onClose();
  };

  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Description: ${group.name}`} size="lg">
      <div className="space-y-4">
        {/* Equipment Heading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipment Heading
          </label>
          <input
            type="text"
            value={equipmentHeading}
            onChange={(e) => setEquipmentHeading(e.target.value)}
            placeholder="e.g., AAON RN Series Rooftop Units"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Single line heading for the equipment section</p>
        </div>

        {/* Equipment Bullets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipment Bullets
          </label>
          <textarea
            value={equipmentBullets}
            onChange={(e) => setEquipmentBullets(e.target.value)}
            placeholder="• High-efficiency scroll compressors&#10;• Variable speed ECM motors&#10;• Factory-installed economizer&#10;• BACnet-compatible controls"
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Features and specifications (approx. 20 lines)</p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes, special conditions, installation requirements..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Internal notes (approx. 10 lines)</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Save Description
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Text Input Cell Component
const TextCell = ({ cellId, value, onChange, type = 'text', className = '' }) => {
  const { activeCell, setActiveCell, isEditing, setIsEditing, registerCell } = useNavigation();
  const cellRef = useRef(null);
  const inputRef = useRef(null);
  const [editValue, setEditValue] = useState(value);
  
  const isActive = activeCell === cellId;
  const isCurrentlyEditing = isActive && isEditing;

  useEffect(() => {
    registerCell(cellId);
  }, [cellId, registerCell]);

  useEffect(() => {
    if (isActive && !isEditing && cellRef.current) {
      cellRef.current.focus();
    }
  }, [isActive, isEditing]);

  useEffect(() => {
    if (isCurrentlyEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCurrentlyEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const getEditValue = () => {
    if (type === 'percent') {
      return (value * 100).toFixed(1);
    }
    return value;
  };

  const handleKeyDown = (e) => {
    if (!isActive) return;

    if (!isEditing) {
      if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault();
        setEditValue(getEditValue());
        setIsEditing(true);
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveValue();
        setIsEditing(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditValue(value);
        setIsEditing(false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        saveValue();
        setIsEditing(false);
      }
    }
  };

  const saveValue = () => {
    let newValue = editValue;
    if (type === 'number' || type === 'currency') {
      newValue = parseFloat(editValue) || 0;
    } else if (type === 'percent') {
      newValue = parseFloat(editValue) / 100 || 0;
    } else if (type === 'multiplier') {
      newValue = parseFloat(editValue) || 0;
    }
    onChange(newValue);
  };

  const displayValue = () => {
    if (type === 'currency') return formatCurrency(value);
    if (type === 'percent') return formatPercent(value);
    if (type === 'multiplier') return value?.toFixed(2) || '0.00';
    return value;
  };

  const handleClick = () => {
    setActiveCell(cellId);
  };

  const handleDoubleClick = () => {
    setActiveCell(cellId);
    setEditValue(getEditValue());
    setIsEditing(true);
  };

  const baseClasses = `px-1 py-0.5 text-xs outline-none ${className}`;
  const activeClasses = isActive ? 'ring-2 ring-blue-500 ring-inset' : '';
  const hoverClasses = !isActive ? 'hover:bg-blue-50' : '';

  if (isCurrentlyEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          saveValue();
          setIsEditing(false);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full ${baseClasses} border border-blue-400 rounded`}
      />
    );
  }

  return (
    <div
      ref={cellRef}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onFocus={() => setActiveCell(cellId)}
      className={`${baseClasses} ${activeClasses} ${hoverClasses} cursor-pointer rounded truncate`}
    >
      {displayValue()}
    </div>
  );
};

// Dropdown Cell Component
const DropdownCell = ({ cellId, value, onChange, options, className = '' }) => {
  const { activeCell, setActiveCell, isEditing, setIsEditing, registerCell } = useNavigation();
  const cellRef = useRef(null);
  const selectRef = useRef(null);
  
  const isActive = activeCell === cellId;
  const isCurrentlyEditing = isActive && isEditing;

  useEffect(() => {
    registerCell(cellId);
  }, [cellId, registerCell]);

  useEffect(() => {
    if (isActive && !isEditing && cellRef.current) {
      cellRef.current.focus();
    }
  }, [isActive, isEditing]);

  useEffect(() => {
    if (isCurrentlyEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isCurrentlyEditing]);

  const handleKeyDown = (e) => {
    if (!isActive) return;

    if (!isEditing) {
      if (e.key === 'Enter' || e.key === 'F2' || e.key === ' ') {
        e.preventDefault();
        setIsEditing(true);
      }
    } else {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsEditing(false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setIsEditing(false);
      }
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    setIsEditing(false);
  };

  const displayValue = () => {
    const opt = options.find(o => o.id === value);
    return opt ? opt.name : '--';
  };

  const handleClick = () => {
    setActiveCell(cellId);
  };

  const handleDoubleClick = () => {
    setActiveCell(cellId);
    setIsEditing(true);
  };

  const baseClasses = `px-1 py-0.5 text-xs outline-none ${className}`;
  const activeClasses = isActive ? 'ring-2 ring-blue-500 ring-inset' : '';
  const hoverClasses = !isActive ? 'hover:bg-blue-50' : '';

  if (isCurrentlyEditing) {
    return (
      <select
        ref={selectRef}
        value={value || ''}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        onKeyDown={handleKeyDown}
        className={`w-full ${baseClasses} border border-blue-400 rounded bg-white cursor-pointer`}
      >
        <option value="">--</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
    );
  }

  return (
    <div
      ref={cellRef}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onFocus={() => setActiveCell(cellId)}
      className={`${baseClasses} ${activeClasses} ${hoverClasses} cursor-pointer rounded truncate`}
    >
      {displayValue()}
    </div>
  );
};

// Line Number Cell - Special cell for line numbers
const LineNumberCell = ({ cellId, lineNumber, onMove, isSubItem }) => {
  const { activeCell, setActiveCell, isEditing, setIsEditing, registerCell } = useNavigation();
  const cellRef = useRef(null);
  const inputRef = useRef(null);
  const [editValue, setEditValue] = useState(lineNumber);
  
  const isActive = activeCell === cellId;
  const isCurrentlyEditing = isActive && isEditing;

  useEffect(() => {
    registerCell(cellId);
  }, [cellId, registerCell]);

  useEffect(() => {
    if (isActive && !isEditing && cellRef.current) {
      cellRef.current.focus();
    }
  }, [isActive, isEditing]);

  useEffect(() => {
    if (isCurrentlyEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCurrentlyEditing]);

  useEffect(() => {
    setEditValue(lineNumber);
  }, [lineNumber]);

  const handleKeyDown = (e) => {
    if (!isActive) return;

    if (!isEditing) {
      if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault();
        setEditValue(lineNumber);
        setIsEditing(true);
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (editValue !== lineNumber) {
          onMove(editValue);
        }
        setIsEditing(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditValue(lineNumber);
        setIsEditing(false);
      }
    }
  };

  const handleClick = () => {
    setActiveCell(cellId);
  };

  const handleDoubleClick = () => {
    setActiveCell(cellId);
    setEditValue(lineNumber);
    setIsEditing(true);
  };

  if (isCurrentlyEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          if (editValue !== lineNumber) {
            onMove(editValue);
          }
          setIsEditing(false);
        }}
        onKeyDown={handleKeyDown}
        className="w-14 px-1 py-0.5 text-xs font-mono border border-blue-400 rounded outline-none text-center"
      />
    );
  }

  return (
    <div
      ref={cellRef}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onFocus={() => setActiveCell(cellId)}
      className={`px-1 py-0.5 text-xs font-mono cursor-pointer rounded text-center font-semibold outline-none
        ${isActive ? 'ring-2 ring-blue-500 ring-inset' : 'hover:bg-blue-100'}
        ${isSubItem ? 'text-amber-700' : 'text-slate-700'}`}
      title="Click to edit and move item"
    >
      {lineNumber}
    </div>
  );
};

// Line Item Row Component
const LineItemRow = ({ item, lineNumber, rowIndex, isSubItem, hasChildren, isExpanded, onToggle, onUpdate, onDelete, onAddSubItem, onMove, data }) => {
  const calc = calculateLineItem(item);

  const rowStyles = isSubItem 
    ? 'bg-amber-50 border-l-4 border-l-amber-400' 
    : 'bg-white hover:bg-gray-50';

  const cellPrefix = `${item.id}`;

  return (
    <tr className={`border-b border-gray-200 ${rowStyles}`}>
      {/* Line Number */}
      <td className="py-1.5 px-1 w-16 bg-slate-50 border-r border-gray-200">
        <LineNumberCell 
          cellId={`${cellPrefix}-lineNum`}
          lineNumber={lineNumber} 
          onMove={(newNum) => onMove(item.id, lineNumber, newNum)}
          isSubItem={isSubItem}
        />
      </td>
      
      {/* Expand/Collapse */}
      <td className="py-1.5 px-1 w-8">
        {!isSubItem && hasChildren ? (
          <button onClick={onToggle} className="p-0.5 hover:bg-gray-200 rounded">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : isSubItem ? (
          <CornerDownRight size={12} className="text-amber-400 ml-1" />
        ) : null}
      </td>

      <td className="py-1.5 w-12">
        <TextCell cellId={`${cellPrefix}-qty`} value={item.qty} onChange={(v) => onUpdate('qty', v)} type="number" />
      </td>
      <td className="py-1.5 w-20">
        <DropdownCell cellId={`${cellPrefix}-supplier`} value={item.supplierId} onChange={(v) => onUpdate('supplierId', v)} options={data.suppliers} />
      </td>
      <td className="py-1.5 w-20">
        <DropdownCell cellId={`${cellPrefix}-manufacturer`} value={item.manufacturerId} onChange={(v) => onUpdate('manufacturerId', v)} options={data.manufacturers} />
      </td>
      <td className="py-1.5 w-20">
        <DropdownCell cellId={`${cellPrefix}-equipment`} value={item.equipmentTypeId} onChange={(v) => onUpdate('equipmentTypeId', v)} options={data.equipmentTypes} />
      </td>
      <td className="py-1.5 w-28">
        <TextCell cellId={`${cellPrefix}-model`} value={item.model} onChange={(v) => onUpdate('model', v)} />
      </td>
      <td className="py-1.5 w-24 text-right">
        <TextCell cellId={`${cellPrefix}-list`} value={item.listPrice} onChange={(v) => onUpdate('listPrice', v)} type="currency" className="text-right" />
      </td>
      <td className="py-1.5 w-14 text-right">
        <TextCell cellId={`${cellPrefix}-priceInc`} value={item.priceIncrease} onChange={(v) => onUpdate('priceIncrease', v)} type="percent" className="text-right" />
      </td>
      <td className="py-1.5 w-14 text-right">
        <TextCell cellId={`${cellPrefix}-multi`} value={item.multiplier} onChange={(v) => onUpdate('multiplier', v)} type="multiplier" className="text-right" />
      </td>
      <td className="py-1.5 w-14 text-right">
        <TextCell cellId={`${cellPrefix}-pay`} value={item.pay} onChange={(v) => onUpdate('pay', v)} type="percent" className="text-right" />
      </td>
      <td className={`py-1.5 w-24 text-right text-xs ${isSubItem ? 'bg-amber-100/50' : 'bg-gray-100'}`}>
        {formatCurrency(calc.mfgNet)}
      </td>
      <td className={`py-1.5 w-20 text-right text-xs ${isSubItem ? 'bg-amber-100/50' : 'bg-gray-100'}`}>
        {formatCurrency(calc.mfgComm)}
      </td>
      <td className="py-1.5 w-20 text-right">
        <TextCell cellId={`${cellPrefix}-freight`} value={item.freight} onChange={(v) => onUpdate('freight', v)} type="currency" className="text-right" />
      </td>
      <td className={`py-1.5 w-24 text-right text-xs ${isSubItem ? 'bg-amber-100/50' : 'bg-gray-100'}`}>
        {formatCurrency(calc.totalNet)}
      </td>
      <td className="py-1.5 w-14 text-right">
        <TextCell cellId={`${cellPrefix}-markup`} value={item.markup} onChange={(v) => onUpdate('markup', v)} type="multiplier" className="text-right" />
      </td>
      <td className={`py-1.5 w-24 text-right text-xs font-medium ${isSubItem ? 'bg-green-100/50 text-green-700' : 'bg-green-100 text-green-700'}`}>
        {formatCurrency(calc.salesComm)}
      </td>
      <td className={`py-1.5 w-28 text-right text-xs font-semibold ${isSubItem ? 'bg-blue-100/50 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
        {formatCurrency(calc.bidPrice)}
      </td>
      <td className="py-1.5 w-16 text-center">
        <div className="flex justify-center gap-0.5">
          {!isSubItem && (
            <button onClick={onAddSubItem} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Add Sub Item">
              <Plus size={12} />
            </button>
          )}
          <button onClick={onDelete} className="p-1 hover:bg-red-100 rounded text-red-500" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Equipment Group Component
const EquipmentGroup = ({ group, lineItems, packageNumber, onUpdateLineItem, onDeleteLineItem, onAddLineItem, onAddSubItem, onMoveLineItem, onDeleteGroup, onUpdateGroup, onOpenDescription, data }) => {
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
  const groupTotals = lineItems.reduce((acc, item) => {
    const calc = calculateLineItem(item);
    return {
      totalNet: acc.totalNet + calc.totalNet,
      bidPrice: acc.bidPrice + calc.bidPrice,
      salesComm: acc.salesComm + calc.salesComm
    };
  }, { totalNet: 0, bidPrice: 0, salesComm: 0 });

  const handleNameSave = () => {
    setEditingName(false);
    onUpdateGroup(group.id, 'name', groupName);
  };

  // Check if description has content
  const hasDescription = group.equipmentHeading || group.equipmentBullets || group.notes;

  // Generate line numbers and row indices
  let lineCounter = 0;
  let rowIndex = 0;

  return (
    <div className="mb-6 rounded-lg overflow-hidden shadow-sm border border-gray-200">
      {/* Group Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-2.5">
        <div className="flex items-center gap-2 flex-1">
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 hover:bg-slate-500 rounded">
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          <Layers size={16} className="text-slate-400" />
          {editingName ? (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              autoFocus
              className="bg-slate-600 border border-slate-400 rounded px-2 py-0.5 text-sm flex-1 max-w-md"
            />
          ) : (
            <span 
              className="font-medium cursor-pointer hover:bg-slate-600 px-2 py-0.5 rounded"
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
                ? 'bg-blue-500/30 text-blue-200 hover:bg-blue-500/50' 
                : 'hover:bg-slate-500 text-slate-300'
            }`}
            title="Edit Description"
          >
            <FileText size={14} />
            {hasDescription && <span>Description</span>}
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-6 text-sm">
            <span className="text-gray-300">Net: <span className="text-white">{formatCurrency(groupTotals.totalNet)}</span></span>
            <span className="text-gray-300">Comm: <span className="text-green-300">{formatCurrency(groupTotals.salesComm)}</span></span>
            <span className="text-gray-300">Bid: <span className="text-blue-300 font-semibold">{formatCurrency(groupTotals.bidPrice)}</span></span>
          </div>
          <button 
            onClick={() => onDeleteGroup(group.id)}
            className="p-1 hover:bg-red-500/30 rounded text-red-300"
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
              <tr className="bg-gray-100 text-xs text-gray-600 border-b-2 border-gray-300">
                <th className="py-2 px-1 text-center w-16 bg-slate-200 border-r border-gray-300">#</th>
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
                <th className="py-2 px-1 text-right w-24 bg-gray-200">Mfg Net</th>
                <th className="py-2 px-1 text-right w-20 bg-gray-200">Mfg Comm</th>
                <th className="py-2 px-1 text-right w-20">Freight</th>
                <th className="py-2 px-1 text-right w-24 bg-gray-200">Total Net</th>
                <th className="py-2 px-1 text-right w-14">MU</th>
                <th className="py-2 px-1 text-right w-24 bg-green-200">Comm</th>
                <th className="py-2 px-1 text-right w-28 bg-blue-200">Bid Price</th>
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
                const currentRowIndex = rowIndex++;

                return (
                  <React.Fragment key={item.id}>
                    <LineItemRow
                      item={item}
                      lineNumber={lineNumber}
                      rowIndex={currentRowIndex}
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
                    {hasChildren && isItemExpanded && subItems.map((subItem, subIdx) => {
                      const subRowIndex = rowIndex++;
                      return (
                        <LineItemRow
                          key={subItem.id}
                          item={subItem}
                          lineNumber={`${lineNumber}.${subIdx + 1}`}
                          rowIndex={subRowIndex}
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
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <div className="p-2 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => onAddLineItem(group.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Quote Package Component
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
  const packageTotals = lineItems.reduce((acc, item) => {
    const calc = calculateLineItem(item);
    return {
      totalNet: acc.totalNet + calc.totalNet,
      bidPrice: acc.bidPrice + calc.bidPrice,
      salesComm: acc.salesComm + calc.salesComm
    };
  }, { totalNet: 0, bidPrice: 0, salesComm: 0 });

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

// Legend Component
const Legend = () => (
  <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
          <span>Line Item</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-50 border-l-4 border-l-amber-400 border border-gray-300 rounded"></div>
          <span>Sub Line Item</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Calculated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>Commission</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span>Bid Price</span>
        </div>
      </div>
      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
        💡 <b>Arrow keys</b> to navigate • <b>Enter/F2</b> to edit • <b>Esc</b> to cancel • <b>Space</b> for dropdowns
      </div>
    </div>
  </div>
);

// New Package Modal Component
const NewPackageModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [defaultMU, setDefaultMU] = useState('1.35');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate({
        name: name.trim(),
        defaultMU: parseFloat(defaultMU) || 1.35
      });
      setName('');
      setDefaultMU('1.35');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Quote Package">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Rooftop Units"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Markup</label>
          <input
            type="text"
            value={defaultMU}
            onChange={(e) => setDefaultMU(e.target.value)}
            placeholder="1.35"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Package
          </button>
        </div>
      </div>
    </Modal>
  );
};

// New Equipment Group Modal Component
const NewEquipmentGroupModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate({ name: name.trim() });
      setName('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Equipment Group">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., RTU - AAON RN Series"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Navigation Provider Component
const NavigationProvider = ({ children }) => {
  const [activeCell, setActiveCell] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cellRegistry, setCellRegistry] = useState([]);

  const registerCell = useCallback((cellId) => {
    setCellRegistry(prev => {
      if (prev.includes(cellId)) return prev;
      return [...prev, cellId];
    });
  }, []);

  // Handle global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeCell || isEditing) return;
      
      // Parse current cell ID to get item and column
      const parts = activeCell.split('-');
      const itemId = parts[0];
      const column = parts[1];
      const currentColIndex = EDITABLE_COLUMNS.indexOf(column);
      
      // Get all unique item IDs maintaining order
      const allItemIds = [...new Set(cellRegistry.map(c => c.split('-')[0]))];
      const currentItemIndex = allItemIds.indexOf(itemId);

      let newCell = null;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (currentColIndex < EDITABLE_COLUMNS.length - 1) {
            newCell = `${itemId}-${EDITABLE_COLUMNS[currentColIndex + 1]}`;
          } else if (currentItemIndex < allItemIds.length - 1) {
            newCell = `${allItemIds[currentItemIndex + 1]}-${EDITABLE_COLUMNS[0]}`;
          }
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          if (currentColIndex > 0) {
            newCell = `${itemId}-${EDITABLE_COLUMNS[currentColIndex - 1]}`;
          } else if (currentItemIndex > 0) {
            newCell = `${allItemIds[currentItemIndex - 1]}-${EDITABLE_COLUMNS[EDITABLE_COLUMNS.length - 1]}`;
          }
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (currentItemIndex < allItemIds.length - 1) {
            newCell = `${allItemIds[currentItemIndex + 1]}-${column}`;
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (currentItemIndex > 0) {
            newCell = `${allItemIds[currentItemIndex - 1]}-${column}`;
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            if (currentColIndex > 0) {
              newCell = `${itemId}-${EDITABLE_COLUMNS[currentColIndex - 1]}`;
            } else if (currentItemIndex > 0) {
              newCell = `${allItemIds[currentItemIndex - 1]}-${EDITABLE_COLUMNS[EDITABLE_COLUMNS.length - 1]}`;
            }
          } else {
            if (currentColIndex < EDITABLE_COLUMNS.length - 1) {
              newCell = `${itemId}-${EDITABLE_COLUMNS[currentColIndex + 1]}`;
            } else if (currentItemIndex < allItemIds.length - 1) {
              newCell = `${allItemIds[currentItemIndex + 1]}-${EDITABLE_COLUMNS[0]}`;
            }
          }
          break;
      }

      if (newCell && cellRegistry.includes(newCell)) {
        setActiveCell(newCell);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, isEditing, cellRegistry]);

  return (
    <NavigationContext.Provider value={{ 
      activeCell, 
      setActiveCell, 
      isEditing, 
      setIsEditing,
      registerCell
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Main App Component
function QuoteBuilderContent() {
  const [data, setData] = useState(initialData);
  const [showNewPackageModal, setShowNewPackageModal] = useState(false);
  const [newGroupPackageId, setNewGroupPackageId] = useState(null);
  const [descriptionGroup, setDescriptionGroup] = useState(null);

  const updateLineItem = useCallback((itemId, field, value) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(li =>
        li.id === itemId ? { ...li, [field]: value } : li
      )
    }));
  }, []);

  const deleteLineItem = useCallback((itemId) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(li => li.id !== itemId && li.parentLineItemId !== itemId)
    }));
  }, []);

  const addLineItem = useCallback((groupId) => {
    const pkg = data.quotePackages.find(p => 
      data.equipmentGroups.find(g => g.id === groupId)?.packageId === p.id
    );
    const existingItems = data.lineItems.filter(li => li.equipmentGroupId === groupId && li.parentLineItemId === null);
    const maxSortOrder = Math.max(0, ...existingItems.map(li => li.sortOrder || 0));
    
    const newItem = {
      id: generateId(),
      equipmentGroupId: groupId,
      parentLineItemId: null,
      qty: 1,
      supplierId: '',
      manufacturerId: '',
      equipmentTypeId: '',
      model: '',
      listPrice: 0,
      priceIncrease: 0,
      multiplier: 0,
      pay: 0,
      freight: 0,
      markup: pkg?.defaultMU || 1.35,
      shorthand: 'New Item',
      sortOrder: maxSortOrder + 1
    };
    setData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  }, [data.quotePackages, data.equipmentGroups, data.lineItems]);

  const addSubItem = useCallback((parentId) => {
    const parent = data.lineItems.find(li => li.id === parentId);
    if (!parent) return;
    
    const existingSubItems = data.lineItems.filter(li => li.parentLineItemId === parentId);
    const maxSortOrder = Math.max(0, ...existingSubItems.map(li => li.sortOrder || 0));
    
    const newItem = {
      id: generateId(),
      equipmentGroupId: parent.equipmentGroupId,
      parentLineItemId: parentId,
      qty: 1,
      supplierId: parent.supplierId,
      manufacturerId: parent.manufacturerId,
      equipmentTypeId: '',
      model: '',
      listPrice: 0,
      priceIncrease: parent.priceIncrease,
      multiplier: parent.multiplier,
      pay: 0,
      freight: 0,
      markup: parent.markup,
      shorthand: 'New Sub Item',
      sortOrder: maxSortOrder + 1
    };
    setData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  }, [data.lineItems]);

  const updatePackageMU = useCallback((packageId, newMU) => {
    setData(prev => ({
      ...prev,
      quotePackages: prev.quotePackages.map(p =>
        p.id === packageId ? { ...p, defaultMU: newMU } : p
      )
    }));
  }, []);

  const updatePackage = useCallback((packageId, field, value) => {
    setData(prev => ({
      ...prev,
      quotePackages: prev.quotePackages.map(p =>
        p.id === packageId ? { ...p, [field]: value } : p
      )
    }));
  }, []);

  const deletePackage = useCallback((packageId) => {
    if (!confirm('Delete this package and all its contents?')) return;
    
    setData(prev => {
      const groupIds = prev.equipmentGroups.filter(g => g.packageId === packageId).map(g => g.id);
      return {
        ...prev,
        quotePackages: prev.quotePackages.filter(p => p.id !== packageId),
        equipmentGroups: prev.equipmentGroups.filter(g => g.packageId !== packageId),
        lineItems: prev.lineItems.filter(li => !groupIds.includes(li.equipmentGroupId))
      };
    });
  }, []);

  const addPackage = useCallback(({ name, defaultMU }) => {
    const maxSortOrder = Math.max(0, ...data.quotePackages.map(p => p.sortOrder || 0));
    const newPackage = {
      id: generateId(),
      name,
      defaultMU,
      sortOrder: maxSortOrder + 1
    };
    setData(prev => ({
      ...prev,
      quotePackages: [...prev.quotePackages, newPackage]
    }));
  }, [data.quotePackages]);

  const updateEquipmentGroup = useCallback((groupId, field, value) => {
    setData(prev => ({
      ...prev,
      equipmentGroups: prev.equipmentGroups.map(g =>
        g.id === groupId ? { ...g, [field]: value } : g
      )
    }));
  }, []);

  const updateEquipmentGroupDescription = useCallback((groupId, descriptionData) => {
    setData(prev => ({
      ...prev,
      equipmentGroups: prev.equipmentGroups.map(g =>
        g.id === groupId ? { ...g, ...descriptionData } : g
      )
    }));
  }, []);

  const deleteEquipmentGroup = useCallback((groupId) => {
    if (!confirm('Delete this equipment group and all its line items?')) return;
    
    setData(prev => ({
      ...prev,
      equipmentGroups: prev.equipmentGroups.filter(g => g.id !== groupId),
      lineItems: prev.lineItems.filter(li => li.equipmentGroupId !== groupId)
    }));
  }, []);

  const addEquipmentGroup = useCallback((packageId) => {
    setNewGroupPackageId(packageId);
  }, []);

  const createEquipmentGroup = useCallback(({ name }) => {
    if (!newGroupPackageId) return;
    
    const existingGroups = data.equipmentGroups.filter(g => g.packageId === newGroupPackageId);
    const maxSortOrder = Math.max(0, ...existingGroups.map(g => g.sortOrder || 0));
    
    const newGroup = {
      id: generateId(),
      packageId: newGroupPackageId,
      name,
      sortOrder: maxSortOrder + 1,
      equipmentHeading: '',
      equipmentBullets: '',
      notes: ''
    };
    
    setData(prev => ({
      ...prev,
      equipmentGroups: [...prev.equipmentGroups, newGroup]
    }));
    
    setNewGroupPackageId(null);
  }, [newGroupPackageId, data.equipmentGroups]);

  // Handle line number change for moving items
  const moveLineItem = useCallback((itemId, oldLineNum, newLineNum) => {
    const parsed = parseLineNumber(newLineNum);
    
    if (!parsed.packageNum || !parsed.lineNum) {
      console.log('Invalid line number format');
      return;
    }

    const sortedPackages = [...data.quotePackages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const targetPackage = sortedPackages[parsed.packageNum - 1];
    
    if (!targetPackage) {
      console.log('Target package not found');
      return;
    }

    const targetGroups = data.equipmentGroups.filter(g => g.packageId === targetPackage.id);
    if (targetGroups.length === 0) {
      console.log('No groups in target package');
      return;
    }
    
    const targetGroup = targetGroups[0];
    
    setData(prev => {
      const item = prev.lineItems.find(li => li.id === itemId);
      if (!item) return prev;

      let updatedItems = [...prev.lineItems];
      
      if (parsed.subLineNum) {
        const targetParentItems = prev.lineItems
          .filter(li => li.equipmentGroupId === targetGroup.id && li.parentLineItemId === null)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        
        const targetParent = targetParentItems[parsed.lineNum - 1];
        
        if (targetParent) {
          updatedItems = updatedItems.map(li => {
            if (li.id === itemId) {
              return {
                ...li,
                equipmentGroupId: targetGroup.id,
                parentLineItemId: targetParent.id,
                sortOrder: parsed.subLineNum
              };
            }
            return li;
          });
        }
      } else {
        updatedItems = updatedItems.map(li => {
          if (li.id === itemId) {
            return {
              ...li,
              equipmentGroupId: targetGroup.id,
              parentLineItemId: null,
              sortOrder: parsed.lineNum
            };
          }
          return li;
        });
      }

      return {
        ...prev,
        lineItems: updatedItems
      };
    });
  }, [data.quotePackages, data.equipmentGroups]);

  const handleOpenDescription = useCallback((group) => {
    setDescriptionGroup(group);
  }, []);

  const handleSaveDescription = useCallback((descriptionData) => {
    if (descriptionGroup) {
      updateEquipmentGroupDescription(descriptionGroup.id, descriptionData);
    }
  }, [descriptionGroup, updateEquipmentGroupDescription]);

  const sortedPackages = [...data.quotePackages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Get fresh group data for the modal
  const currentDescriptionGroup = descriptionGroup 
    ? data.equipmentGroups.find(g => g.id === descriptionGroup.id) 
    : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quote Builder</h1>
            <p className="text-sm text-gray-500 mt-1">Excel-like navigation • Arrow keys to move • Enter to edit</p>
          </div>
          <button
            onClick={() => setShowNewPackageModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
          >
            <Package size={18} />
            New Quote Package
          </button>
        </div>

        {/* Legend */}
        <Legend />

        {/* Quote Packages */}
        {sortedPackages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Quote Packages</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first quote package</p>
            <button
              onClick={() => setShowNewPackageModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              <Plus size={18} />
              Create Quote Package
            </button>
          </div>
        ) : (
          sortedPackages.map((pkg, pkgIdx) => {
            const packageNumber = pkgIdx + 1;
            const pkgGroups = data.equipmentGroups
              .filter(g => g.packageId === pkg.id)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            const pkgLineItems = data.lineItems.filter(li => 
              pkgGroups.some(g => g.id === li.equipmentGroupId)
            );
            return (
              <QuotePackage
                key={pkg.id}
                pkg={pkg}
                packageNumber={packageNumber}
                groups={pkgGroups}
                lineItems={pkgLineItems}
                onUpdateLineItem={updateLineItem}
                onDeleteLineItem={deleteLineItem}
                onAddLineItem={addLineItem}
                onAddSubItem={addSubItem}
                onMoveLineItem={moveLineItem}
                onUpdatePackageMU={updatePackageMU}
                onUpdatePackage={updatePackage}
                onDeletePackage={deletePackage}
                onAddEquipmentGroup={addEquipmentGroup}
                onDeleteEquipmentGroup={deleteEquipmentGroup}
                onUpdateEquipmentGroup={updateEquipmentGroup}
                onOpenDescription={handleOpenDescription}
                data={data}
              />
            );
          })
        )}
      </div>

      {/* Modals */}
      <NewPackageModal
        isOpen={showNewPackageModal}
        onClose={() => setShowNewPackageModal(false)}
        onCreate={addPackage}
      />
      
      <NewEquipmentGroupModal
        isOpen={newGroupPackageId !== null}
        onClose={() => setNewGroupPackageId(null)}
        onCreate={createEquipmentGroup}
      />

      <EquipmentGroupDescriptionModal
        isOpen={descriptionGroup !== null}
        onClose={() => setDescriptionGroup(null)}
        group={currentDescriptionGroup}
        onSave={handleSaveDescription}
      />
    </div>
  );
}

// Export wrapped with NavigationProvider
export default function QuoteBuilder() {
  return (
    <NavigationProvider>
      <QuoteBuilderContent />
    </NavigationProvider>
  );
}
