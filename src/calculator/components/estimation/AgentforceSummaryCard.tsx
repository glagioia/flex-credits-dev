import React from "react";
import { formatPrice, formatCreditsShort } from "../../utils/estimationFormatters";
import { ProductIcon } from "../icons/ProductIcon";
import { getText } from "../../../utils/textUtils";

export interface AgentforceSummaryCardProps {
  agentforcePrice: number;
  /** Credits from Agentforce config (sum of template credits). When undefined, shows "—". */
  includedCreditsAgentforce1Edition?: number;
  onViewDetails: () => void;
  onTrackViewDetails?: () => void;
  /** Reduce padding when 3 cards (both products) */
  compact?: boolean;
  hasEmployeeTemplates?: boolean;
}

export const AgentforceSummaryCard: React.FC<AgentforceSummaryCardProps> = ({
  agentforcePrice,
  includedCreditsAgentforce1Edition,
  onViewDetails,
  onTrackViewDetails,
  compact = false,
  hasEmployeeTemplates = false,
}) => {
  const handleClick = () => {
    onTrackViewDetails?.();
    onViewDetails();
  };
  const includedCreditsDisplay = includedCreditsAgentforce1Edition != null && includedCreditsAgentforce1Edition > 0
    ? formatCreditsShort(includedCreditsAgentforce1Edition)
    : "—";
  const contentClass = compact ? "gap-2 pt-2" : "gap-4 pt-4";

  return (
    <div className="flex min-h-0 flex-col rounded-xl border-gray-100 bg-[#dff1ff] w-full">
      <div className={`flex h-10 shrink-0 items-center gap-2 ${compact ? "mb-2" : "mb-3"}`}>
        <ProductIcon type="agentforce" size={30} />
        <h3 className="text-[#0B5CAB] font-display text-xl font-normal">{getText("calc_product_agentforce_name")}</h3>
      </div>
      <div className={`flex flex-1 min-h-0 shrink flex-col justify-between border-t border-white ${contentClass}`}>
        <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-4"}>
          <div className="flex justify-between text-sm">
            <span className="text-[#0A2636] font-sans">{getText("calc_total_cost")}</span>
            <span className="font-semibold text-[#0A2636] font-sans">
              {formatPrice(agentforcePrice, false)}
            </span>
          </div>
      {hasEmployeeTemplates && <div className="flex justify-between text-sm">
            <span className="text-[#0A2636] font-sans">{getText("calc_included_credits_agentforce")}</span>
            <span className="font-semibold text-[#032D60]">{includedCreditsDisplay}</span>
          </div>}
        </div>
        <div className={`shrink-0 text-right ${compact ? "pt-2" : "pt-6"}`}>
          <button
            type="button"
            onClick={handleClick}
            className="text-sm font-bold underline decoration-2 underline-offset-4 hover:opacity-80 text-[#032D60]"
          >
            {getText("calc_view_details")}
          </button>
        </div>
      </div>
    </div>
  );
};
