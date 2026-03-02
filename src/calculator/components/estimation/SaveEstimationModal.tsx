import React from 'react';
import closeIcon from '../common/ui/close.svg';
import { getText } from '../../../utils/textUtils';

export interface SaveEstimationModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const SaveEstimationModal: React.FC<SaveEstimationModalProps> = ({
  open,
  onClose,
  onContinue,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-estimation-modal-title"
    >
      <div
        className="relative w-full max-w-xl mx-4 rounded-2xl overflow-hidden flex flex-col bg-white"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
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
        <div className="px-8 pb-8 pt-2 text-center">
          <h2
            id="save-estimation-modal-title"
            className="text-[#032D60] text-2xl font-bold mb-4 font-display"
          >
            {getText("calc_generate_unique_url")}
          </h2>
          <p
            className="text-[#032D60] text-base leading-relaxed mb-8"
            style={{ fontFamily: '"Salesforce Sans", Arial, sans-serif' }}
          >
            {getText("calc_save_estimation_description")}
          </p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                onContinue();
                onClose();
              }}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{ background: '#0176D3' }}
            >
              {getText("calc_continue")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold border-2 transition-colors bg-white text-[#0176D3] border-[#0176D3] hover:bg-[#0176D3]/5"
            >
              {getText("calc_cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
