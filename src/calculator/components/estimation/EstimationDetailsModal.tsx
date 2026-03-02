import React from 'react';
import type { EstimationReportData } from '../../pdf/estimationReportData';
import { getText } from '../../../utils/textUtils';
import type { TemplateConfigSummary } from '../../types/EstimationSummary';
import { formatCredits, formatPrice } from '../../utils/estimationFormatters';
import { ProductIcon } from '../icons/ProductIcon';
import closeIcon from '../common/ui/close.svg';

export type EstimationDetailsModalProduct = 'agentforce' | 'data360';

export interface EstimationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  /** Which product details to show (set by which card opened the modal). */
  product?: EstimationDetailsModalProduct;
  reportData?: EstimationReportData | null;
}

function getActiveTopicNames(config: TemplateConfigSummary): string[] {
  const names: string[] = [];
  (config.topics ?? []).forEach((topic) => {
    const credits = config.topicCredits?.[topic.id] ?? 0;
    const disabled = config.disabledTopics?.[topic.id] === true;
    if (credits > 0 && !disabled && topic.displayName) {
      names.push(topic.displayName);
    }
  });
  return names;
}

export const EstimationDetailsModal: React.FC<EstimationDetailsModalProps> = ({
  open,
  onClose,
  product = 'agentforce',
  reportData,
}) => {
  if (!open) return null;

  const isData360 = product === 'data360';
  const data360Price = reportData?.productTotals?.data360Price ?? 0;
  const flexCreditsCost = Math.round(data360Price * 0.7);
  const profilesCost = data360Price - flexCreditsCost;
  const useCaseConfigs = reportData?.data360UseCaseConfigs ?? [];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="estimation-details-title"
    >
      <div
        className="relative mx-4 flex max-h-[90vh] w-full max-w-[587px] flex-col overflow-hidden rounded-2xl bg-[#EFF7FF] md:max-h-none"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#D8E6F1] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 shrink-0 block [&_svg]:w-full [&_svg]:h-full">
              <ProductIcon type={isData360 ? 'data360' : 'agentforce'} />
            </span>
            <span
              id="estimation-details-title"
              className="text-xl font-bold text-[#0B5CAB] font-display"
            >
              {isData360 ? getText("calc_product_data360_name") : getText("calc_product_agentforce_name")}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#0A2636] hover:bg-white/50 rounded-full transition-colors font-bold text-lg leading-none"
            aria-label="Close"
          >
            <img src={closeIcon} alt="" className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {isData360 ? (
            <Data360DetailsContent
              flexCreditsCost={flexCreditsCost}
              profilesCost={profilesCost}
              totalCost={data360Price}
              useCaseConfigs={useCaseConfigs}
            />
          ) : (
            <AgentforceDetailsContent reportData={reportData} />
          )}
        </div>
      </div>
    </div>
  );
};

function Data360DetailsContent({
  totalCost,
  flexCreditsCost,
  profilesCost,
  useCaseConfigs,
}: {
  totalCost: number;
  flexCreditsCost: number;
  profilesCost: number;
  useCaseConfigs: { title: string; price: number }[];
}) {
  return (
    <div className="space-y-1 text-sm text-[#0A2636]">
      {/* Column headers: Flex Only | Profiles & Flex */}
      <div className="grid grid-cols-[50%_25%_25%] gap-2 pb-2 border-b border-[#D8E6F1] md:gap-4">
        <span />
        <span className="text-left font-bold w-28">{getText("calc_flex_only")}</span>
        <span className="text-left font-bold w-28">{getText("calc_profiles_and_flex")}</span>
      </div>
      {/* Total cost */}
      <div className="grid grid-cols-[50%_25%_25%] gap-2 py-2 font-bold md:gap-4">
        <span>{getText("calc_total_cost")}</span>
        <span className="text-left w-28">{formatPrice(flexCreditsCost)}</span>
        <span className="text-left w-28">{formatPrice(totalCost)}</span>
      </div>
      {/* Savings from Volume */}
      <div className="grid grid-cols-[50%_25%_25%] gap-2 py-1.5 font-bold md:gap-4">
        <span className="text-left font-normal">{getText("calc_savings_from_volume")}</span>
        <span className="text-left w-28">—</span>
        <span className="text-left w-28">—</span>
      </div> 
      {/* Profiles */}
      <div className="grid grid-cols-[50%_25%_25%] gap-2 py-1.5 font-bold md:gap-4">
        <span>{getText("calc_profiles")}</span>
        <span className="text-left w-28">{formatPrice(0)}</span>
        <span className="text-left w-28">{formatPrice(profilesCost)}</span>
      </div>
      {/* Flex Credits */}
      <div className="grid grid-cols-[50%_25%_25%] gap-2 py-1.5 font-bold md:gap-4">
        <span>{getText("calc_flex_credits_label")}</span>
        <span className="text-left w-28">{formatPrice(flexCreditsCost)}</span>
        <span className="text-left w-28">{formatPrice(flexCreditsCost)}</span>
      </div>
      {/* Flex Credits sub-items (use cases) */}
      {useCaseConfigs.length > 0 && (
        <div className="mt-1 border-t border-[#F3F3F3] pt-2">
          {useCaseConfigs.map((uc) => {
            const flexOnly = Math.round(uc.price * 0.7);
            return (
              <div
                key={uc.title}
                className="grid grid-cols-[50%_25%_25%] gap-2 py-1 pl-4 font-normal text-[#032D60] md:gap-4"
              >
                <span className="text-[#6B7280]">{uc.title}</span>
                <span className="text-left w-28">{formatPrice(flexOnly)}</span>
                <span className="text-left w-28">{formatPrice(uc.price)}</span>
              </div>
            );
          })}
        </div>
      )}
      {useCaseConfigs.length === 0 && totalCost === 0 && (
        <p className="text-sm py-4 text-[#032D60]">{getText("calc_no_data360_items_configured")}</p>
      )}
    </div>
  );
}

function AgentforceDetailsContent({
  reportData,
}: {
  reportData?: EstimationReportData | null;
}) {
  const customerConfigs = (reportData?.templateConfigs ?? []).filter(
    (c) => c.template.targetAudience === 'CUSTOMER'
  );
  const employeeConfigs = (reportData?.templateConfigs ?? []).filter(
    (c) => c.template.targetAudience === 'EMPLOYEE'
  );
  const totalCost = reportData?.totalPrice;
  const data360Price = reportData?.productTotals?.data360Price ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[50%_25%_25%] gap-2 rounded py-2 px-2">
        <span className="font-bold text-[#0A2636] text-sm text-right"></span>
        <span className="font-bold text-[#0A2636] text-sm">{getText("calc_flex_credits_label")}</span>
        <span className="text-left text-sm font-bold text-[#0A2636]">{getText("calc_cost")}</span>
        </div>
      <div className="flex items-center grid grid-cols-[50%_25%_25%] gap-2 py-2 px-2 rounded">
        <span className="font-bold text-[#0A2636] text-sm">{getText("calc_total_cost")}</span>
        <span className="font-bold text-[#0A2636] text-sm text-right"></span>
        <span className="font-bold text-[#0A2636] text-sm text-left">{formatPrice(totalCost)}</span>
      </div>
      {employeeConfigs.length > 0 && (
        <div className="border-b border-[#D8E6F1] pb-1">
          <div className="grid grid-cols-[50%_25%_25%] gap-2 py-1.5 text-sm text-[#0A2636]">
            <span className="text-left text-sm">{getText("calc_employee_a1e_included")}</span>
            <span className="text-left text-sm font-bold">—</span>
            <span className="text-left text-sm font-bold">{formatPrice(0)}</span>
          </div>
        </div>
      )}

      {customerConfigs.length > 0 && (
        <>
          <div className="border-b border-[#D8E6F1] pb-1">
            <div className="grid grid-cols-[50%_25%_25%] gap-2 py-1.5 text-sm font-bold text-[#0A2636]">
              <span className="text-left text-sm">{getText("calc_customer_facing_agents")}</span>
              <span className="text-left text-sm">{getText("calc_flex_credits_label")}</span>
              <span className="text-left text-sm">{getText("calc_cost")}</span>
            </div>
          </div>
          {customerConfigs.map((cfg) => (
            <div
              key={cfg.template.id}
              className="grid grid-cols-[50%_25%_25%] gap-2 py-1.5 text-sm text-[#0A2636] border-b border-[#F3F3F3]"
            >
              <span>{cfg.template.displayName ?? cfg.template.id}</span>
              <span className="text-left font-medium">{formatCredits(cfg.templateCredits)}</span>
              <span className="text-left font-medium">{formatPrice(cfg.templatePrice)}</span>
            </div>
          ))}
        </>
      )}

      {employeeConfigs.length > 0 && (
        <>
          <div className="border-b border-[#D8E6F1] pb-1">
            <div className="grid grid-cols-[50%_25%_25%] gap-2 py-1.5 text-sm font-bold text-[#0A2636]">
              <span className="text-left">{getText("calc_employee_facing_agents")}</span>
              <span className="text-left">{getText("calc_seats")}</span>
              <span className="text-left">{getText("calc_cost")}</span>
            </div>
          </div>
          {employeeConfigs.map((cfg) => {
            const topicNames = getActiveTopicNames(cfg);
            return (
              <div key={cfg.template.id} className="border-b border-[#F3F3F3] py-2">
                <div className="grid grid-cols-[50%_25%_25%] gap-2 text-sm text-[#0A2636] items-center">
                  <div>
                    <span>{cfg.template.displayName ?? cfg.template.id}</span>
                    {topicNames.length > 0 && (
                      <p className="text-xs text-[#6B7280] mt-0.5 ml-4">
                        {topicNames.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-left font-medium">{cfg.templateCredits}{getText("calc_seats_suffix")}</span>
                  <span className="text-left font-medium">{formatPrice(cfg.templatePrice)}</span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {data360Price > 0 && (
        <>
          <div className="border-t border-[#D8E6F1] pt-4" />
          <div className="grid grid-cols-[50%_25%_25%] gap-2 py-1.5 text-sm font-bold text-[#0A2636]">
            <span>{getText("calc_data360_enhancements")}</span>
            <span />
            <span className="font-medium">{formatPrice(data360Price)}</span>
          </div>
        </>
      )}

      {!reportData?.templateConfigs?.length && data360Price === 0 && (
        <p className="text-sm text-[#032D60] py-4">{getText("calc_no_items_configured")}</p>
      )}
    </div>
  );
}
