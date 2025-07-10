import React, { useState } from 'react';
import {
  EyeOff,
  Filter,
  Table,
  FileUp,
  FileDown,
  Share2,
  Plus,
  ArrowUpDown,
  LayoutDashboard
} from 'lucide-react';

interface ToolbarProps {
  onSort: (key: string) => void;
  onFilter: () => void;
  onHideFields: (fields: string[]) => void;
  hiddenFields: string[];
  onImport: () => void;
  onExport: () => void;
  onNewAction: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSort,
  onFilter,
  onHideFields,
  hiddenFields,
  onImport,
  onExport,
  onNewAction
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const handleSort = () => {
    onSort('jobRequest');
    alert('Sorted by Job Request');
  };

  const handleViewToggle = () => {
    const newView = viewMode === 'table' ? 'card' : 'table';
    setViewMode(newView);
    alert(`Switched to ${newView} view`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="bg-white border-b px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left buttons */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <LayoutDashboard className="w-4 h-4" /> Toolbar
          </span>
          <span className="text-gray-400">›</span>

          <button
            onClick={() => onHideFields(hiddenFields)}
            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-gray-700"
          >
            <EyeOff className="w-4 h-4" />
            Hide Fields
          </button>

          <button
            onClick={handleSort}
            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-gray-700"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>

          <button
            onClick={onFilter}
            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-gray-700"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          <button
            onClick={handleViewToggle}
            className={`flex items-center gap-1 px-2 py-1 rounded ${
              viewMode === 'card'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Table className="w-4 h-4" />
            Cell View
          </button>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={onImport}
            className="flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-100"
          >
            <FileUp className="w-4 h-4" />
            Import
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-100"
          >
            <FileDown className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-100"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button
            onClick={onNewAction}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            New Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
