import React from "react";
import { getCreditsDisplayParts, getPriceDisplayParts } from "../../utils/estimationFormatters";
import { getText } from "../../../utils/textUtils";
import rocketPng from "../home/ui/assets/Rocket.png";
import twoStarsPng from "/images/two-stars.png";
import { ProductIcon } from "../icons";
import bombPng from "../home/ui/assets/bomb.svg";
export interface StickyEstimationBannerProps {
	totalCredits?: number;
	totalPrice?: number;
	hasSummary?: boolean;
}

const BANNER_GRADIENT = "linear-gradient(90deg, #023248 0%, #022AC0 38%, #066AFE 74%, #00B3FF 100%)";

export const StickyEstimationBanner: React.FC<StickyEstimationBannerProps> = ({
	totalCredits,
	totalPrice,
	hasSummary = true,
}) => {
	const creditsParts = getCreditsDisplayParts(hasSummary ? (totalCredits ?? null) : null);
	const priceParts = getPriceDisplayParts(totalPrice);

	return (
		<div
			className="fixed left-0 right-0 top-0 z-[60] flex h-[94px] w-full items-center justify-center overflow-hidden"
			style={{
				background: BANNER_GRADIENT,
				boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
			}}
		>
			{/* Decorative: rocket left */}
			<img src={rocketPng} alt="" className="invisible md:visible" style={{ maxWidth: "120px" }} aria-hidden />

			{/* Content: Credits + Price */}
			<div className="flex w-full max-w-[1200px] flex-1 items-center justify-center gap-12 px-4 md:gap-20">
				<div className="invisible flex flex-col items-center text-center font-display text-[16px] font-bold text-[#00B3FF] md:visible">
					{getText("calc_total_yearly_estimation")}{" "}
				</div>
				<div className="flex flex-col items-center text-center">
					<div className="flex items-baseline gap-1">
						<span className="font-display text-[40px] font-bold text-white">
							{creditsParts.main}
							{creditsParts.suffix}
						</span>
						{creditsParts.unit && (
							<span className="font-display text-lg font-semibold text-white/95 md:text-xl">{creditsParts.unit}</span>
						)}
					</div>
					<p className="-translate-y-2 font-sans text-[12px] font-bold text-white/90">
						{getText("calc_rounded_up_credits")}
					</p>
				</div>

				<div className="flex flex-col items-center text-center">
					<div className="flex items-baseline">
						{priceParts.currencySymbol && (
							<sup className="mr-0.5 -translate-y-3 font-display text-[20px] font-bold text-white">
								{priceParts.currencySymbol}
							</sup>
						)}
						<span className="font-display text-[40px] font-bold text-white">
							{priceParts.main}
							{priceParts.suffix}
						</span>
					</div>
					<p className="-translate-y-2 font-sans text-[12px] font-bold text-white/90">
						{getText("calc_estimated_list_price")}
					</p>
				</div>
				<div className="invisible flex items-center gap-2 text-center md:visible">
					<ProductIcon type={"agentforce"} size={27} />
					<p className="text-[12px] font-bold text-white/90">{getText("calc_product_agentforce_name")}</p>
				</div>
			</div>

			{/* Decorative: stars right */}
			<div className="flex items-center justify-end gap-2">
				<img src={twoStarsPng} alt="" className="invisible h-[60px] w-[50px] object-cover md:visible" aria-hidden />
				<img src={bombPng} alt="" className="invisible md:visible h-[80px] w-[80px] object-cover translate-y-1/3" />
			</div>
		</div>
	);
};
