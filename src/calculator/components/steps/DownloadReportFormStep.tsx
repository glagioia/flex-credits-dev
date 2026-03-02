import React from 'react';
import { getText } from '../../../utils/textUtils';
import { LeadCaptureForm, type LeadCaptureFormData } from '../common/LeadCaptureForm';

const SUPPORT_PHONE = '1-800-664-9073';

export type DownloadReportFormData = LeadCaptureFormData;

export interface DownloadReportFormStepProps {
	onSubmit: (data: DownloadReportFormData) => void;
	onBack?: () => void;
	variant?: 'desktop' | 'mobile';
}

const downloadIcon = (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
		<path
			d="M10 3v10m0 0l-4-4m4 4l4-4M3 17h14"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const DownloadReportFormStep: React.FC<DownloadReportFormStepProps> = ({
	onSubmit,
	onBack,
	variant = 'desktop',
}) => {
	const isMobile = variant === 'mobile';

	const leftColumn = (
		<div className={isMobile ? 'order-1' : ''}>
			{onBack && (
				<button
					type="button"
					onClick={onBack}
					className="text-sm font-medium text-[#0176D3] hover:underline mb-6"
				>
					{getText("calc_download_back_to_estimation")}
				</button>
			)}
			<h1
				className="font-sans text-2xl md:text-3xl font-bold text-[#032D60] mb-4"
			>
				{getText("calc_download_report_heading")}
			</h1>
			<p className="text-base text-[#032D60] mb-4">
				{getText("calc_download_report_intro")}
			</p>
			<p className="text-base text-[#032D60] mb-3">
				{getText("calc_download_report_details")}
			</p>
			<ul className="list-disc list-inside text-base text-[#032D60] mb-6 space-y-1">
				<li>{getText("calc_download_report_item1")}</li>
				<li>{getText("calc_download_report_item2")}</li>
				<li>{getText("calc_download_report_item3")}</li>
			</ul>
			<p className="text-base text-[#032D60] mb-8">
				{getText("calc_download_questions_help")}
				<strong>{SUPPORT_PHONE}</strong>
			</p>
		</div>
	);

	return (
		<div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 bg-white">
			<div
				className={
					isMobile
						? 'flex flex-col gap-8'
						: 'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start'
				}
			>
				{leftColumn}
				<LeadCaptureForm
					formHeading={getText("calc_download_form_heading")}
					submitButtonText={getText("calc_dashboard_download_report")}
					submitButtonIcon={downloadIcon}
					onSubmit={onSubmit}
					variant={variant}
					idPrefix="download-report"
				/>
			</div>
		</div>
	);
};

export default DownloadReportFormStep;
