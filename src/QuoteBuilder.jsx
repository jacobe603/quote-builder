import { useState, useCallback } from 'react';
import { Package, Plus, FileText, Settings } from 'lucide-react';

// Context
import { NavigationProvider } from './context/NavigationContext';

// Components
import { Legend, QuotePackage, AppLayout } from './components';
import {
  NewPackageModal,
  LineItemDescriptionModal,
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
  const [descriptionItem, setDescriptionItem] = useState(null);
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
    // Also delete any sub-lines when deleting a primary line
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(li => li.id !== itemId && li.parentLineItemId !== itemId)
    }));
  }, []);

  // Add a new primary line to a package
  const addPrimaryLine = useCallback((packageId) => {
    const pkg = data.quotePackages.find(p => p.id === packageId);
    const existingPrimaries = data.lineItems.filter(
      li => li.packageId === packageId && li.parentLineItemId === null
    );
    const maxSortOrder = Math.max(0, ...existingPrimaries.map(li => li.sortOrder || 0));

    const newItem = {
      id: generateId(),
      packageId: packageId,
      parentLineItemId: null,
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
      shorthand: 'New Primary Line',
      sortOrder: maxSortOrder + 1,
      // Description fields for primary lines
      equipmentHeading: '',
      tag: '',
      equipmentBullets: '',
      notes: ''
    };
    setData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  }, [data.quotePackages, data.lineItems]);

  // Add a sub-line under a primary line
  const addSubLine = useCallback((parentId) => {
    const parent = data.lineItems.find(li => li.id === parentId);
    if (!parent) return;

    const existingSubLines = data.lineItems.filter(li => li.parentLineItemId === parentId);
    const maxSortOrder = Math.max(0, ...existingSubLines.map(li => li.sortOrder || 0));

    const newItem = {
      id: generateId(),
      packageId: parent.packageId,
      parentLineItemId: parentId,
      qty: 1,
      supplierId: parent.supplierId,
      manufacturerId: parent.manufacturerId,
      equipmentTypeId: '',
      model: '',
      listPrice: 0,
      priceIncrease: parent.priceIncrease,
      multiplier: parent.multiplier,
      pay: 0,
      freight: 0,
      markup: parent.markup,
      shorthand: 'New Sub-line',
      sortOrder: maxSortOrder + 1
    };
    setData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  }, [data.lineItems]);

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

    setData(prev => ({
      ...prev,
      quotePackages: prev.quotePackages.filter(p => p.id !== packageId),
      lineItems: prev.lineItems.filter(li => li.packageId !== packageId)
    }));
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

  // Handle package number change for moving packages
  const movePackage = useCallback((packageId, newPackageNum) => {
    const targetNum = parseInt(newPackageNum, 10);
    if (isNaN(targetNum) || targetNum < 1) {
      console.warn('Invalid package number');
      return;
    }

    setData(prev => {
      const sortedPackages = [...prev.quotePackages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const currentIdx = sortedPackages.findIndex(p => p.id === packageId);
      const targetIdx = Math.min(Math.max(targetNum - 1, 0), sortedPackages.length - 1);

      if (currentIdx === targetIdx) return prev;

      // Remove from current position and insert at target
      const [movedPkg] = sortedPackages.splice(currentIdx, 1);
      sortedPackages.splice(targetIdx, 0, movedPkg);

      // Reassign sort orders
      const updatedPackages = sortedPackages.map((pkg, idx) => ({
        ...pkg,
        sortOrder: idx + 1
      }));

      return {
        ...prev,
        quotePackages: updatedPackages
      };
    });
  }, []);

  // Handle line number change for moving items
  // Format: X.Y for primary lines, X.Y.Z for sub-lines
  const moveLineItem = useCallback((itemId, oldLineNum, newLineNum) => {
    const parsed = parseLineNumber(newLineNum);
    const item = data.lineItems.find(li => li.id === itemId);
    if (!item) return;

    const sortedPackages = [...data.quotePackages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    if (parsed.itemNum) {
      // Moving a sub-line (X.Y.Z format)
      const targetPackage = sortedPackages[parsed.packageNum - 1];
      if (!targetPackage) {
        console.warn('Target package not found');
        return;
      }

      // Find the target primary line
      const primaryLines = data.lineItems
        .filter(li => li.packageId === targetPackage.id && li.parentLineItemId === null)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      const targetPrimary = primaryLines[parsed.groupNum - 1];
      if (!targetPrimary) {
        console.warn('Target primary line not found');
        return;
      }

      setData(prev => ({
        ...prev,
        lineItems: prev.lineItems.map(li => {
          if (li.id === itemId) {
            return {
              ...li,
              packageId: targetPackage.id,
              parentLineItemId: targetPrimary.id,
              sortOrder: parsed.itemNum
            };
          }
          return li;
        })
      }));
    } else if (parsed.groupNum) {
      // Moving a primary line (X.Y format)
      const targetPackage = sortedPackages[parsed.packageNum - 1];
      if (!targetPackage) {
        console.warn('Target package not found');
        return;
      }

      setData(prev => {
        // Update the primary line
        const updatedItems = prev.lineItems.map(li => {
          if (li.id === itemId) {
            return {
              ...li,
              packageId: targetPackage.id,
              parentLineItemId: null,
              sortOrder: parsed.groupNum
            };
          }
          // Also move sub-lines if parent is being moved to different package
          if (li.parentLineItemId === itemId && item.packageId !== targetPackage.id) {
            return {
              ...li,
              packageId: targetPackage.id
            };
          }
          return li;
        });

        return {
          ...prev,
          lineItems: updatedItems
        };
      });
    }
  }, [data.quotePackages, data.lineItems]);

  // Description Modal Handlers
  const handleOpenDescription = useCallback((item) => {
    setDescriptionItem(item);
  }, []);

  const handleSaveDescription = useCallback((descriptionData) => {
    if (descriptionItem) {
      setData(prev => ({
        ...prev,
        lineItems: prev.lineItems.map(li =>
          li.id === descriptionItem.id ? { ...li, ...descriptionData } : li
        )
      }));
    }
  }, [descriptionItem]);

  // Sorted packages for rendering
  const sortedPackages = [...data.quotePackages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Get fresh item data for the modal
  const currentDescriptionItem = descriptionItem
    ? data.lineItems.find(li => li.id === descriptionItem.id)
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
            const pkgLineItems = data.lineItems.filter(li => li.packageId === pkg.id);
            return (
              <QuotePackage
                key={pkg.id}
                pkg={pkg}
                packageNumber={packageNumber}
                lineItems={pkgLineItems}
                onUpdateLineItem={updateLineItem}
                onDeleteLineItem={deleteLineItem}
                onAddPrimaryLine={addPrimaryLine}
                onAddSubLine={addSubLine}
                onMoveLineItem={moveLineItem}
                onMovePackage={movePackage}
                onUpdatePackageMU={updatePackageMU}
                onUpdatePackage={updatePackage}
                onDeletePackage={deletePackage}
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

      <LineItemDescriptionModal
        isOpen={descriptionItem !== null}
        onClose={() => setDescriptionItem(null)}
        item={currentDescriptionItem}
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
