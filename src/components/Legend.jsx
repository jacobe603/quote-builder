/**
 * Legend Component
 * Shows cell type color coding and keyboard shortcuts
 */
const Legend = () => (
  <div className="mb-4 p-3 bg-white rounded-lg border border-svl-gray shadow-sm">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-6 text-xs text-svl-gray-dark">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-svl-blue-light/30 border-b-2 border-svl-blue rounded"></div>
          <span>Primary Line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-svl-gray rounded"></div>
          <span>Sub-line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-svl-gray-light rounded"></div>
          <span>Calculated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-svl-green-light rounded"></div>
          <span>Commission</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-svl-blue-light rounded"></div>
          <span>Bid Price</span>
        </div>
      </div>
      <div className="text-xs text-svl-gray-dark bg-svl-gray-light px-2 py-1 rounded">
        <b>Arrow keys</b> to navigate | <b>Enter/F2</b> to edit | <b>Esc</b> to cancel | <b>Space</b> for dropdowns
      </div>
    </div>
  </div>
);

export default Legend;
