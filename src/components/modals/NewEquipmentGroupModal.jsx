import { useState } from 'react';
import Modal from '../Modal';

/**
 * New Equipment Group Modal Component
 * For creating new equipment groups within a package
 */
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

export default NewEquipmentGroupModal;
