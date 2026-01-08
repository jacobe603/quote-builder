import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { EDITABLE_COLUMNS } from '../utils/constants';

const NavigationContext = createContext();

export const useNavigation = () => useContext(NavigationContext);

/**
 * Navigation Provider Component
 * Manages Excel-like cell navigation state and keyboard handling
 */
export const NavigationProvider = ({ children }) => {
  const [activeCell, setActiveCell] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cellRegistry, setCellRegistry] = useState([]);

  const registerCell = useCallback((cellId) => {
    setCellRegistry(prev => {
      if (prev.includes(cellId)) return prev;
      return [...prev, cellId];
    });
  }, []);

  // Handle global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeCell || isEditing) return;

      // Parse current cell ID to get item and column
      const parts = activeCell.split('-');
      const itemId = parts[0];
      const column = parts[1];
      const currentColIndex = EDITABLE_COLUMNS.indexOf(column);

      // Get all unique item IDs maintaining order
      const allItemIds = [...new Set(cellRegistry.map(c => c.split('-')[0]))];
      const currentItemIndex = allItemIds.indexOf(itemId);

      let newCell = null;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (currentColIndex < EDITABLE_COLUMNS.length - 1) {
            newCell = `${itemId}-${EDITABLE_COLUMNS[currentColIndex + 1]}`;
          } else if (currentItemIndex < allItemIds.length - 1) {
            newCell = `${allItemIds[currentItemIndex + 1]}-${EDITABLE_COLUMNS[0]}`;
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (currentColIndex > 0) {
            newCell = `${itemId}-${EDITABLE_COLUMNS[currentColIndex - 1]}`;
          } else if (currentItemIndex > 0) {
            newCell = `${allItemIds[currentItemIndex - 1]}-${EDITABLE_COLUMNS[EDITABLE_COLUMNS.length - 1]}`;
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (currentItemIndex < allItemIds.length - 1) {
            newCell = `${allItemIds[currentItemIndex + 1]}-${column}`;
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (currentItemIndex > 0) {
            newCell = `${allItemIds[currentItemIndex - 1]}-${column}`;
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            if (currentColIndex > 0) {
              newCell = `${itemId}-${EDITABLE_COLUMNS[currentColIndex - 1]}`;
            } else if (currentItemIndex > 0) {
              newCell = `${allItemIds[currentItemIndex - 1]}-${EDITABLE_COLUMNS[EDITABLE_COLUMNS.length - 1]}`;
            }
          } else {
            if (currentColIndex < EDITABLE_COLUMNS.length - 1) {
              newCell = `${itemId}-${EDITABLE_COLUMNS[currentColIndex + 1]}`;
            } else if (currentItemIndex < allItemIds.length - 1) {
              newCell = `${allItemIds[currentItemIndex + 1]}-${EDITABLE_COLUMNS[0]}`;
            }
          }
          break;
      }

      if (newCell && cellRegistry.includes(newCell)) {
        setActiveCell(newCell);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, isEditing, cellRegistry]);

  return (
    <NavigationContext.Provider value={{
      activeCell,
      setActiveCell,
      isEditing,
      setIsEditing,
      registerCell
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext;
