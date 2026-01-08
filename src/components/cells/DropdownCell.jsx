import { useRef, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';

/**
 * Dropdown Cell Component
 * For selecting from a list of options
 */
const DropdownCell = ({ cellId, value, onChange, options, className = '' }) => {
  const { activeCell, setActiveCell, isEditing, setIsEditing, registerCell } = useNavigation();
  const cellRef = useRef(null);
  const selectRef = useRef(null);

  const isActive = activeCell === cellId;
  const isCurrentlyEditing = isActive && isEditing;

  useEffect(() => {
    registerCell(cellId);
  }, [cellId, registerCell]);

  useEffect(() => {
    if (isActive && !isEditing && cellRef.current) {
      cellRef.current.focus();
    }
  }, [isActive, isEditing]);

  useEffect(() => {
    if (isCurrentlyEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isCurrentlyEditing]);

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
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setIsEditing(false);
      }
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    setIsEditing(false);
  };

  const displayValue = () => {
    const opt = options.find(o => o.id === value);
    return opt ? opt.name : '--';
  };

  const handleClick = () => {
    setActiveCell(cellId);
  };

  const handleDoubleClick = () => {
    setActiveCell(cellId);
    setIsEditing(true);
  };

  const baseClasses = `px-1 py-0.5 text-xs outline-none ${className}`;
  const activeClasses = isActive ? 'ring-2 ring-blue-500 ring-inset' : '';
  const hoverClasses = !isActive ? 'hover:bg-blue-50' : '';

  if (isCurrentlyEditing) {
    return (
      <select
        ref={selectRef}
        value={value || ''}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        onKeyDown={handleKeyDown}
        className={`w-full ${baseClasses} border border-blue-400 rounded bg-white cursor-pointer`}
      >
        <option value="">--</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
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
