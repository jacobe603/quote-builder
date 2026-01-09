import { ChevronDown, ChevronRight, Plus, Trash2, FileText, CornerDownRight } from 'lucide-react';
import { TextCell, DropdownCell, LineNumberCell } from './cells';
import { calculateLineItem } from '../utils/calculations';
import { formatCurrency } from '../utils/helpers';

/**
 * Line Item Row Component
 * Renders a single line item - either primary line or sub-line
 */
const LineItemRow = ({
  item,
  lineNumber,
  isPrimary = false,
  isCollapsed = false,
  hasSubLines = false,
  onToggle,
  onUpdate,
  onDelete,
  onAddSubLine,
  onOpenDescription,
  hasDescription = false,
  onMove,
  data
}) => {
  const calc = calculateLineItem(item);
  const cellPrefix = `${item.id}`;

  // Different styling for primary vs sub-lines
  const rowClasses = isPrimary
    ? 'border-b-2 border-svl-blue bg-svl-blue-light/30 font-medium'
    : 'border-b border-svl-gray bg-white hover:bg-svl-gray-light';

  const lineNumClasses = isPrimary
    ? 'text-svl-blue font-bold text-sm'
    : 'text-svl-gray-dark text-xs';

  return (
    <tr className={rowClasses}>
      {/* Expand/Collapse Column */}
      <td className="py-1.5 px-1 w-8">
        {isPrimary ? (
          hasSubLines ? (
            <button onClick={onToggle} className="p-0.5 hover:bg-svl-blue-light rounded">
              {isCollapsed ? <ChevronRight size={16} className="text-svl-blue" /> : <ChevronDown size={16} className="text-svl-blue" />}
            </button>
          ) : null
        ) : (
          <CornerDownRight size={14} className="text-svl-gray ml-1" />
        )}
      </td>

      {/* Line Number */}
      <td className={`py-1.5 px-1 w-20 border-r border-svl-gray ${isPrimary ? 'bg-svl-blue/10' : 'bg-svl-gray-light'}`}>
        <LineNumberCell
          cellId={`${cellPrefix}-lineNum`}
          lineNumber={lineNumber}
          onMove={(newNum) => onMove(item.id, lineNumber, newNum)}
          className={lineNumClasses}
        />
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
        <TextCell cellId={`${cellPrefix}-model`} value={item.model} onChange={(v) => onUpdate('model', v)} className={isPrimary ? 'font-semibold' : ''} />
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
      <td className={`py-1.5 w-24 text-right text-xs ${isPrimary ? 'bg-svl-gray/30' : 'bg-svl-gray-light'}`}>
        {formatCurrency(calc.mfgNet)}
      </td>
      <td className={`py-1.5 w-20 text-right text-xs ${isPrimary ? 'bg-svl-gray/30' : 'bg-svl-gray-light'}`}>
        {formatCurrency(calc.mfgComm)}
      </td>
      <td className="py-1.5 w-20 text-right">
        <TextCell cellId={`${cellPrefix}-freight`} value={item.freight} onChange={(v) => onUpdate('freight', v)} type="currency" className="text-right" />
      </td>
      <td className={`py-1.5 w-24 text-right text-xs ${isPrimary ? 'bg-svl-gray/30' : 'bg-svl-gray-light'}`}>
        {formatCurrency(calc.totalNet)}
      </td>
      <td className="py-1.5 w-14 text-right">
        <TextCell cellId={`${cellPrefix}-markup`} value={item.markup} onChange={(v) => onUpdate('markup', v)} type="multiplier" className="text-right" />
      </td>
      <td className={`py-1.5 w-24 text-right text-xs font-medium ${isPrimary ? 'bg-svl-green/20 text-svl-forest' : 'bg-svl-green-light text-svl-forest'}`}>
        {formatCurrency(calc.salesComm)}
      </td>
      <td className={`py-1.5 w-28 text-right text-xs font-semibold ${isPrimary ? 'bg-svl-blue/20 text-svl-blue' : 'bg-svl-blue-light text-svl-blue'}`}>
        {formatCurrency(calc.bidPrice)}
      </td>
      <td className="py-1.5 w-20 text-center">
        <div className="flex justify-center gap-0.5">
          {isPrimary && (
            <>
              {/* Description Button */}
              <button
                onClick={onOpenDescription}
                className={`p-1 rounded ${hasDescription ? 'bg-svl-blue-light text-svl-blue' : 'hover:bg-svl-gray-light text-svl-gray-dark'}`}
                title="Edit Description"
              >
                <FileText size={12} />
              </button>
              {/* Add Sub-line Button */}
              <button
                onClick={onAddSubLine}
                className="p-1 hover:bg-svl-gray-light rounded text-svl-gray-dark"
                title="Add Sub-line"
              >
                <Plus size={12} />
              </button>
            </>
          )}
          <button onClick={onDelete} className="p-1 hover:bg-svl-red-light rounded text-svl-red" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default LineItemRow;
