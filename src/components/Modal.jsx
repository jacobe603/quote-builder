import { X } from 'lucide-react';

/**
 * Reusable Modal Component
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-svl-black/50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-4 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-svl-gray flex-shrink-0">
          <h3 className="text-lg font-semibold text-svl-black">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-svl-gray-light rounded">
            <X size={20} className="text-svl-gray-dark" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
