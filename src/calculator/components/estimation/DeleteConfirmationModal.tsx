import React from 'react';
import closeIcon from '../common/ui/close.svg';
import { getText } from '../../../utils/textUtils';

export interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = getText("calc_are_you_sure"),
  message = getText("calc_delete_use_case_message"),
  confirmLabel = getText("calc_delete"),
  cancelLabel = getText("calc_cancel"),
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div
        className="relative rounded-2xl overflow-hidden flex flex-col bg-[#E8F4FC]"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: 333, height: 275 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end pt-4 pr-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#0176D3] hover:bg-white/50 rounded-full transition-colors font-bold text-xl leading-none"
            aria-label="Close"
          >
            <img src={closeIcon} alt="" className="h-5 w-5" />
          </button>
        </div>
        <div className="px-8 pb-6 pt-0 text-center flex-1 flex flex-col justify-center min-h-0">
          <h2
            id="delete-confirm-title"
            className="text-[#0176D3] text-2xl font-bold mb-3 font-display"
          >
            {title}
          </h2>
          <p
            className="font-sans text-[#032D60] text-base leading-relaxed mb-6"
          >
            {message}
          </p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{ background: '#0176D3' }}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold border-2 transition-colors bg-white text-[#0176D3] border-[#0176D3] hover:bg-[#0176D3]/5"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
