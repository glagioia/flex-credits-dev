import React from "react";
import { formatCredits, formatPrice } from "../../utils/estimationFormatters";
import { getText } from "../../../utils/textUtils";
import { Tooltip } from "../common";

export interface EstimationMetricsProps {
	type: "agentforce" | "data360";
	totalCredits?: number;
	totalPrice?: number;
	/** Total seats (employee templates); block shown only when > 0 */
	totalSeats?: number;
	showCreditsLabel?: string;
	showPriceLabel?: string;
	showCreditsInfoIcon?: boolean;
	className?: string;
}

export const EstimationMetrics: React.FC<EstimationMetricsProps> = ({
	type,
	totalCredits = 75000,
	totalPrice = 195000,
	totalSeats,
	showCreditsLabel = getText("calc_rounded_up_credits"),
	showPriceLabel = getText("calc_estimated_list_price"),
	showCreditsInfoIcon = true,
	className = "",
}) => {
	const textPrimary = "text-[#032D60]";
	const textSecondary = "text-[#032D60]";

	return (
		<div className={`flex w-full flex-col items-center py-10 font-sans ${className}`}>
			{/* Encabezado centrado */}
			<div className="mb-12 text-center">
				<h2 className={`${textPrimary} mb-2 font-display text-2xl md:text-4xl font-bold tracking-tight`}>
					{type === "agentforce" ? getText("calc_estimation_pricing_summary_title") : getText("calc_data360_pricing_summary_title")}
				</h2>
				<p className={`font-sans text-[20px] font-medium text-[#181818]`}>{getText("calc_estimation_refine_yearly")}</p>
			</div>

			{/* Métricas alineadas horizontalmente */}
			<div className="flex flex-col md:flex-row w-full items-center justify-center gap-8 md:gap-16">
				{/* Bloque Créditos */}
				<div className="flex flex-col items-center">
					<div className="flex items-baseline gap-2">
						<span className={`${textPrimary} font-display text-5xl font-bold text-[#0B5CAB]`}>
							{totalCredits != null ? formatCredits(totalCredits, false) : "0"}
						</span>
						<span className={`${textSecondary} font-display text-[32px] font-bold`}>{getText("calc_credits")}</span>
					</div>
					<div className={`${textSecondary} mt:0 md:mt-2 flex items-center gap-1 font-sans text-[20px] font-bold`}>
						{showCreditsLabel}
						{showCreditsInfoIcon && (
							<span className="ml-2"><Tooltip content={getText("calc_rounded_up_credits")} /></span>
						)}
					</div>
				</div>

				{totalSeats != null && totalSeats > 0 && (
					<div className="flex flex-col items-center">
						<div className="flex items-baseline gap-2">
							<span className={`${textPrimary} font-display text-5xl font-bold text-[#0B5CAB]`}>
								{totalSeats.toLocaleString("en-US", { maximumFractionDigits: 0 })}
							</span>
						</div>
						<div className={`${textSecondary} mt:0 md:mt-2 flex items-center gap-1 font-sans text-[20px] font-bold`}>
							{getText("calc_seats")}
							{showCreditsInfoIcon && (
								<span className="ml-2"><Tooltip content={getText("calc_seats")} /></span>
							)}
						</div>
					</div>
				)}

				{/* Bloque Precio */}
				<div className="flex flex-col items-center">
					<div className="flex items-baseline gap-1">
						<span className={`${textPrimary} font-display text-5xl font-bold text-[#0B5CAB]`}>
							<sup className={`${textSecondary} inline-block -translate-y-3 font-display text-[32px] font-bold`}>$</sup>
							{formatPrice(totalPrice, false, false)}
						</span>
					</div>
					<span className={`${textSecondary} mt-2 font-sans text-[20px] font-bold`}>{showPriceLabel}</span>
				</div>
			</div>
		</div>
	);
};
