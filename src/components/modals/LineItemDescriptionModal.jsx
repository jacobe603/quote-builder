import { useState, useEffect } from 'react';
import Modal from '../Modal';

/**
 * Line Item Description Modal
 * For editing heading, bullets, and notes for primary line items (for Word doc generation)
 */
const LineItemDescriptionModal = ({ isOpen, onClose, item, onSave }) => {
  const [equipmentHeading, setEquipmentHeading] = useState(item?.equipmentHeading || '');
  const [tag, setTag] = useState(item?.tag || '');
  const [equipmentBullets, setEquipmentBullets] = useState(item?.equipmentBullets || '');
  const [notes, setNotes] = useState(item?.notes || '');

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setEquipmentHeading(item.equipmentHeading || '');
      setTag(item.tag || '');
      setEquipmentBullets(item.equipmentBullets || '');
      setNotes(item.notes || '');
    }
  }, [item]);

  const handleSave = () => {
    onSave({
      equipmentHeading,
      tag,
      equipmentBullets,
      notes
    });
    onClose();
  };

  if (!item) return null;

  const title = item.model ? `Description: ${item.model}` : 'Line Item Description';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {/* Equipment Heading and Tag */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              Equipment Heading
            </label>
            <input
              type="text"
              value={equipmentHeading}
              onChange={(e) => setEquipmentHeading(e.target.value)}
              placeholder="e.g., (22) Jaga Briza Fan Coil Units with:"
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
            <p className="text-xs text-svl-gray-dark mt-1">Include quantity in parentheses, e.g., (22) Equipment Name</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              Tag
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g., FC-1,3,4,6"
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
            <p className="text-xs text-svl-gray-dark mt-1">Equipment tag reference</p>
          </div>
        </div>

        {/* Equipment Bullets */}
        <div>
          <label className="block text-sm font-medium text-svl-gray-dark mb-1">
            Equipment Bullets
          </label>
          <textarea
            value={equipmentBullets}
            onChange={(e) => setEquipmentBullets(e.target.value)}
            placeholder="• High-efficiency scroll compressors&#10;• Variable speed ECM motors&#10;• Factory-installed economizer&#10;• BACnet-compatible controls"
            rows={12}
            className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright font-mono text-sm"
          />
          <p className="text-xs text-svl-gray-dark mt-1">Features and specifications (approx. 20 lines)</p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-svl-gray-dark mb-1">
            Notes / Clarifications
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Clarifications:&#10;ATC Valves are NOT included.&#10;&#10;Special conditions, exclusions, etc."
            rows={6}
            className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright text-sm"
          />
          <p className="text-xs text-svl-gray-dark mt-1">Clarifications and notes shown on quote (NOT INCLUDED items will be highlighted)</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-svl-gray">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-svl-gray-dark hover:bg-svl-gray-light rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-svl-blue-bright hover:bg-svl-blue rounded-md"
          >
            Save Description
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LineItemDescriptionModal;
