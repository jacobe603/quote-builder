import { useRef, useEffect, useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { formatCurrency, formatPercent } from '../../utils/helpers';

/**
 * Text Input Cell Component
 * Supports text, number, currency, percent, and multiplier types
 */
const TextCell = ({ cellId, value, onChange, type = 'text', className = '' }) => {
  const { activeCell, setActiveCell, isEditing, setIsEditing, registerCell } = useNavigation();
  const cellRef = useRef(null);
  const inputRef = useRef(null);
  const [editValue, setEditValue] = useState(value);

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
    if (isCurrentlyEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCurrentlyEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const getEditValue = () => {
    if (type === 'percent') {
      return (value * 100).toFixed(1);
    }
    return value;
  };

  const handleKeyDown = (e) => {
    if (!isActive) return;

    if (!isEditing) {
      if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault();
        setEditValue(getEditValue());
        setIsEditing(true);
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveValue();
        setIsEditing(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditValue(value);
        setIsEditing(false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        saveValue();
        setIsEditing(false);
      }
    }
  };

  const saveValue = () => {
    let newValue = editValue;
    if (type === 'number' || type === 'currency') {
      newValue = parseFloat(editValue) || 0;
    } else if (type === 'percent') {
      newValue = parseFloat(editValue) / 100 || 0;
    } else if (type === 'multiplier') {
      newValue = parseFloat(editValue) || 0;
    }
    onChange(newValue);
  };

  const displayValue = () => {
    if (type === 'currency') return formatCurrency(value);
    if (type === 'percent') return formatPercent(value);
    if (type === 'multiplier') return value?.toFixed(2) || '0.00';
    return value;
  };

  const handleClick = () => {
    setActiveCell(cellId);
  };

  const handleDoubleClick = () => {
    setActiveCell(cellId);
    setEditValue(getEditValue());
    setIsEditing(true);
  };

  const baseClasses = `px-1 py-0.5 text-xs outline-none ${className}`;
  const activeClasses = isActive ? 'ring-2 ring-blue-500 ring-inset' : '';
  const hoverClasses = !isActive ? 'hover:bg-blue-50' : '';

  if (isCurrentlyEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          saveValue();
          setIsEditing(false);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full ${baseClasses} border border-blue-400 rounded`}
      />
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

export default TextCell;
