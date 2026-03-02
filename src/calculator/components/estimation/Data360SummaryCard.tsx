import React from "react";
import { formatPrice, formatCreditsShort } from "../../utils/estimationFormatters";
import { ProductIcon } from "../icons/ProductIcon";
import { getText } from "../../../utils/textUtils";

export interface Data360SummaryCardProps {
  data360Price?: number;
  data360Credits?: number;
  onViewDetails: () => void;
  /** Reduce padding when 3 cards (both products) */
  compact?: boolean;
}

export const Data360SummaryCard: React.FC<Data360SummaryCardProps> = ({
  data360Price,
  data360Credits,
  onViewDetails,
  compact = false,
}) => {
  const contentClass = compact ? "gap-2 pt-2" : "gap-4 pt-4";

  return (
    <div className="flex min-h-0 flex-col rounded-xl border-gray-100 bg-[#dff1ff] w-full">
      <div className={`flex h-10 shrink-0 items-center gap-2 ${compact ? "mb-2" : "mb-3"}`}>
        <ProductIcon type="data360" size={30} />
        <h3 className="text-[#0B5CAB] font-display text-xl font-normal">{getText("calc_product_data360_name")}</h3>
      </div>
      <div className={`flex flex-1 min-h-0 shrink flex-col justify-between border-t border-white ${contentClass}`}>
        <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-4"}>
          <div className="flex justify-between text-sm">
            <span className="text-[#0A2636] font-sans">{getText("calc_total_cost")}</span>
            <span className="font-semibold text-[#032D60]">
              {formatPrice(data360Price)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#0A2636] font-sans">{getText("calc_flex_credits")}</span>
            <span className="font-semibold text-[#032D60]">
              {data360Credits != null && data360Credits > 0 ? formatCreditsShort(data360Credits) : "—"}
            </span>
          </div>
        </div>
        <div className={`shrink-0 text-right ${compact ? "pt-2" : "pt-6"}`}>
          <button
            type="button"
            onClick={onViewDetails}
            className="text-sm font-bold underline decoration-2 underline-offset-4 hover:opacity-80 text-[#032D60]"
          >
            {getText("calc_view_details")}
          </button>
        </div>
      </div>
    </div>
  );
};
