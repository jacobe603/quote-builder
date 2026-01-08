import { useState, useEffect } from 'react';
import Modal from '../Modal';

/**
 * Project Info Modal Component
 * For editing project-level metadata that appears on the quote document
 */
const ProjectInfoModal = ({ isOpen, onClose, projectInfo, onSave }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    projectNumber: '',
    bidDate: '',
    customerName: '',
    engineerCompany: ''
  });

  // Reset form when projectInfo changes
  useEffect(() => {
    if (projectInfo) {
      setFormData({
        projectName: projectInfo.projectName || '',
        projectNumber: projectInfo.projectNumber || '',
        bidDate: projectInfo.bidDate || '',
        customerName: projectInfo.customerName || '',
        engineerCompany: projectInfo.engineerCompany || ''
      });
    }
  }, [projectInfo]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Information" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => handleChange('projectName', e.target.value)}
            placeholder="e.g., Main Street Office Building"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Number
          </label>
          <input
            type="text"
            value={formData.projectNumber}
            onChange={(e) => handleChange('projectNumber', e.target.value)}
            placeholder="e.g., PRJ-2024-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bid Date
          </label>
          <input
            type="date"
            value={formData.bidDate}
            onChange={(e) => handleChange('bidDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="e.g., ABC Construction Co."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Engineer Company
          </label>
          <input
            type="text"
            value={formData.engineerCompany}
            onChange={(e) => handleChange('engineerCompany', e.target.value)}
            placeholder="e.g., Smith Engineering LLC"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
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
            Save Project Info
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectInfoModal;
