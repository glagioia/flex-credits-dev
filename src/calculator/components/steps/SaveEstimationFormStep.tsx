import React from 'react';
import { getText } from '../../../utils/textUtils';
import { LeadCaptureForm, type LeadCaptureFormData } from '../common/LeadCaptureForm';

const SUPPORT_PHONE = '1-800-664-9073';

export interface SaveEstimationFormStepProps {
	onSubmit: (data: LeadCaptureFormData) => void;
	onBack?: () => void;
	variant?: 'desktop' | 'mobile';
}

const SaveEstimationFormStep: React.FC<SaveEstimationFormStepProps> = ({
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
				{getText("calc_save_estimation_heading")}
			</h1>
			<p className="text-base text-[#032D60] mb-4">
				{getText("calc_save_estimation_subtitle")}
			</p>
			<p className="text-base text-[#032D60] mb-3">
				{getText("calc_save_estimation_details")}
			</p>
			<ul className="list-disc list-inside text-base text-[#032D60] mb-6 space-y-1">
				<li>{getText("calc_save_estimation_item1")}</li>
				<li>{getText("calc_save_estimation_item2")}</li>
				<li>{getText("calc_save_estimation_item3")}</li>
				<li>{getText("calc_save_estimation_item4")}</li>
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
					formHeading={getText("calc_save_form_heading")}
					submitButtonText={getText("calc_get_public_link")}
					onSubmit={onSubmit}
					variant={variant}
					idPrefix="save-estimation"
				/>
			</div>
		</div>
	);
};

export default SaveEstimationFormStep;
