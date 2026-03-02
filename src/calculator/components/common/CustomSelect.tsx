import React, { useState, useRef, useEffect } from "react";
import { getText } from "../../../utils/textUtils";

export interface SelectOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  /** ID of the element that labels this input (for accessibility) */
  'aria-labelledby'?: string;
  /** ID of the element that describes this input (for accessibility) */
  'aria-describedby'?: string;
}

function CustomSelect({
  options,
  value,
  onChange,
  placeholder = getText("calc_select_an_option"),
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative">
      {/* Selected Value / Trigger */}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[52px] px-4 pr-12 rounded-lg border border-[#C9C9C9] bg-white text-left flex items-center gap-3 focus:outline-none focus:border-[#0176D3] focus:ring-2 focus:ring-[#0176D3]/20 transition-all"
        style={{ background: "#FFF" }}
      >
        {selectedOption ? (
          <>
            {selectedOption.icon && (
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {selectedOption.icon}
              </div>
            )}
            <span 
              className="text-[#032D60] text-[16px] truncate font-sans"
            >
              {selectedOption.label}
            </span>
          </>
        ) : (
          <span 
            className="text-[#6B7280] text-[16px] font-sans"
          >
            {placeholder}
          </span>
        )}

        {/* Dropdown Arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg 
            width="16" 
            height="10" 
            viewBox="0 0 16 10" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M1 1L8 8L15 1" stroke="#032D60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div 
          className="absolute top-[56px] left-0 right-0 rounded-lg border border-[#C9C9C9] shadow-lg z-50 max-h-[300px] overflow-y-auto"
          style={{ background: "#FFF" }}
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#F3F4F6] transition-colors ${
                value === option.id ? 'bg-[#EBF5FF]' : ''
              }`}
            >
              {option.icon && (
                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                  {option.icon}
                </div>
              )}
              <span 
                className="text-[#032D60] text-[16px] font-sans"
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomSelect
