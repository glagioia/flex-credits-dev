import React from "react";
import { formatPrice } from "../../utils/estimationFormatters";
import { getText } from "../../../utils/textUtils";

export interface OverviewSummaryCardProps {
  totalPrice?: number;
  totalCredits?: number;
  creditsDisplay: string;
  /** Reduce padding when 3 cards (both products) */
  compact?: boolean;
}

export const OverviewSummaryCard: React.FC<OverviewSummaryCardProps> = ({
  totalPrice,
  totalCredits,
  creditsDisplay,
  compact = false,
}) => (
  <div className="w-full flex flex-col min-h-0 rounded-xl border-gray-100 bg-[#dff1ff]">
    <div className="flex h-10 shrink-0 items-center mb-2">
      <h3 className="text-[#0B5CAB] font-display text-xl font-normal">{getText("calc_overview")}</h3>
    </div>
    <div
      className={`flex flex-1 min-h-0 shrink flex-col border-t border-white ${compact ? "gap-2 pt-2" : "gap-4 pt-4"}`}
    >
        <div className="flex justify-between text-sm">
          <span className="text-[#0A2636] font-sans">{getText("calc_total_price")}</span>
          <span className="font-semibold text-[#0A2636]">{formatPrice(totalPrice, false)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#0A2636] font-sans">{getText("calc_total_credits")}</span>
          <span className="font-semibold text-[#0A2636] font-sans">{creditsDisplay}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#0A2636] font-sans">{getText("calc_cost_per_credit")}</span>
          <span className="font-semibold text-[#0A2636] font-sans">
            {totalCredits != null && totalCredits > 0 && totalPrice != null
              ? formatPrice(totalPrice / totalCredits, false)
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );