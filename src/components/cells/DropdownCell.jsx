import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigation } from '../../context/NavigationContext';
import { ChevronDown } from 'lucide-react';

/**
 * Dropdown Cell Component with Autocomplete
 * Supports both dropdown selection and type-ahead filtering
 */
const DropdownCell = ({ cellId, value, onChange, options, className = '' }) => {
  const { activeCell, setActiveCell, isEditing, setIsEditing, registerCell } = useNavigation();
  const cellRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const isActive = activeCell === cellId;
  const isCurrentlyEditing = isActive && isEditing;

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.code && opt.code.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  useEffect(() => {
    registerCell(cellId);
  }, [cellId, registerCell]);

  useEffect(() => {
    if (isActive && !isEditing && cellRef.current) {
      cellRef.current.focus();
    }
  }, [isActive, isEditing]);

  useEffect(() => {
    if (isCurrentlyEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      setShowDropdown(true);
      setHighlightedIndex(0);
      // Calculate dropdown position
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 2,
          left: rect.left
        });
      }
    } else {
      setShowDropdown(false);
      setSearchTerm('');
    }
  }, [isCurrentlyEditing]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (showDropdown && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex];
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, showDropdown]);

  const handleKeyDown = (e) => {
    if (!isActive) return;

    if (!isEditing) {
      if (e.key === 'Enter' || e.key === 'F2' || e.key === ' ') {
        e.preventDefault();
        setIsEditing(true);
      }
    } else {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsEditing(false);
        setSearchTerm('');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Select the top filtered item on Tab (if available)
        if (filteredOptions.length > 0) {
          onChange(filteredOptions[0].id);
        }
        setIsEditing(false);
        setSearchTerm('');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].id);
          setIsEditing(false);
          setSearchTerm('');
        }
      }
    }
  };

  const handleSelect = (optionId) => {
    onChange(optionId);
    setIsEditing(false);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(0);
  };

  const displayValue = () => {
    const opt = options.find(o => o.id === value);
    if (!opt) return '--';
    // Show code if available, otherwise name
    return opt.code || opt.name;
  };

  const handleClick = () => {
    setActiveCell(cellId);
  };

  const handleDoubleClick = () => {
    setActiveCell(cellId);
    setIsEditing(true);
  };

  const baseClasses = `px-1 py-0.5 text-xs outline-none ${className}`;
  const activeClasses = isActive ? 'ring-2 ring-svl-blue-bright ring-inset' : '';
  const hoverClasses = !isActive ? 'hover:bg-svl-blue-light' : '';

  if (isCurrentlyEditing) {
    return (
      <div ref={containerRef} className="relative">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              // Don't close if clicking on dropdown list
              if (e.relatedTarget?.closest('.dropdown-list')) return;
              setTimeout(() => {
                setIsEditing(false);
                setSearchTerm('');
              }, 150);
            }}
            placeholder={displayValue()}
            className={`w-full ${baseClasses} border border-svl-blue-bright rounded bg-white pr-5`}
          />
          <ChevronDown size={12} className="absolute right-1 text-svl-gray-dark pointer-events-none" />
        </div>
        {showDropdown && createPortal(
          <ul
            ref={listRef}
            className="dropdown-list fixed z-[9999] w-48 max-h-48 overflow-y-auto bg-white border border-svl-gray rounded shadow-lg"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            <li
              className={`px-2 py-1 text-xs cursor-pointer ${
                highlightedIndex === -1 ? 'bg-svl-blue-light' : 'hover:bg-svl-gray-light'
              }`}
              onMouseDown={() => handleSelect('')}
              onMouseEnter={() => setHighlightedIndex(-1)}
            >
              <span className="text-svl-gray-dark">--</span>
            </li>
            {filteredOptions.map((opt, idx) => (
              <li
                key={opt.id}
                className={`px-2 py-1 text-xs cursor-pointer ${
                  highlightedIndex === idx ? 'bg-svl-blue-light' : 'hover:bg-svl-gray-light'
                }`}
                onMouseDown={() => handleSelect(opt.id)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                {opt.code ? (
                  <span>
                    <span className="font-medium">{opt.code}</span>
                    <span className="text-svl-gray-dark ml-1">- {opt.name}</span>
                  </span>
                ) : (
                  <span>{opt.name}</span>
                )}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-2 py-1 text-xs text-svl-gray-dark italic">
                No matches found
              </li>
            )}
          </ul>,
          document.body
        )}
      </div>
    );
  }

  return (
    <div
      ref={cellRef}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onFocus={() => setActiveCell(cellId)}
      className={`${baseClasses} ${activeClasses} ${hoverClasses} cursor-pointer rounded truncate`}
    >
      {displayValue()}
    </div>
  );
};

export default DropdownCell;
