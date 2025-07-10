import React, { useState, useRef, useMemo } from 'react';
import {
  User, Globe, Link, BadgeCheck, Calendar, Send,
} from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

interface DataTableProps {
  data: Record<string, any>[];
  originalData: Record<string, any>[];
  selectedRows: number[];
  onRowSelect: (index: number) => void;
  onSort: (column: string) => void;
  onDataUpdate: (rowIndex: number, field: string, value: string) => void;
  hiddenFields: string[];
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  } | null;
  isABCMode: boolean;
}

const iconMap: Record<string, JSX.Element | null> = {
  jobRequest: <Send className="w-4 h-4 text-gray-500" />,
  submitted: <Calendar className="w-4 h-4 text-gray-500" />,
  status: <BadgeCheck className="w-4 h-4 text-gray-500" />,
  submitter: <User className="w-4 h-4 text-gray-500" />,
  url: <Globe className="w-4 h-4 text-gray-500" />,
  assigned: <User className="w-4 h-4 text-gray-500" />,
  priority: <BadgeCheck className="w-4 h-4 text-gray-500" />,
  dueDate: <Calendar className="w-4 h-4 text-gray-500" />,
  estValue: null, // no icon
};

const statusColors: Record<string, string> = {
  'In-process': 'bg-yellow-100 text-yellow-800',
  'Need to start': 'bg-gray-200 text-gray-700',
  'Complete': 'bg-green-100 text-green-800',
  'Blocked': 'bg-red-100 text-red-600',
};

const priorityColors: Record<string, string> = {
  High: 'text-red-600',
  Medium: 'text-yellow-600',
  Low: 'text-blue-600',
};

const DataTable: React.FC<DataTableProps> = ({
  data,
  originalData,
  selectedRows,
  onRowSelect,
  onSort,
  onDataUpdate,
  hiddenFields,
  sortConfig,
  isABCMode,
}) => {
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLTableElement | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const allKeys = useMemo(() => {
    const keysSet = new Set<string>();
    originalData.forEach(row => Object.keys(row).forEach(k => keysSet.add(k)));
    return Array.from(keysSet).filter(key => !hiddenFields.includes(key));
  }, [originalData, hiddenFields]);

  const rowsToRender = [...data];
  while (rowsToRender.length < 50) rowsToRender.push({});

  const focusCell = (row: number, col: number) => {
    setSelectedCell({ row, col });
    const refKey = `${row}-${col}`;
    inputRefs.current[refKey]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusCell(Math.min(rowIndex + 1, rowsToRender.length - 1), colIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell(Math.max(rowIndex - 1, 0), colIndex);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusCell(rowIndex, Math.min(colIndex + 1, allKeys.length - 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusCell(rowIndex, Math.max(colIndex - 1, 0));
    }
  };

  const handleChange = (rowIndex: number, key: string, value: string) => {
    onDataUpdate(rowIndex, key, value);
  };

  const handleMouseDown = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[key] || 150;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(startWidth + (e.clientX - startX), 60);
      setColumnWidths(prev => ({ ...prev, [key]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="overflow-auto border border-gray-300">
      <table
        className="w-full text-sm text-left bg-white"
        style={{ tableLayout: 'fixed' }}
        ref={tableRef}
      >
        <thead className="bg-gray-100 sticky top-0 z-10">
  <tr>
    <th className="w-10 border-r border-gray-300 text-center">#</th>
    {allKeys.map((key, index) => (
      <th
        key={key}
        className="relative border-r border-gray-300 font-semibold group"
        style={{ width: columnWidths[key] || 150 }}
      >
        <div
          className="px-2 py-2 whitespace-nowrap flex items-center gap-1 cursor-pointer"
          onClick={() => onSort(key)}
        >
          {iconMap[key]}
          <span>
            {isABCMode ? String.fromCharCode(65 + index) : key}
          </span>
          {sortConfig?.key === key && (
            <span className="ml-1 text-xs">
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
        <div
          onMouseDown={(e) => handleMouseDown(e, key)}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400"
        />
      </th>
    ))}
  </tr>
</thead>

        <tbody>
          {rowsToRender.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td
                className="text-center border-r border-t border-gray-200 px-1"
                onClick={() => onRowSelect(rowIndex)}
              >
                {rowIndex + 1}
              </td>
              {allKeys.map((key, colIndex) => {
                const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex;
                const refKey = `${rowIndex}-${colIndex}`;
                const cellValue = row[key];

                let content;

                if (key === 'status' && cellValue) {
                  const statusClass = statusColors[cellValue] || 'bg-gray-200 text-gray-800';
                  content = (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${statusClass}`}>
                      {cellValue}
                    </span>
                  );
                } else if (key === 'priority' && cellValue) {
                  const color = priorityColors[cellValue] || 'text-gray-700';
                  content = <span className={`font-medium ${color}`}>{cellValue}</span>;
                } else if (key === 'url' && cellValue) {
                  content = (
                    <a
                      href={`https://${cellValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {cellValue}
                    </a>
                  );
                } else if (key === 'estValue') {
                  content = cellValue
                    ? <span className="text-gray-800 font-medium">₹ {Number(cellValue).toLocaleString()}</span>
                    : '';
                } else {
                  content = (
                    <input
                      ref={(el) => {
                        inputRefs.current[refKey] = el;
                      }}
                      className="w-full bg-transparent px-2 py-1 text-sm
    focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600
    border border-transparent focus:border focus:rounded-sm
    transition duration-100 ease-in-out"
                      value={cellValue ? String(cellValue) : ''}
                      onChange={(e) => handleChange(rowIndex, key, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    />
                  );
                }

                return (
                  <td
                    key={colIndex}
                    style={{ width: columnWidths[key] || 150 }}
                    className={`border-r border-t border-gray-200 px-2 py-1 ${
                      isSelected ? 'outline outline-blue-500 outline-2' : ''
                    }`}
                    onClick={() => focusCell(rowIndex, colIndex)}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
