import React from "react";

interface ShowMoreToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
  showMoreLabel: string;
  showLessLabel: string;
  className?: string;
}

export function ShowMoreToggle({
  isExpanded,
  onToggle,
  showMoreLabel,
  showLessLabel,
  className = "",
}: ShowMoreToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        show-more-toggle
        flex flex-row items-center justify-center gap-[8px]
        mx-auto
        text-[#014486] hover:text-[#014486]
        transition-colors duration-200
        ${className}
      `}
    >
      <span 
        className="text-[16px] font-semibold leading-[24px]"
        style={{
          fontFamily: '"Salesforce Sans", Arial, sans-serif',
          fontFeatureSettings: "'liga' off, 'clig' off"
        }}
      >
        {isExpanded ? showLessLabel : showMoreLabel}
      </span>
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`show-more-toggle__icon transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
      >
        <path
          d="M6 7L0.803848 0.25L11.1962 0.25L6 7Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}
