import { useRef, useEffect, useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';

/**
 * Line Number Cell - Special cell for line numbers
 * Supports editing to move items to new positions
 */
const LineNumberCell = ({ cellId, lineNumber, onMove }) => {
  const { activeCell, setActiveCell, isEditing, setIsEditing, registerCell } = useNavigation();
  const cellRef = useRef(null);
  const inputRef = useRef(null);
  const [editValue, setEditValue] = useState(lineNumber);

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
    setEditValue(lineNumber);
  }, [lineNumber]);

  const handleKeyDown = (e) => {
    if (!isActive) return;

    if (!isEditing) {
      if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault();
        setEditValue(lineNumber);
        setIsEditing(true);
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (editValue !== lineNumber) {
          onMove(editValue);
        }
        setIsEditing(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditValue(lineNumber);
        setIsEditing(false);
      }
    }
  };

  const handleClick = () => {
    setActiveCell(cellId);
  };

  const handleDoubleClick = () => {
    setActiveCell(cellId);
    setEditValue(lineNumber);
    setIsEditing(true);
  };

  if (isCurrentlyEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          if (editValue !== lineNumber) {
            onMove(editValue);
          }
          setIsEditing(false);
        }}
        onKeyDown={handleKeyDown}
        className="w-14 px-1 py-0.5 text-xs font-mono border border-blue-400 rounded outline-none text-center"
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
      className={`px-1 py-0.5 text-xs font-mono cursor-pointer rounded text-center font-semibold outline-none text-slate-700
        ${isActive ? 'ring-2 ring-blue-500 ring-inset' : 'hover:bg-blue-100'}`}
      title="Click to edit and move item"
    >
      {lineNumber}
    </div>
  );
};

export default LineNumberCell;
