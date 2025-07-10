import React from 'react';
import { X } from 'lucide-react';

export interface TabNavigationProps {
  sheets: { id: string; name: string }[];
  activeSheetId: string;
  onTabChange: (sheetId: string) => void;
  onNewSheet: () => void;
  onCloseSheet: (sheetId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  sheets,
  activeSheetId,
  onTabChange,
  onNewSheet,
  onCloseSheet
}) => {
  return (
    <div className="flex items-center space-x-0 bg-gray-100 px-2 py-1 border-t">
      <div className="flex overflow-x-auto">
        {sheets.map((sheet) => (
          <div key={sheet.id} className="relative">
            <button
              onClick={() => onTabChange(sheet.id)}
              className={`px-4 py-2 text-sm border-r border-gray-300 whitespace-nowrap pr-6 ${
                activeSheetId === sheet.id
                  ? 'bg-white text-black font-semibold border-t-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sheet.name}
            </button>
            {sheets.length > 1 && (
              <button
                onClick={() => onCloseSheet(sheet.id)}
                className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                title="Close sheet"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onNewSheet}
        className="ml-2 p-2 rounded hover:bg-gray-200 text-gray-600"
        title="Add new sheet"
      >
        +
      </button>
    </div>
  );
};

export default TabNavigation;
