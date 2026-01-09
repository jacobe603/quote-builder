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
    attention: '',
    engineerCompany: '',
    location: '',
    quoteNotes: '',
    addendums: '',
    salesRep: ''
  });

  // Reset form when projectInfo changes
  useEffect(() => {
    if (projectInfo) {
      setFormData({
        projectName: projectInfo.projectName || '',
        projectNumber: projectInfo.projectNumber || '',
        bidDate: projectInfo.bidDate || '',
        customerName: projectInfo.customerName || '',
        attention: projectInfo.attention || '',
        engineerCompany: projectInfo.engineerCompany || '',
        location: projectInfo.location || '',
        quoteNotes: projectInfo.quoteNotes || '',
        addendums: projectInfo.addendums || '',
        salesRep: projectInfo.salesRep || ''
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
    <Modal isOpen={isOpen} onClose={onClose} title="Project Information" size="lg">
      <div className="space-y-4">
        {/* Row 1: Customer Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              To (Customer/Company)
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              placeholder="e.g., All American P&H"
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              Attention
            </label>
            <input
              type="text"
              value={formData.attention}
              onChange={(e) => handleChange('attention', e.target.value)}
              placeholder="e.g., Darrin"
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
          </div>
        </div>

        {/* Row 2: Project Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => handleChange('projectName', e.target.value)}
              placeholder="e.g., Maryvale Retreat Center Ph 1"
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Valley City, ND"
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
          </div>
        </div>

        {/* Row 3: Engineer and Quote # */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              Engineer Company
            </label>
            <input
              type="text"
              value={formData.engineerCompany}
              onChange={(e) => handleChange('engineerCompany', e.target.value)}
              placeholder="e.g., MBN Engineers"
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              SVL Quote #
            </label>
            <input
              type="text"
              value={formData.projectNumber}
              onChange={(e) => handleChange('projectNumber', e.target.value)}
              placeholder="e.g., 1173870"
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
          </div>
        </div>

        {/* Row 4: Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              Bid Date
            </label>
            <input
              type="date"
              value={formData.bidDate}
              onChange={(e) => handleChange('bidDate', e.target.value)}
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-svl-gray-dark mb-1">
              Addendums
            </label>
            <input
              type="text"
              value={formData.addendums}
              onChange={(e) => handleChange('addendums', e.target.value)}
              placeholder="e.g., 1, 2, 3"
              className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
            />
          </div>
        </div>

        {/* Row 5: Notes */}
        <div>
          <label className="block text-sm font-medium text-svl-gray-dark mb-1">
            Quote Notes
          </label>
          <input
            type="text"
            value={formData.quoteNotes}
            onChange={(e) => handleChange('quoteNotes', e.target.value)}
            placeholder="e.g., BUY QUOTE"
            className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
          />
        </div>

        {/* Row 6: Sales Rep */}
        <div>
          <label className="block text-sm font-medium text-svl-gray-dark mb-1">
            Sales Representative
          </label>
          <input
            type="text"
            value={formData.salesRep}
            onChange={(e) => handleChange('salesRep', e.target.value)}
            placeholder="e.g., Ben Eisenschenk / Lee Froemke"
            className="w-full px-3 py-2 border border-svl-gray rounded-md focus:ring-2 focus:ring-svl-blue-bright focus:border-svl-blue-bright"
          />
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
            Save Project Info
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectInfoModal;
