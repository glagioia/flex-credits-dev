import React, { useState } from 'react';
import { generateReportPreviewFromData } from './generateReportPreview';
import { mockReportData } from './mockReportData';

/**
 * Dev-only page to test the PDF report without going through the full calculator flow.
 * Access at: http://localhost:5173/pdf-test (or your dev server URL + /pdf-test)
 */
export const PdfTestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      await generateReportPreviewFromData(mockReportData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#CFE9FE] p-8">
      <div className="max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-xl font-bold text-[#032D60]">PDF Report Test</h1>
        <p className="mb-6 text-sm text-gray-600">
          Click below to generate and preview the estimation report PDF with mock data. No need to
          go through the full calculator flow.
        </p>
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading}
          className="w-full rounded-lg bg-[#0176D3] px-6 py-3 font-medium text-white transition-colors hover:bg-[#014A8F] disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Preview PDF'}
        </button>
        <a
          href="/"
          className="mt-4 block text-center text-sm text-[#0176D3] hover:underline"
        >
          ← Back to calculator
        </a>
      </div>
    </div>
  );
};
