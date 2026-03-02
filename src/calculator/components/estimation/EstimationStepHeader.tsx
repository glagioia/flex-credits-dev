import React from "react";
import { getText } from "../../../utils/textUtils";
import { Button } from "../common";

export interface EstimationStepHeaderProps {
	title?: string;
	description?: string;
	className?: string;
	variant?: "desktop" | "mobile";
	onSaveEstimation?: () => void;
	showSaveButton?: boolean;
}

const DEFAULT_TITLE = getText("calc_estimation_step_header_title");
const DEFAULT_DESCRIPTION = getText("calc_estimation_step_header_description");

export const EstimationStepHeader: React.FC<EstimationStepHeaderProps> = ({
	title = DEFAULT_TITLE,
	description = DEFAULT_DESCRIPTION,
	className = "",
	variant = "desktop",
	onSaveEstimation,
	showSaveButton = false,
}) => {
	const titleClass =
		variant === "mobile"
			? "m-0 p-0 text-center text-[#023248] text-[24px] font-normal leading-[32px]"
			: "text-[#023248] text-2xl md:text-3xl font-semibold mb-3";
	const descClass =
		variant === "mobile"
			? "m-0 p-0 text-center text-[#023248] text-base max-w-[320px] mx-auto"
			: "text-[#023248] text-lg text-gray-600 max-w-[506px] mx-auto";

	return (
		<header className={"font-display pt-0 pb-6 md:pb-10 md:pt-8 text-center " + className}>
			<h2 className={titleClass}>
				{title}
			</h2>
			<div className="flex flex-col md:flex-row justify-center">
				<div className="md:relative md:inline-block md:w-[676px]">
					<p className={descClass} style={{ opacity: variant === "desktop" ? 0.85 : 1 }}>
						{description}
					</p>
					{showSaveButton && onSaveEstimation && (
						<div className="mt-4 flex justify-center md:absolute md:left-full md:top-1/2 md:mt-0 md:ml-20 md:-translate-y-1/2 md:whitespace-nowrap">
							<Button onClick={() => onSaveEstimation()} buttonType="primary" className="w-full md:w-auto">
								{getText("calc_dashboard_save_estimator")}
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};
