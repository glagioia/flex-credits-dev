import React from 'react';
import closeIcon from '../common/ui/close.svg';
import downloadIcon from '../common/ui/download_icon.svg';
import { getText } from '../../../utils/textUtils';

export interface ExportReportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  open,
  onClose,
  onExport,
}) => {
  if (!open) return null;

  const handleExportClick = () => {
    onExport();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-report-modal-title"
    >
      <div
        className="relative mx-4 rounded-2xl overflow-hidden flex flex-col bg-white"
        style={{ width: 587, height: 263, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end pt-4 pr-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#032D60] hover:bg-gray-100 rounded-full transition-colors font-bold text-xl leading-none"
            aria-label="Close"
          >
            <img src={closeIcon} alt="" className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-8 pt-2 text-center">
          <h2
            id="export-report-modal-title"
            className="mb-4 font-display"
            style={{ fontWeight: 400, fontSize: 20, color: '#0B5CAB' }}
          >
            {getText('calc_export_report_heading')}
          </h2>
          <p
            className="mt-[10px] mb-12 font-sans"
            style={{ fontWeight: 400, fontSize: 14, color: '#0A2636' }}
          >
            {getText('calc_download_report_intro')}
          </p>
          <div className="flex justify-center gap-4 mt-[30px]">
            <button
              type="button"
              onClick={handleExportClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{ background: '#0176D3' }}
            >
              {getText('calc_dashboard_export_full_report')}
              <img src={downloadIcon} alt="" className="w-5 h-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold border-2 transition-colors bg-white text-[#0176D3] border-[#0176D3] hover:bg-[#0176D3]/5"
            >
              {getText('calc_cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
