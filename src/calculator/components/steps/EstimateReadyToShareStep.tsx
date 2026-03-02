import React, { useState } from 'react';
import { getText } from '../../../utils/textUtils';

export interface EstimateReadyToShareStepProps {
	/** Public share link (e.g. from shareEstimation). */
	publicLink?: string;
	/** Last update timestamp. */
	lastUpdated?: string;
	onBackToEstimation?: () => void;
	variant?: 'desktop' | 'mobile';
}

const DEFAULT_PLACEHOLDER_LINK = 'https://example.com/estimation/placeholder-id';

const chainLinkIcon = (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
		<path
			d="M8.5 11.5l3-3M11 8l2-2a2.83 2.83 0 114 4l-2 2M9 12l-2 2a2.83 2.83 0 01-4-4l2-2"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const EstimateReadyToShareStep: React.FC<EstimateReadyToShareStepProps> = ({
	publicLink = DEFAULT_PLACEHOLDER_LINK,
	lastUpdated,
	onBackToEstimation,
	variant = 'desktop',
}) => {
	const [copied, setCopied] = useState(false);
	const isMobile = variant === 'mobile';

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
		<div className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-16">
			<div className="text-center">
				<h1
					className="font-sans text-2xl md:text-4xl font-bold text-[#032D60] mb-4"
				>
					{getText("calc_estimate_ready_to_share")}
				</h1>
				<p className="text-base text-[#032D60] mb-4">
					{getText("calc_copy_link_instruction")}
				</p>
				<p className="text-sm text-[#032D60] text-gray-600 mb-8">
					{getText("calc_copy_link_note")}
				</p>
				<div className={`flex flex-col gap-4 ${isMobile ? 'items-stretch' : 'items-center'}`}>
					<button
						type="button"
						onClick={handleCopy}
						className="inline-flex items-center justify-center gap-2 h-[52px] px-8 rounded border-none cursor-pointer text-white font-bold text-base transition-all hover:opacity-95"
						style={{ background: '#0176D3' }}
					>
						{copied ? getText("calc_copied") : getText("calc_copy_public_link")}
						{chainLinkIcon}
					</button>
				
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
		</div>
	);
};

export default EstimateReadyToShareStep;
