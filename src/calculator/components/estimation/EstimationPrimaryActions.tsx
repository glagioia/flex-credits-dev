import React, { useState, useRef, useEffect } from 'react';
import type { Estimation } from '@sfdc/eaas/sdk';
import { Button } from '../common';
import { getText } from '../../../utils/textUtils';

const ChevronDownIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 ml-1" aria-hidden>
    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export interface EstimationPrimaryActionsProps {
  estimation: Estimation | null | undefined;
  onSaveEstimation?: () => void;
  onDownloadReport?: () => void;
  onContactSpecialist?: () => void;
  onAddToDashboard?: () => void;
  showAddToDashboard?: boolean;
  className?: string;
}

export const EstimationPrimaryActions: React.FC<EstimationPrimaryActionsProps> = ({
  estimation,
  onSaveEstimation,
  onDownloadReport,
  onContactSpecialist,
  onAddToDashboard,
  showAddToDashboard = true,
  className = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const disabled = !estimation;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShareClick = () => {
    if (disabled) return;
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSaveEstimation = () => {
    onSaveEstimation?.();
    setIsDropdownOpen(false);
  };

  const handleExportReport = () => {
    onDownloadReport?.();
    setIsDropdownOpen(false);
  };

  const shareButtonBg = isDropdownOpen ? '#042d60' : disabled ? '#C9C9C9' : '#0176D3';
  const shareButtonHover = isDropdownOpen ? '#042d60' : '#014486';

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-[24px] justify-center">
        <div ref={dropdownRef} className="relative flex w-full md:w-auto">
          <button
            type="button"
            onClick={handleShareClick}
            disabled={disabled}
            className="flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-[4px] px-[32px] font-sans font-bold transition-all duration-200 text-white border-none cursor-pointer w-full md:w-auto"
            style={{
              backgroundColor: shareButtonBg,
            }}
            onMouseEnter={(e) => {
              if (!disabled && !isDropdownOpen) e.currentTarget.style.backgroundColor = shareButtonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDropdownOpen ? '#042d60' : shareButtonBg;
            }}
          >
            {getText('calc_dashboard_share')}
            <ChevronDownIcon />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 min-w-[200px] rounded-[4px] bg-white shadow-lg border border-[#E5E5E5] py-1 z-50"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleSaveEstimation}
                className="w-full text-left px-4 py-3 text-[#032D60] text-base font-medium hover:bg-[#F3F3F3] transition-colors"
              >
                {getText('calc_dashboard_save_estimator')}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleExportReport}
                className="w-full text-left px-4 py-3 text-[#032D60] text-base font-medium hover:bg-[#F3F3F3] transition-colors"
              >
                {getText('calc_dashboard_export_full_report')}
              </button>
            </div>
          )}
        </div>

        <Button
          buttonType="secondary"
          onClick={() => onContactSpecialist?.()}
          disabled={disabled}
          className="w-full md:w-auto"
        >
          {getText('calc_dashboard_contact_specialist')}
        </Button>
      </div>
    </div>
  );
};
