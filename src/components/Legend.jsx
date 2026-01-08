/**
 * Legend Component
 * Shows cell type color coding and keyboard shortcuts
 */
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
        <b>Arrow keys</b> to navigate | <b>Enter/F2</b> to edit | <b>Esc</b> to cancel | <b>Space</b> for dropdowns
      </div>
    </div>
  </div>
);

export default Legend;
