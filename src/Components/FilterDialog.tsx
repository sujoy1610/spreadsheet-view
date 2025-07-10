import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';

// Define the props type
interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: Record<string, string>) => void;
}

interface FilterOption {
  key: string;
  label: string;
  options: string[];
}

const filterOptions: FilterOption[] = [
  { key: 'status', label: 'Status', options: ['In-process', 'Need to start', 'Complete', 'Blocked'] },
  { key: 'priority', label: 'Priority', options: ['High', 'Medium', 'Low'] },
  { key: 'submitter', label: 'Submitter', options: ['Aisha Patel', 'Irfan Khan', 'Mark Johnson', 'Emily Green', 'Jessica Brown'] }
];

export const FilterDialog: React.FC<FilterDialogProps> = ({ isOpen, onClose, onApplyFilter }) => {
  const [filters, setFilters] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    onApplyFilter({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium">Filter Data</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {filterOptions.map(option => (
            <div key={option.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{option.label}</label>
              <select
                value={filters[option.key] || ''}
                onChange={(e) => handleFilterChange(option.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All {option.label}s</option>
                {option.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button onClick={handleApply} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Apply Filters
          </button>
          <button onClick={handleClear} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Clear
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDialog;
