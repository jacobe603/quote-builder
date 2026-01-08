import { useState, useEffect } from 'react';
import Modal from '../Modal';

/**
 * Equipment Group Description Modal
 * For editing heading, bullets, and notes for Word doc generation
 */
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

export default EquipmentGroupDescriptionModal;
