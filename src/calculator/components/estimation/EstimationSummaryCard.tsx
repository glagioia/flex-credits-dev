import React, { useState, useMemo } from "react";
import type { Estimation, Agentforce } from "@sfdc/eaas/sdk";
import type { EstimationReportData } from "../../pdf/estimationReportData";
import { formatCredits, getCreditsDisplayParts, getPriceDisplayParts } from "../../utils/estimationFormatters";
import { EstimationPrimaryActions } from "./EstimationPrimaryActions";
import { EstimationDetailsModal } from "./EstimationDetailsModal";
import subtractPng from "../home/ui/assets/Subtract.png";
import closeIcon from "../common/ui/close.svg";
import rocketPng from "../home/ui/assets/Rocket.png";
import twoStarsPng from "/images/two-stars.png";
import { OverviewSummaryCard } from "./OverviewSummaryCard";
import { AgentforceSummaryCard } from "./AgentforceSummaryCard";
import { Data360SummaryCard } from "./Data360SummaryCard";
import PieChart, { type Slice } from "../common/PieChart";
import chartIcon from "../home/ui/assets/chartIcon.png";
import { getText } from "../../../utils/textUtils";
export type EstimationSummaryProduct = 'agentforce' | 'data360' | 'both';

export interface EstimationSummaryCardProps {
  totalCredits?: number;
  totalPrice?: number;
  /** Total seats from estimation (employee templates). */
  totalSeats?: number;
  estimation?: Estimation | null;
  onSaveEstimation?: () => void;
  onDownloadReport?: () => void;
  onContactSpecialist?: () => void;
  onAddToDashboard?: () => void;
  variant?: "full" | "compact";
  hasSummary?: boolean;
  /** True when the estimation includes at least one EMPLOYEE-targeted template. */
  hasEmployeeTemplates?: boolean;
  className?: string;
  templates?: Agentforce.Template[];
  /** Primary product for logo and styling: agentforce, data360, or both */
  product?: EstimationSummaryProduct;
  /** Parsed report data for View details modal (template/topic names). Same as PDF. */
  reportData?: EstimationReportData | null;
  /** Called when "View details" is clicked on Agentforce overview card (for analytics). */
  onTrackViewDetailsAgentforce?: () => void;
}

const PRODUCT_COLORS: Record<EstimationSummaryProduct, string> = {
  agentforce: '#0176D3',
  data360: '#022ac0',
  both: '#0176D3',
};

const AGENTFORCE_COLOR = '#00B3FF';
const DATA360_COLOR = '#022ac0';

interface ProductTotals {
  agentforcePrice: number;
  agentforceCredits: number;
  data360Price: number;
  data360Credits: number;
}

function getProductTotals(estimation: Estimation | null | undefined): ProductTotals {
  const out: ProductTotals = { agentforcePrice: 0, agentforceCredits: 0, data360Price: 0, data360Credits: 0 };
  if (!estimation?.config) return out;
  for (const pc of estimation.config) {
    if (pc.product === 'agentforce' && Array.isArray(pc.config)) {
      const items = pc.config as { template?: { price?: number; credits?: number } }[];
      for (const item of items) {
        const template = item.template;
        if (template) {
          out.agentforcePrice += template.price ?? 0;
          out.agentforceCredits += template.credits ?? 0;
        }
      }
    }
    if (pc.product === 'data360') {
      const cfg = pc.config;
      const pcTop = pc as { price?: number; credits?: number };
      if (Array.isArray(cfg)) {
        const items = cfg as { price?: number; credits?: number }[];
        for (const item of items) {
          out.data360Price += typeof item.price === 'number' ? item.price : 0;
          out.data360Credits += typeof item.credits === 'number' ? item.credits : 0;
        }
      } else if (cfg && typeof cfg === 'object') {
        const obj = cfg as { price?: number; credits?: number };
        out.data360Price += typeof obj.price === 'number' ? obj.price : (typeof pcTop.price === 'number' ? pcTop.price : 0);
        out.data360Credits += typeof obj.credits === 'number' ? obj.credits : (typeof pcTop.credits === 'number' ? pcTop.credits : 0);
      }
    }
  }
  return out;
}

export const EstimationSummaryCard: React.FC<EstimationSummaryCardProps> = ({
  totalCredits,
  totalPrice,
  totalSeats,
  estimation,
  onSaveEstimation,
  onDownloadReport,
  onContactSpecialist,
  onAddToDashboard,
  variant = "full",
  hasSummary = true,
  hasEmployeeTemplates = false,
  className = "",
  templates = [],
  product = 'agentforce',
  reportData,
  onTrackViewDetailsAgentforce,
}) => {
  const [detailsProduct, setDetailsProduct] = useState<'agentforce' | 'data360' | null>(null);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const productTotals = useMemo(() => {
    if (reportData?.productTotals) {
      const pt = reportData.productTotals;
      const data360CreditsFromBreakdown = reportData.data360Breakdown?.flexCreditsTotal;
      const data360CreditsFromUseCases = (reportData.data360UseCaseConfigs ?? []).reduce(
        (s, c) => s + (c.credits ?? 0),
        0
      );
      const data360Credits = typeof data360CreditsFromBreakdown === 'number' && data360CreditsFromBreakdown > 0
        ? data360CreditsFromBreakdown
        : data360CreditsFromUseCases;
      return {
        agentforcePrice: pt.agentforcePrice ?? 0,
        agentforceCredits: pt.agentforceCredits ?? 0,
        data360Price: pt.data360Price ?? 0,
        data360Credits,
      };
    }
    return getProductTotals(estimation);
  }, [estimation, reportData]);
  const showBoth = product === 'both';
  const creditsFallback = product === 'both' ? productTotals.agentforceCredits + productTotals.data360Credits : product === 'data360' ? productTotals.data360Credits : productTotals.agentforceCredits;
  const effectiveCredits = (totalCredits != null && totalCredits > 0) ? totalCredits : creditsFallback;
  const creditsDisplay = hasSummary && effectiveCredits != null ? formatCredits(effectiveCredits) : "—";
  const creditsParts = getCreditsDisplayParts(hasSummary ? (effectiveCredits ?? null) : null);
  const priceParts = getPriceDisplayParts(totalPrice);
  const KPI_SUBTITLE = "#444444";
  const KPI_GRADIENT = "linear-gradient(111.12deg, #023248 0.03%, #022AC0 38.26%, #066AFE 73.93%, #00B3FF 108.6%)";
  const productColor = PRODUCT_COLORS[product];
  const totalForPie = productTotals.agentforcePrice + productTotals.data360Price;
  const rawAf = totalForPie > 0 ? (productTotals.agentforcePrice / totalForPie) * 100 : 50;
  const rawD3 = totalForPie > 0 ? (productTotals.data360Price / totalForPie) * 100 : 50;
  const agentforcePct = rawAf > 0 && rawAf < 1 ? 1 : Math.round(rawAf);
  const data360Pct = rawD3 > 0 && rawD3 < 1 ? 1 : Math.round(rawD3);

  return (
    <div
      className={`relative isolate mx-auto w-full overflow-visible flex flex-col items-center self-stretch gap-6 py-6 px-4 rounded-[20px] border-2 border-white/25 bg-[rgba(144,208,254,0.5)] shadow-[0_10px_10px_0_rgba(6,106,254,0.2)] md:border-0 md:rounded-none md:bg-transparent md:shadow-none md:py-16 md:px-16 md:gap-0 md:self-auto ${showBoth ? 'md:max-w-[1280px]' : totalSeats > 0 ?  'md:max-w-[900px]' : 'md:max-w-[800px]'} ${className}`}
    >
      {/* Background and decorative images */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none invisible md:visible"
        style={{
          backgroundImage: `url(${subtractPng})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden
      />
      <img
        src={rocketPng}
        alt=""
        className="absolute pointer-events-none z-10 w-[247px] h-[247px] object-contain -translate-x-1/4 invisible md:visible"
        style={{ top: "-20px", left: "-55px" }}
        aria-hidden
      />
      <img
        src={twoStarsPng}
        alt=""
        className="absolute -right-4 bottom-[60px] md:bottom-[40px] pointer-events-none z-0 w-[100px] h-[120px] md:w-[120px] md:h-[140px] object-contain visible opacity-70  translate-x-1/2 md:translate-x-1/4 "
        aria-hidden
      />
      {/* 1. KPIs Superiores — Figma: gradient on number+suffix, unit and subtitle muted; equal row height so subtitles align; Credits | Seats | Price */}
      <div className="mb-0 flex w-full flex-col items-center justify-center gap-12 md:mb-14 md:flex-row md:items-end md:gap-24">
        <div className="text-center">
          <div className="flex min-h-[4rem] items-center md:items-end justify-center gap-0.5 md:min-h-[5rem]">
            <span
              className="text-[56px] font-bold md:text-7xl bg-clip-text text-transparent font-display"
              style={{ backgroundImage: KPI_GRADIENT }}
            >
              {creditsParts.main}{creditsParts.suffix}
            </span>
            {creditsParts.unit && (
              <span className="ml-1 text-2xl font-semibold md:text-3xl text-[#032D60] font-display">{creditsParts.unit}</span>
            )}
          </div>
          <p className="mt-2 md:text-lg font-sans font-bold text-[#032D60]">{getText("calc_rounded_up_credits")}</p>
        </div>
        {totalSeats != null && totalSeats > 0 && (
          <div className="text-center">
            <div className="flex min-h-[4rem] items-end justify-center gap-0.5 md:min-h-[5rem]">
              <span
                className="text-[56px] font-bold md:text-7xl bg-clip-text text-transparent font-display"
                style={{ backgroundImage: KPI_GRADIENT }}
              >
                {totalSeats}
              </span>
            </div>
            <p className="mt-2 text-base font-bold md:text-lg font-sans" style={{ color: KPI_SUBTITLE }}>{getText("calc_seats")}</p>
          </div>
        )}
        <div className="text-center">
          <div className="flex min-h-[4rem] flex-wrap items-end justify-center gap-0.5 md:min-h-[5rem]">
            {priceParts.currencySymbol && (
              <span
                className="self-start pt-1 text-2xl font-bold md:text-3xl leading-none font-display"
                style={{ color: '#023248' }}
              >
                {priceParts.currencySymbol}
              </span>
            )}
            <span
              className="text-[56px] font-bold md:text-7xl bg-clip-text text-transparent leading-none font-display"
              style={{ backgroundImage: KPI_GRADIENT }}
            >
              {priceParts.main}{priceParts.suffix}
            </span>
          </div>
          <p className="mt-2 md:text-lg font-sans font-bold text-[#032D60]">{getText("calc_estimated_list_price")}</p>
        </div>
      </div>

      {/* Mobile: botón "View detailed breakdown" cuando hay 2 productos — el gráfico va en modal */}
      {showBoth && (
        <div className="md:hidden w-full flex justify-center">
          <button
            type="button"
            onClick={() => setBreakdownModalOpen(true)}
            className="flex items-center gap-2 text-sm font-bold underline decoration-2 underline-offset-4 hover:opacity-80 text-[#032D60]"
          >
            <img src={chartIcon} alt="" className="w-4 h-4" />
            <span>{getText("calc_view_detailed_breakdown")}</span>
          </button>
        </div>
      )}

      {/* 2. Tarjetas: Overview | Agentforce | Data 360 — 50/50 si 1 producto, 33% cada una si both */}
      {variant === "full" && (
        <div className="w-full mx-auto mb-12 flex justify-center max-w-[1200px]">
          <div className="flex w-full flex-col lg:flex-row items-center justify-center gap-8">
            <div className={`rounded-[32px] shadow-2xl border border-white bg-[#dff1ff] overflow-hidden p-4 md:p-6 ${showBoth ? "w-full lg:min-w-0 lg:flex-1" : "w-full"}`}>
              <div
                className={`grid gap-4 md:gap-6 min-h-0 ${
                  showBoth ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                <OverviewSummaryCard
                  totalPrice={totalPrice}
                  totalCredits={effectiveCredits ?? undefined}
                  creditsDisplay={creditsDisplay}
                  compact={showBoth}
                />
                {(product === "agentforce" || product === "both") && (
                  <AgentforceSummaryCard
                    agentforcePrice={productTotals.agentforcePrice}
                    includedCreditsAgentforce1Edition={hasEmployeeTemplates ? 2_500_000 : undefined}
                    hasEmployeeTemplates={hasEmployeeTemplates}
                    onViewDetails={() => setDetailsProduct("agentforce")}
                    onTrackViewDetails={onTrackViewDetailsAgentforce}
                    compact={showBoth}
                  />
                )}
                {(product === "data360" || product === "both") && (
                  <Data360SummaryCard
                    data360Price={productTotals.data360Price}
                    data360Credits={productTotals.data360Credits}
                    onViewDetails={() => setDetailsProduct("data360")}
                    compact={showBoth}
                  />
                )}
              </div>
            </div>

            {showBoth && (
              <div className="flex max-md:hidden shrink-0 min-w-[260px] items-center justify-center p-4">
                <PieChart
                  data={[
                    { label: getText("calc_product_data360_name"), color: "#022ac0", percentage: data360Pct },
                    { label: getText("calc_product_agentforce_name"), color: "#00B3FF", percentage: agentforcePct },
                  ]}
                  size={143}
                  showLegend
                />
              </div>
            )}
          </div>
        </div>
      )}

      <EstimationDetailsModal
        open={detailsProduct !== null}
        product={detailsProduct ?? 'agentforce'}
        onClose={() => setDetailsProduct(null)}
        reportData={reportData}
      />

      {/* Modal: Product Detailed Breakdown (pie chart) — solo mobile cuando hay 2 productos */}
      {breakdownModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setBreakdownModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="breakdown-modal-title"
        >
          <div
            className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden flex flex-col bg-[#EFF7FF] p-6"
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#D8E6F1]">
              <h2 id="breakdown-modal-title" className="text-xl font-bold text-[#032D60] font-display">
                {getText("calc_product_detailed_breakdown")}
              </h2>
              <button
                type="button"
                onClick={() => setBreakdownModalOpen(false)}
                className="p-2 text-[#032D60] hover:bg-white/50 rounded-full transition-colors"
                aria-label="Close"
              >
                <img src={closeIcon} alt="" className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center">
              <PieChart
                data={[
                  { label: getText("calc_product_data360_name"), color: "#022ac0", percentage: data360Pct },
                  { label: getText("calc_product_agentforce_name"), color: "#00B3FF", percentage: agentforcePct },
                ]}
                size={180}
                showLegend
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Botones Inferiores */}
      <div className="flex justify-center pb-8">
        <EstimationPrimaryActions
          estimation={estimation}
          onSaveEstimation={onSaveEstimation}
          onDownloadReport={onDownloadReport}
          onContactSpecialist={onContactSpecialist}
          onAddToDashboard={onAddToDashboard}
        />
      </div>
    </div>
  );
};
