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
          <label className="block text-sm font-medium text-svl-gray-dark mb-1">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., RTU - AAON RN Series"
            className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-svl-gray-dark hover:bg-svl-gray-light rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-svl-blue-bright hover:bg-svl-blue rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewEquipmentGroupModal;
