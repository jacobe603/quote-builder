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
          <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Rooftop Units"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Markup</label>
          <input
            type="text"
            value={defaultMU}
            onChange={(e) => setDefaultMU(e.target.value)}
            placeholder="1.35"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            Create Package
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewPackageModal;
