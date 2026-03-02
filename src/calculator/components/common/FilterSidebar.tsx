import React, { useState } from 'react';
import { getText } from '../../../utils/textUtils';

export interface FilterOptionType {
  id: string;
  label: string;
}

export interface FilterSectionType {
  id: string;
  label: string;
  options: FilterOptionType[];
}

interface FilterSidebarProps {
  sections: FilterSectionType[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (sectionId: string, optionId: string, selected: boolean) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  sections,
  selectedFilters,
  onFilterChange,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    sections.reduce((acc, section) => ({ ...acc, [section.id]: false }), {})
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[24px] text-[#032D60] font-bold font-display">{getText("calc_filter_by")}</h3>
      {sections.map((section) => (
        <div key={section.id} className="border-b border-gray-200 pb-2">
          <button
            onClick={() => toggleSection(section.id)}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <span className="font-bold text-[20px] text-[#032D60] font-display">{section.label}</span>
            <svg
              className={`w-5 h-5 text-[#032D60] font-bold transition-transform ${
                expandedSections[section.id] ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expandedSections[section.id] && (
            <div className="pl-2 space-y-2 mt-2">
              {section.options.map((option) => (
                <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters[section.id]?.includes(option.id) || false}
                    onChange={(e) => onFilterChange(section.id, option.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[16px] text-[#181818]">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterSidebar;
