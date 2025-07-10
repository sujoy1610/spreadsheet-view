import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

interface Field {
  key: string;
  label: string;
}

const allFields: Field[] = [
  { key: 'jobRequest', label: 'Job Request' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'status', label: 'Status' },
  { key: 'submitter', label: 'Submitter' },
  { key: 'url', label: 'URL' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'priority', label: 'Priority' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'estValue', label: 'Est. Value' }
];

interface FieldVisibilityManagerProps {
  isOpen: boolean;
  onClose: () => void;
  hiddenFields: string[];
  onHideFields: (fields: string[]) => void;
}

const FieldVisibilityManager: React.FC<FieldVisibilityManagerProps> = ({
  isOpen,
  onClose,
  hiddenFields,
  onHideFields
}) => {
  const [localHiddenFields, setLocalHiddenFields] = useState<string[]>(hiddenFields);

  useEffect(() => {
    setLocalHiddenFields(hiddenFields); // sync if external state changes
  }, [hiddenFields]);

  if (!isOpen) return null;

  const toggleField = (fieldKey: string) => {
    setLocalHiddenFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleApply = () => {
    onHideFields(localHiddenFields);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Manage Field Visibility</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2 mb-6">
          {allFields.map(field => (
            <div key={field.key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <span className="text-sm">{field.label}</span>
              <button
                onClick={() => toggleField(field.key)}
                className={`p-1 rounded ${
                  localHiddenFields.includes(field.key)
                    ? 'text-gray-400 hover:text-gray-600'
                    : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {localHiddenFields.includes(field.key) ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldVisibilityManager;
