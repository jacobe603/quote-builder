import { ChevronDown, ChevronRight, Plus, Trash2, CornerDownRight } from 'lucide-react';
import { TextCell, DropdownCell, LineNumberCell } from './cells';
import { calculateLineItem } from '../utils/calculations';
import { formatCurrency } from '../utils/helpers';

/**
 * Line Item Row Component
 * Renders a single line item in the pricing table
 */
const LineItemRow = ({
  item,
  lineNumber,
  isSubItem,
  hasChildren,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAddSubItem,
  onMove,
  data
}) => {
  const calc = calculateLineItem(item);

  const rowStyles = isSubItem
    ? 'bg-svl-orange-light border-l-4 border-l-svl-orange'
    : 'bg-white hover:bg-svl-gray-light';

  const cellPrefix = `${item.id}`;

  return (
    <tr className={`border-b border-svl-gray ${rowStyles}`}>
      {/* Line Number */}
      <td className="py-1.5 px-1 w-16 bg-svl-gray-light border-r border-svl-gray">
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
          <button onClick={onToggle} className="p-0.5 hover:bg-svl-gray-light rounded">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : isSubItem ? (
          <CornerDownRight size={12} className="text-svl-orange ml-1" />
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
      <td className={`py-1.5 w-24 text-right text-xs ${isSubItem ? 'bg-svl-orange-light/50' : 'bg-svl-gray-light'}`}>
        {formatCurrency(calc.mfgNet)}
      </td>
      <td className={`py-1.5 w-20 text-right text-xs ${isSubItem ? 'bg-svl-orange-light/50' : 'bg-svl-gray-light'}`}>
        {formatCurrency(calc.mfgComm)}
      </td>
      <td className="py-1.5 w-20 text-right">
        <TextCell cellId={`${cellPrefix}-freight`} value={item.freight} onChange={(v) => onUpdate('freight', v)} type="currency" className="text-right" />
      </td>
      <td className={`py-1.5 w-24 text-right text-xs ${isSubItem ? 'bg-svl-orange-light/50' : 'bg-svl-gray-light'}`}>
        {formatCurrency(calc.totalNet)}
      </td>
      <td className="py-1.5 w-14 text-right">
        <TextCell cellId={`${cellPrefix}-markup`} value={item.markup} onChange={(v) => onUpdate('markup', v)} type="multiplier" className="text-right" />
      </td>
      <td className={`py-1.5 w-24 text-right text-xs font-medium ${isSubItem ? 'bg-svl-green-light/50 text-svl-forest' : 'bg-svl-green-light text-svl-forest'}`}>
        {formatCurrency(calc.salesComm)}
      </td>
      <td className={`py-1.5 w-28 text-right text-xs font-semibold ${isSubItem ? 'bg-svl-blue-light/50 text-svl-blue' : 'bg-svl-blue-light text-svl-blue'}`}>
        {formatCurrency(calc.bidPrice)}
      </td>
      <td className="py-1.5 w-16 text-center">
        <div className="flex justify-center gap-0.5">
          {!isSubItem && (
            <button onClick={onAddSubItem} className="p-1 hover:bg-svl-gray-light rounded text-svl-gray-dark" title="Add Sub Item">
              <Plus size={12} />
            </button>
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
