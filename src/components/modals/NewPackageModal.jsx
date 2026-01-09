import { useState } from 'react';
import Modal from '../Modal';

/**
 * New Package Modal Component
 * For creating new quote packages
 */
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
          <label className="block text-sm font-medium text-svl-gray-dark mb-1">Package Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Rooftop Units"
            className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-svl-gray-dark mb-1">Default Markup</label>
          <input
            type="text"
            value={defaultMU}
            onChange={(e) => setDefaultMU(e.target.value)}
            placeholder="1.35"
            className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
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
            Create Package
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewPackageModal;
