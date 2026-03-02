import React, { useState } from 'react';
import closeIcon from '../common/ui/close.svg';
import greenCheckIcon from '../common/ui/green_check.svg';
import filesIcon from '../common/ui/files_icon.svg';
import { getText } from '../../../utils/textUtils';

const DEFAULT_PLACEHOLDER_LINK = 'https://example.com/estimation/placeholder-id-12345';

export interface CopyPublicLinkModalProps {
  open: boolean;
  onClose: () => void;
  /** Public share link - provided by SDK after shareEstimation; uses placeholder if not provided */
  publicLink?: string;
  /** Last update timestamp, e.g. "February 20, 2026 at 2:26 PM (UTC+0:00)" */
  lastUpdated?: string;
}

export const CopyPublicLinkModal: React.FC<CopyPublicLinkModalProps> = ({
  open,
  onClose,
  publicLink = DEFAULT_PLACEHOLDER_LINK,
  lastUpdated,
}) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-link-modal-title"
    >
      <div
        className="relative mx-4 rounded-2xl overflow-hidden flex flex-col bg-white"
        style={{ width: 587, height: 405, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
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
            id="copy-link-modal-title"
            className="text-[#032D60] text-2xl font-bold mb-2 font-display"
          >
            {getText("calc_generate_unique_url")}
          </h2>
          <div className="flex justify-center my-4">
            <img src={greenCheckIcon} alt="" className="w-8 h-8" aria-hidden />
          </div>
          <p className="text-[#032D60] font-semibold mb-1">
            {getText("calc_estimate_saved_successfully")}
          </p>
          {lastUpdated && (
            <p className="text-[#032D60] text-sm text-gray-600 mb-6">{getText("calc_last_update")}{lastUpdated}</p>
          )}
          <h3 className="text-[#0176D3] font-bold text-lg mb-2">{getText("calc_public_share_link")}</h3>
          <p
            className="text-[#032D60] text-sm leading-relaxed mb-4 font-sans"
          >
            {getText("calc_copy_link_description")}
          </p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{ background: '#0176D3' }}
            >
              {copied ? getText("calc_copied") : getText("calc_copy_public_link")}
              <img src={filesIcon} alt="" className="w-5 h-5" aria-hidden />
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
