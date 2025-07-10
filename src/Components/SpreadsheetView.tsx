import React, { useState, useMemo } from 'react';
import Toolbar from './Toolbar';
import TabNavigation from './TabNavigation';
import DataTable from './DataTable';
import FieldVisibilityManager from './FieldVisibilityManager';
import FilterDialog from './FilterDialog';
import sampleData from '../data/sampleData';
import * as XLSX from 'xlsx';
import {
  Folder,
  Bell,
  Search,
  Link,
  Zap,
  HelpCircle,
  Wand2
} from 'lucide-react';

interface Sheet {
  id: string;
  name: string;
  data: Record<string, any>[];
}

interface TagButton {
  label: string;
  key: string | null;
  icon: React.ReactNode;
}

const SpreadsheetView: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>([
    { id: '1', name: 'All Orders', data: sampleData }
  ]);
  const [activeSheetId, setActiveSheetId] = useState('1');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [fieldManagerOpen, setFieldManagerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isABCMode, setIsABCMode] = useState(false);
  const [activeTagKey, setActiveTagKey] = useState<string | null>(null);

  const activeSheet = sheets.find(sheet => sheet.id === activeSheetId);
  const currentData = useMemo(() => activeSheet?.data || [], [activeSheet]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...currentData];

    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        return sortConfig.direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [currentData, searchTerm, filters, sortConfig]);

  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: column, direction });
  };

  const handleRowSelect = (index: number) => {
    setSelectedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleHideFields = (fields: string[]) => {
    setHiddenFields(fields);
    setFieldManagerOpen(false);
  };

  const handleDataUpdate = (rowIndex: number, field: string, value: string) => {
    setSheets(prev =>
      prev.map(sheet =>
        sheet.id === activeSheetId
          ? {
              ...sheet,
              data: sheet.data.map((row, i) =>
                i === rowIndex ? { ...row, [field]: value } : row
              )
            }
          : sheet
      )
    );
  };

  const handleSearchChange = (term: string) => setSearchTerm(term);
  const handleApplyFilter = (f: Record<string, string>) => setFilters(f);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
          const newSheet: Sheet = {
            id: Date.now().toString(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            data: jsonData
          };
          setSheets(prev => [...prev, newSheet]);
          setActiveSheetId(newSheet.id);
          alert('Imported successfully!');
        };
        reader.readAsArrayBuffer(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredAndSortedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, activeSheet?.name || 'Sheet');
      XLSX.writeFile(workbook, `${activeSheet?.name || 'spreadsheet'}.xlsx`);
      alert('Exported successfully!');
    } catch {
      alert('Export failed.');
    }
  };

  const handleNewSheet = () => {
    const newSheet: Sheet = {
      id: Date.now().toString(),
      name: `Sheet${sheets.length + 1}`,
      data: []
    };
    setSheets(prev => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
  };

  const handleTabChange = (sheetId: string) => {
    setActiveSheetId(sheetId);
    setSelectedRows([]);
    setSearchTerm('');
    setFilters({});
    setSortConfig(null);
  };

  const handleCloseSheet = (sheetId: string) => {
    if (sheets.length <= 1) {
      alert('At least one sheet must remain.');
      return;
    }
    setSheets(prev => prev.filter(sheet => sheet.id !== sheetId));
    if (sheetId === activeSheetId) {
      const remaining = sheets.filter(sheet => sheet.id !== sheetId);
      setActiveSheetId(remaining[0]?.id || '');
    }
  };

  const handleTagClick = (key: string | null) => {
    if (key === 'abc') {
      setIsABCMode(prev => !prev);
      return;
    }
    if (activeTagKey === key) {
      setHiddenFields([]);
      setActiveTagKey(null);
    } else {
      const allKeys = Object.keys(currentData[0] || {});
      const newHidden = allKeys.filter(k => k !== key);
      setHiddenFields(newHidden);
      setActiveTagKey(key);
    }
  };

  const tagButtons: TagButton[] = [
    { label: 'Q3 Financial Overview', key: null, icon: <Link className="w-4 h-4 text-blue-600" /> },
    { label: 'ABC', key: 'abc', icon: <Zap className="w-4 h-4 text-green-600" /> },
    { label: 'Answer a question', key: 'priority', icon: <HelpCircle className="w-4 h-4 text-purple-600" /> },
    { label: 'Extract', key: 'estValue', icon: <Wand2 className="w-4 h-4 text-orange-600" /> }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            <Folder className="w-4 h-4 text-gray-500" />
            <span>Workspace</span>
            <span>›</span>
            <span>Folder</span>
            <span>›</span>
            <span className="font-semibold text-black">Spreadsheet</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative text-sm">
              <span className="absolute inset-y-0 left-2 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search in sheet"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 pr-3 py-1 border rounded text-sm focus:outline-none"
              />
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gray-300 text-sm rounded-full flex items-center justify-center">
              JD
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        onSort={handleSort}
        onFilter={() => setFilterOpen(true)}
        onHideFields={() => setFieldManagerOpen(true)}
        hiddenFields={hiddenFields}
        onImport={handleImport}
        onExport={handleExport}
        onNewAction={handleNewSheet}
      />

      {/* Tags */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex space-x-3 overflow-x-auto">
          {tagButtons.map(tag => (
            <button
              key={tag.label}
              onClick={() => handleTagClick(tag.key)}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded 
                ${activeTagKey === tag.key ? 'bg-gray-300' : 'hover:bg-gray-100'} 
              `}
            >
              {tag.icon}
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <FieldVisibilityManager
        isOpen={fieldManagerOpen}
        onClose={() => setFieldManagerOpen(false)}
        hiddenFields={hiddenFields}
        onHideFields={handleHideFields}
      />
      <FilterDialog
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApplyFilter={handleApplyFilter}
      />

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <DataTable
          data={filteredAndSortedData}
          originalData={currentData}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSort={handleSort}
          onDataUpdate={handleDataUpdate}
          hiddenFields={hiddenFields}
          sortConfig={sortConfig}
          isABCMode={isABCMode}
        />
      </div>

      {/* Bottom Tabs */}
      <div className="border-t">
        <TabNavigation
          sheets={sheets}
          activeSheetId={activeSheetId}
          onTabChange={handleTabChange}
          onNewSheet={handleNewSheet}
          onCloseSheet={handleCloseSheet}
        />
      </div>
      
    </div>
  );
};

export default SpreadsheetView;
