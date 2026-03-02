import React from 'react';
import { getText } from '../../../utils/textUtils';

export interface ReportDownloadStepProps {
	onDownload: () => void;
	onBackToEstimation?: () => void;
	variant?: 'desktop' | 'mobile';
}

const ReportDownloadStep: React.FC<ReportDownloadStepProps> = ({
	onDownload,
	onBackToEstimation,
	variant = 'desktop',
}) => {
	const isMobile = variant === 'mobile';

	return (
		<div className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-16 text-center">
			<h1
				className="font-sans text-2xl md:text-4xl font-bold text-[#032D60] mb-8"
			>
				{getText("calc_flex_credit_pricing_report")}
			</h1>
			<div className={`flex flex-col gap-4 ${isMobile ? 'items-stretch' : 'items-center'}`}>
				<div className={isMobile ? 'w-full' : ''}>
					<button
						type="button"
						onClick={onDownload}
						className="inline-flex items-center justify-center gap-2 h-[52px] px-8 rounded border-none cursor-pointer text-white font-bold text-base transition-all hover:opacity-95"
						style={{ background: '#0176D3' }}
					>
						{getText("calc_download_report")}
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
							<path
								d="M10 3v10m0 0l-4-4m4 4l4-4M3 17h14"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
				{onBackToEstimation && (
					<button
						type="button"
						onClick={onBackToEstimation}
						className="text-sm font-medium text-[#0176D3] hover:underline"
					>
						{getText("calc_back_to_estimation")}
					</button>
				)}
			</div>
			
		</div>
	);
};

export default ReportDownloadStep;
