import { useState, useCallback } from 'react';
import { Package, Plus, FileText, Settings } from 'lucide-react';

// Context
import { NavigationProvider } from './context/NavigationContext';

// Components
import { Legend, QuotePackage, AppLayout } from './components';
import {
  NewPackageModal,
  NewEquipmentGroupModal,
  EquipmentGroupDescriptionModal,
  ProjectInfoModal,
  QuotePreviewModal
} from './components/modals';

// Utils & Data
import { generateId, parseLineNumber } from './utils/helpers';
import { initialData } from './data/initialData';

/**
 * Main Quote Builder Content Component
 * Contains all state management and business logic
 */
function QuoteBuilderContent() {
  const [data, setData] = useState(initialData);
  const [showNewPackageModal, setShowNewPackageModal] = useState(false);
  const [newGroupPackageId, setNewGroupPackageId] = useState(null);
  const [descriptionGroup, setDescriptionGroup] = useState(null);
  const [showProjectInfoModal, setShowProjectInfoModal] = useState(false);
  const [showQuotePreview, setShowQuotePreview] = useState(false);

  // Line Item Operations
  const updateLineItem = useCallback((itemId, field, value) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(li =>
        li.id === itemId ? { ...li, [field]: value } : li
      )
    }));
  }, []);

  const deleteLineItem = useCallback((itemId) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(li => li.id !== itemId)
    }));
  }, []);

  const addLineItem = useCallback((groupId) => {
    const pkg = data.quotePackages.find(p =>
      data.equipmentGroups.find(g => g.id === groupId)?.packageId === p.id
    );
    const existingItems = data.lineItems.filter(li => li.equipmentGroupId === groupId);
    const maxSortOrder = Math.max(0, ...existingItems.map(li => li.sortOrder || 0));

    const newItem = {
      id: generateId(),
      equipmentGroupId: groupId,
      qty: 1,
      supplierId: '',
      manufacturerId: '',
      equipmentTypeId: '',
      model: '',
      listPrice: 0,
      priceIncrease: 0,
      multiplier: 0,
      pay: 0,
      freight: 0,
      markup: pkg?.defaultMU || 1.35,
      shorthand: 'New Item',
      sortOrder: maxSortOrder + 1
    };
    setData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  }, [data.quotePackages, data.equipmentGroups, data.lineItems]);

  // Package Operations
  const updatePackageMU = useCallback((packageId, newMU) => {
    setData(prev => ({
      ...prev,
      quotePackages: prev.quotePackages.map(p =>
        p.id === packageId ? { ...p, defaultMU: newMU } : p
      )
    }));
  }, []);

  const updatePackage = useCallback((packageId, field, value) => {
    setData(prev => ({
      ...prev,
      quotePackages: prev.quotePackages.map(p =>
        p.id === packageId ? { ...p, [field]: value } : p
      )
    }));
  }, []);

  const deletePackage = useCallback((packageId) => {
    if (!confirm('Delete this package and all its contents?')) return;

    setData(prev => {
      const groupIds = prev.equipmentGroups.filter(g => g.packageId === packageId).map(g => g.id);
      return {
        ...prev,
        quotePackages: prev.quotePackages.filter(p => p.id !== packageId),
        equipmentGroups: prev.equipmentGroups.filter(g => g.packageId !== packageId),
        lineItems: prev.lineItems.filter(li => !groupIds.includes(li.equipmentGroupId))
      };
    });
  }, []);

  const addPackage = useCallback(({ name, defaultMU }) => {
    const maxSortOrder = Math.max(0, ...data.quotePackages.map(p => p.sortOrder || 0));
    const newPackage = {
      id: generateId(),
      name,
      defaultMU,
      sortOrder: maxSortOrder + 1
    };
    setData(prev => ({
      ...prev,
      quotePackages: [...prev.quotePackages, newPackage]
    }));
  }, [data.quotePackages]);

  // Project Info Operations
  const updateProjectInfo = useCallback((projectInfo) => {
    setData(prev => ({
      ...prev,
      projectInfo
    }));
  }, []);

  // Equipment Group Operations
  const updateEquipmentGroup = useCallback((groupId, field, value) => {
    setData(prev => ({
      ...prev,
      equipmentGroups: prev.equipmentGroups.map(g =>
        g.id === groupId ? { ...g, [field]: value } : g
      )
    }));
  }, []);

  const updateEquipmentGroupDescription = useCallback((groupId, descriptionData) => {
    setData(prev => ({
      ...prev,
      equipmentGroups: prev.equipmentGroups.map(g =>
        g.id === groupId ? { ...g, ...descriptionData } : g
      )
    }));
  }, []);

  const deleteEquipmentGroup = useCallback((groupId) => {
    if (!confirm('Delete this equipment group and all its line items?')) return;

    setData(prev => ({
      ...prev,
      equipmentGroups: prev.equipmentGroups.filter(g => g.id !== groupId),
      lineItems: prev.lineItems.filter(li => li.equipmentGroupId !== groupId)
    }));
  }, []);

  const addEquipmentGroup = useCallback((packageId) => {
    setNewGroupPackageId(packageId);
  }, []);

  const createEquipmentGroup = useCallback(({ name }) => {
    if (!newGroupPackageId) return;

    const existingGroups = data.equipmentGroups.filter(g => g.packageId === newGroupPackageId);
    const maxSortOrder = Math.max(0, ...existingGroups.map(g => g.sortOrder || 0));

    const newGroup = {
      id: generateId(),
      packageId: newGroupPackageId,
      name,
      sortOrder: maxSortOrder + 1,
      equipmentHeading: '',
      tag: '',
      equipmentBullets: '',
      notes: ''
    };

    setData(prev => ({
      ...prev,
      equipmentGroups: [...prev.equipmentGroups, newGroup]
    }));

    setNewGroupPackageId(null);
  }, [newGroupPackageId, data.equipmentGroups]);

  // Handle line number change for moving items
  const moveLineItem = useCallback((itemId, oldLineNum, newLineNum) => {
    const parsed = parseLineNumber(newLineNum);

    if (!parsed.packageNum || !parsed.lineNum) {
      console.warn('Invalid line number format');
      return;
    }

    const sortedPackages = [...data.quotePackages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const targetPackage = sortedPackages[parsed.packageNum - 1];

    if (!targetPackage) {
      console.warn('Target package not found');
      return;
    }

    const targetGroups = data.equipmentGroups.filter(g => g.packageId === targetPackage.id);
    if (targetGroups.length === 0) {
      console.warn('No groups in target package');
      return;
    }

    const targetGroup = targetGroups[0];

    setData(prev => {
      const item = prev.lineItems.find(li => li.id === itemId);
      if (!item) return prev;

      const updatedItems = prev.lineItems.map(li => {
        if (li.id === itemId) {
          return {
            ...li,
            equipmentGroupId: targetGroup.id,
            sortOrder: parsed.lineNum
          };
        }
        return li;
      });

      return {
        ...prev,
        lineItems: updatedItems
      };
    });
  }, [data.quotePackages, data.equipmentGroups]);

  // Description Modal Handlers
  const handleOpenDescription = useCallback((group) => {
    setDescriptionGroup(group);
  }, []);

  const handleSaveDescription = useCallback((descriptionData) => {
    if (descriptionGroup) {
      updateEquipmentGroupDescription(descriptionGroup.id, descriptionData);
    }
  }, [descriptionGroup, updateEquipmentGroupDescription]);

  // Sorted packages for rendering
  const sortedPackages = [...data.quotePackages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Get fresh group data for the modal
  const currentDescriptionGroup = descriptionGroup
    ? data.equipmentGroups.find(g => g.id === descriptionGroup.id)
    : null;

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-full mx-auto">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-svl-black">Quote Builder</h1>
              <p className="text-sm text-svl-gray-dark mt-1">Excel-like navigation | Arrow keys to move | Enter to edit</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProjectInfoModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-svl-gray hover:bg-svl-gray-light text-svl-gray-dark font-medium rounded-md"
              >
                <Settings size={18} />
                Project Info
              </button>
              <button
                onClick={() => setShowQuotePreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-svl-green hover:bg-svl-forest text-white font-medium rounded-md"
              >
                <FileText size={18} />
                Generate Quote
              </button>
              <button
                onClick={() => setShowNewPackageModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-svl-blue-bright hover:bg-svl-blue text-white font-medium rounded-md"
              >
                <Package size={18} />
                New Quote Package
              </button>
            </div>
          </div>

          {/* Legend */}
          <Legend />

          {/* Quote Packages */}
          {sortedPackages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-svl-gray">
              <Package size={48} className="mx-auto text-svl-gray mb-4" />
              <h3 className="text-lg font-medium text-svl-gray-dark mb-2">No Quote Packages</h3>
              <p className="text-svl-gray-dark mb-4">Get started by creating your first quote package</p>
              <button
                onClick={() => setShowNewPackageModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-svl-blue-bright hover:bg-svl-blue text-white font-medium rounded-md"
              >
                <Plus size={18} />
                Create Quote Package
              </button>
            </div>
          ) : (
          sortedPackages.map((pkg, pkgIdx) => {
            const packageNumber = pkgIdx + 1;
            const pkgGroups = data.equipmentGroups
              .filter(g => g.packageId === pkg.id)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            const pkgLineItems = data.lineItems.filter(li =>
              pkgGroups.some(g => g.id === li.equipmentGroupId)
            );
            return (
              <QuotePackage
                key={pkg.id}
                pkg={pkg}
                packageNumber={packageNumber}
                groups={pkgGroups}
                lineItems={pkgLineItems}
                onUpdateLineItem={updateLineItem}
                onDeleteLineItem={deleteLineItem}
                onAddLineItem={addLineItem}
                onMoveLineItem={moveLineItem}
                onUpdatePackageMU={updatePackageMU}
                onUpdatePackage={updatePackage}
                onDeletePackage={deletePackage}
                onAddEquipmentGroup={addEquipmentGroup}
                onDeleteEquipmentGroup={deleteEquipmentGroup}
                onUpdateEquipmentGroup={updateEquipmentGroup}
                onOpenDescription={handleOpenDescription}
                data={data}
              />
            );
          })
        )}
        </div>
      </div>

      {/* Modals */}
      <NewPackageModal
        isOpen={showNewPackageModal}
        onClose={() => setShowNewPackageModal(false)}
        onCreate={addPackage}
      />

      <NewEquipmentGroupModal
        isOpen={newGroupPackageId !== null}
        onClose={() => setNewGroupPackageId(null)}
        onCreate={createEquipmentGroup}
      />

      <EquipmentGroupDescriptionModal
        isOpen={descriptionGroup !== null}
        onClose={() => setDescriptionGroup(null)}
        group={currentDescriptionGroup}
        onSave={handleSaveDescription}
      />

      <ProjectInfoModal
        isOpen={showProjectInfoModal}
        onClose={() => setShowProjectInfoModal(false)}
        projectInfo={data.projectInfo}
        onSave={updateProjectInfo}
      />

      <QuotePreviewModal
        isOpen={showQuotePreview}
        onClose={() => setShowQuotePreview(false)}
        data={data}
      />
    </AppLayout>
  );
}

/**
 * Main Export - Wrapped with NavigationProvider
 */
export default function QuoteBuilder() {
  return (
    <NavigationProvider>
      <QuoteBuilderContent />
    </NavigationProvider>
  );
}
