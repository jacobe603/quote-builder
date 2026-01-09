import { useState, useEffect } from 'react';
import Modal from '../Modal';

/**
 * Equipment Group Description Modal
 * For editing heading, bullets, and notes for Word doc generation
 */
const EquipmentGroupDescriptionModal = ({ isOpen, onClose, group, onSave }) => {
  const [equipmentHeading, setEquipmentHeading] = useState(group?.equipmentHeading || '');
  const [tag, setTag] = useState(group?.tag || '');
  const [equipmentBullets, setEquipmentBullets] = useState(group?.equipmentBullets || '');
  const [notes, setNotes] = useState(group?.notes || '');

  // Reset form when group changes
  useEffect(() => {
    if (group) {
      setEquipmentHeading(group.equipmentHeading || '');
      setTag(group.tag || '');
      setEquipmentBullets(group.equipmentBullets || '');
      setNotes(group.notes || '');
    }
  }, [group]);

  const handleSave = () => {
    onSave({
      equipmentHeading,
      tag,
      equipmentBullets,
      notes
    });
    onClose();
  };

  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Description: ${group.name}`} size="lg">
      <div className="space-y-4">
        {/* Equipment Heading and Tag */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Heading
            </label>
            <input
              type="text"
              value={equipmentHeading}
              onChange={(e) => setEquipmentHeading(e.target.value)}
              placeholder="e.g., (22) Jaga Briza Fan Coil Units with:"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Include quantity in parentheses, e.g., (22) Equipment Name</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g., FC-1,3,4,6"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Equipment tag reference</p>
          </div>
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
            Notes / Clarifications
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Clarifications:&#10;ATC Valves are NOT included.&#10;&#10;Special conditions, exclusions, etc."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Clarifications and notes shown on quote (NOT INCLUDED items will be highlighted)</p>
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

export default EquipmentGroupDescriptionModal;
