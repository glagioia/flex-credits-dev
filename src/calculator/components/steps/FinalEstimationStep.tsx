import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { Estimation, Agentforce, Data360 } from '@sfdc/eaas/sdk';
import type { TemplateConfigSummary } from '../../types/EstimationSummary';
import type { EstimationSummaryProduct } from '../estimation';
import type { EstimationReportData } from '../../pdf/estimationReportData';
import { EstimationStepHeader, EstimationSummaryCard, StickyEstimationBanner, TemplateConfigAccordion, Data360UseCaseAccordion, EstimationPrimaryActions } from '../estimation';
import type { Data360UseCaseConfigSummary } from '../estimation';
import { getText } from '../../../utils/textUtils';
export interface FinalEstimationStepProps {
  onReset?: () => void;
  estimation?: Estimation | null;
  /** Parsed report data (template/topic names, totals). Used by View details modal and PDF. */
  reportData?: EstimationReportData | null;
  /** Optional templates for display names (if not embedded in estimation) */
  templates?: Agentforce.Template[];
  /** Optional topics cache (templateId -> topics) */
  templateTopics?: Record<string, Agentforce.Topic[]>;
  /** Data360 use cases (for Data360 product display) */
  useCases?: Data360.UseCase[];
  onDownloadReport?: () => void;
  onContactSpecialist?: () => void;
  onTopicInputChange?: (templateId: string, topicId: string, values: Record<string, number>) => void;
  onTopicToggle?: (templateId: string, topicId: string, enabled: boolean) => void;
  onAddTemplate?: () => void;
  onHideTemplate?: (templateId: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
  /** Template IDs excluded from total credits/price (templates still shown in list, toggle in UI). */
  excludedFromCalculationsTemplateIds?: Set<string>;
  /** Called when "Add to dashboard" is clicked (e.g. navigate to STEP_SELECT_PRODUCT). */
  onAddToDashboard?: () => void;
  /** Called before Add Template in Agentforce section (for analytics). */
  onTrackAddAgentforceTemplate?: () => void;
  /** Called when "View details" is clicked on Agentforce overview card (for analytics). */
  onTrackViewDetailsAgentforce?: () => void;
  /** Called when "Save estimation" is clicked. */
  onSaveEstimation?: () => void;
  variant?: 'desktop' | 'mobile';
  /** Gating SKU options per template (for editing employee templates in estimation step). */
  templateGatingSKUs?: Record<string, Agentforce.GatingSku[]>;
  /** Called when user changes seats or SKU for an employee template in estimation step. */
  onEmployeeTemplateConfigChange?: (templateId: string, values: { seats: number; skuId: string | null }) => void | Promise<void>;
  /** Called when user changes use case input values in Data360 accordion (estimation step). */
  onUseCaseInputChange?: (useCaseId: string, values: Record<string, number>) => void;
}

/**
 * Build TemplateConfigSummary from Agentforce.EstimationConfigItem for backward compatibility
 * with existing UI components.
 */
function buildTemplateConfigSummary(
  configItem: Agentforce.EstimationConfigItem,
  templates: Agentforce.Template[],
  templateTopics: Record<string, Agentforce.Topic[]>
): TemplateConfigSummary | null {
  const template = templates.find((t) => t.id === configItem.template.templateId);
  if (!template) return null;

  const topics = templateTopics[configItem.template.templateId] || template.topics || [];

  const topicCredits: Record<string, number> = {};
  const topicPrices: Record<string, number> = {};
  const disabledTopics: Record<string, boolean> = {};
  const topicInputValues: Record<string, Record<string, number>> = {};

  configItem.template.topics?.forEach((topicConfig) => {
    topicCredits[topicConfig.topicId] = topicConfig.credits;
    topicPrices[topicConfig.topicId] = topicConfig.price;
    disabledTopics[topicConfig.topicId] = topicConfig.selected === false;

    const topicDef = topics.find((t) => t.id === topicConfig.topicId);
    const values: Record<string, number> = {};
    topicConfig.inputs.forEach((input) => {
      const v = input.value as number;
      const inputDef = topicDef?.inputs?.find((i) => i.key === input.inputKey);
      const displayVal = inputDef?.dataType === "PERCENT" && v <= 1 ? Math.round(v * 100) : v;
      values[input.inputKey] = displayVal;
    });
    topicInputValues[topicConfig.topicId] = values;
  });

  const templateFromItem = configItem.template as { seats?: number; gatingSkuId?: string };
  return {
    template,
    topics,
    topicCredits,
    topicPrices,
    templateCredits: configItem.template.credits ?? 0,
    templatePrice: configItem.template.price ?? 0,
    disabledTopics,
    topicInputValues,
    templateSeats: templateFromItem.seats,
    gatingSkuId: templateFromItem.gatingSkuId ?? null,
  };
}

interface Data360ConfigItem {
  useCaseId?: string;
  id?: string;
  price?: number;
  [key: string]: unknown;
}

const FinalEstimationStep: React.FC<FinalEstimationStepProps> = ({
  onReset,
  estimation,
  reportData,
  templates = [],
  templateTopics = {},
  useCases = [],
  onDownloadReport,
  onContactSpecialist,
  onTopicInputChange,
  onTopicToggle,
  onAddTemplate,
  onHideTemplate,
  onDeleteTemplate,
  excludedFromCalculationsTemplateIds,
  onAddToDashboard,
  onTrackAddAgentforceTemplate,
  onTrackViewDetailsAgentforce,
  onSaveEstimation,
  variant = 'desktop',
  templateGatingSKUs = {},
  onEmployeeTemplateConfigChange,
  onUseCaseInputChange,
}) => {
  useEffect(() => {
    console.log('estimation (FinalEstimationStep)', estimation);
  }, [estimation]);

  useEffect(() => {
    if (reportData && (reportData.product === 'data360' || reportData.product === 'both')) {
      console.log('reportData Data360 (PDF)', {
        product: reportData.product,
        productTotals: reportData.productTotals,
        data360Breakdown: reportData.data360Breakdown,
        data360UseCaseConfigs: reportData.data360UseCaseConfigs,
      });
    }
  }, [reportData]);

  const { totalCredits, totalPrice, totalSeats, templateConfigs, data360UseCaseConfigs, product, hasAgentforce, hasData360, agentforceCredits, agentforcePrice, data360Credits, data360Price } = useMemo(() => {
    if (!estimation?.config) {
      return {
        totalCredits: 0,
        totalPrice: undefined as number | undefined,
        totalSeats: 0,
        templateConfigs: [] as TemplateConfigSummary[],
        data360UseCaseConfigs: [] as Data360UseCaseConfigSummary[],
        product: 'agentforce' as EstimationSummaryProduct,
        hasAgentforce: false,
        hasData360: false,
        agentforceCredits: 0,
        agentforcePrice: undefined as number | undefined,
        data360Credits: 0,
        data360Price: undefined as number | undefined,
      };
    }
    const configs: TemplateConfigSummary[] = [];
    const d360Configs: Data360UseCaseConfigSummary[] = [];
    let credits = 0;
    let price = 0;
    let agentforceCreditsVal = 0;
    let agentforcePriceVal = 0;
    let data360CreditsVal = 0;
    let data360PriceVal = 0;
    let hasA = false;
    let hasD = false;
    const excluded = excludedFromCalculationsTemplateIds ?? new Set<string>();

    for (const productConfig of estimation.config) {
      if (productConfig.product === 'agentforce' && Array.isArray(productConfig.config)) {
        hasA = true;
        const agentforceItems = productConfig.config as Agentforce.EstimationConfigItem[];
        for (const item of agentforceItems) {
          const summary = buildTemplateConfigSummary(item, templates, templateTopics);
          if (summary) {
            configs.push(summary);
          }
          if (!excluded.has(item.template.templateId)) {
            const c = item.template.credits ?? 0;
            const p = item.template.price ?? 0;
            credits += c;
            price += p;
            agentforceCreditsVal += c;
            agentforcePriceVal += p;
          }
        }
      }
      if (productConfig.product === 'data360') {
        hasD = true;
        const cfg = productConfig.config;
        if (cfg && !Array.isArray(cfg)) {
          const d360 = cfg as { useCases?: { useCase?: number | string; credits?: number; price?: number; inputs?: { inputKey?: string; key?: string; value?: number }[] }[] };
          if (Array.isArray(d360.useCases)) {
            d360.useCases.forEach((uc, index) => {
              const useCaseId = String(uc.useCase ?? '');
              const useCase = useCases.find((u) => u.id === useCaseId) ?? useCases[index];
              const itemPrice = typeof uc.price === 'number' ? uc.price : 0;
              const itemCredits = typeof uc.credits === 'number' ? uc.credits : 0;
              credits += itemCredits;
              price += itemPrice;
              data360CreditsVal += itemCredits;
              data360PriceVal += itemPrice;
              const inputValues: Record<string, number> = {};
              uc.inputs?.forEach((inp) => {
                const key = inp.inputKey ?? inp.key ?? '';
                if (key && typeof inp.value === 'number') {
                  const v = inp.value;
                  const inputDef = useCase?.inputs?.find((i) => (i.key ?? (i as { inputKey?: string }).inputKey) === key);
                  const displayVal = inputDef?.type === 'PERCENT' && v <= 1 ? Math.round(v * 100) : v;
                  inputValues[key] = displayVal;
                }
              });
              d360Configs.push({
                useCaseId: useCaseId || useCase?.id || `data360-${index}`,
                title: useCase?.title ?? `${getText("calc_use_case_fallback")}${index + 1}`,
                price: itemPrice,
                credits: itemCredits,
                description: useCase?.description,
                inputValues: Object.keys(inputValues).length > 0 ? inputValues : undefined,
                useCase: useCase ?? undefined,
              });
            });
          }
        } else if (Array.isArray(cfg)) {
          const data360Items = cfg as Data360ConfigItem[];
          data360Items.forEach((item, index) => {
            const useCaseId = item.useCaseId ?? item.id ?? '';
            const useCase = useCases.find((u) => u.id === useCaseId) ?? useCases[index];
            const itemPrice = typeof item.price === 'number' ? item.price : 0;
            price += itemPrice;
            data360PriceVal += itemPrice;
            d360Configs.push({
              useCaseId: useCaseId || useCase?.id || `data360-${index}`,
              title: useCase?.title ?? `${getText("calc_use_case_fallback")}${index + 1}`,
              price: itemPrice,
              description: useCase?.description,
              useCase: useCase ?? undefined,
            });
          });
        }
      }
    }

    const useIncludedOnlyTotals = excluded.size > 0;
    const totalCreditsVal = useIncludedOnlyTotals ? credits : (estimation.totalCredits ?? 0);
    const totalPriceVal = useIncludedOnlyTotals ? price : (estimation.totalPrice ?? 0);
    const estimationWithSeats = estimation as { totalSeats?: number };
    const totalSeatsVal = estimationWithSeats.totalSeats ?? 0;

    let productMode: EstimationSummaryProduct = 'agentforce';
    if (hasA && hasD) productMode = 'both';
    else if (hasD) productMode = 'data360';

    return {
      totalCredits: totalCreditsVal,
      totalPrice: totalPriceVal,
      totalSeats: totalSeatsVal,
      templateConfigs: configs,
      data360UseCaseConfigs: d360Configs,
      product: productMode,
      hasAgentforce: hasA,
      hasData360: hasD,
      agentforceCredits: agentforceCreditsVal,
      agentforcePrice: hasA ? agentforcePriceVal : undefined,
      data360Credits: data360CreditsVal,
      data360Price: hasD ? data360PriceVal : undefined,
    };
  }, [estimation, templates, templateTopics, useCases, excludedFromCalculationsTemplateIds]);

  const hasSummary = templateConfigs.length > 0 || data360UseCaseConfigs.length > 0;
  const hasEmployeeTemplates = templateConfigs.some((cfg) => cfg.template.targetAudience === 'EMPLOYEE');
  const [accordionView, setAccordionView] = useState<'agentforce' | 'data360'>('agentforce');
  const showBothProducts = product === 'both';

  const summaryCardRef = useRef<HTMLDivElement>(null);
  const [isSummaryCardVisible, setIsSummaryCardVisible] = useState(true);

  useEffect(() => {
    const el = summaryCardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSummaryCardVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showStickyBanner = hasSummary && !isSummaryCardVisible;

  return (
    <div>
      {showStickyBanner && (
        <StickyEstimationBanner
          totalCredits={totalCredits}
          totalPrice={totalPrice}
          hasSummary={hasSummary}
        />
      )}
      <div className="px-4 md:px-8 max-w-[1400px] mx-auto relative z-10">
        <EstimationStepHeader variant={variant} />

        <div ref={summaryCardRef}>
          <EstimationSummaryCard
            totalCredits={totalCredits}
            totalPrice={totalPrice}
            totalSeats={totalSeats}
            estimation={estimation}
            hasSummary={hasSummary}
            hasEmployeeTemplates={hasEmployeeTemplates}
            onSaveEstimation={onSaveEstimation}
            onDownloadReport={onDownloadReport}
            onContactSpecialist={onContactSpecialist}
            variant={variant === 'mobile' ? 'compact' : 'full'}
            templates={templates}
            product={product}
            reportData={reportData}
            onTrackViewDetailsAgentforce={onTrackViewDetailsAgentforce}
          />
        </div>

        {hasAgentforce && (
          <TemplateConfigAccordion
            templateConfigs={templateConfigs}
            totalCredits={showBothProducts ? agentforceCredits : totalCredits}
            totalPrice={showBothProducts ? agentforcePrice : totalPrice}
            totalSeats={totalSeats}
            onTopicInputChange={onTopicInputChange}
            onTopicToggle={onTopicToggle}
            onAddTemplate={() => {
              onTrackAddAgentforceTemplate?.();
              onAddTemplate?.();
            }}
            onHideTemplate={onHideTemplate}
            onDeleteTemplate={onDeleteTemplate}
            excludedFromCalculationsTemplateIds={excludedFromCalculationsTemplateIds}
            onAddToDashboard={onAddToDashboard}
            productTheme="agentforce"
            showToggle={showBothProducts}
            accordionView={accordionView}
            onAccordionViewChange={setAccordionView}
            headerOnly={showBothProducts && accordionView === 'data360'}
            templateGatingSKUs={templateGatingSKUs}
            onEmployeeConfigChange={onEmployeeTemplateConfigChange}
          />
        )}

        {hasData360 && (product !== 'both' || accordionView === 'data360') && (
          <Data360UseCaseAccordion
            onAddToDashboard={onAddToDashboard}
            showAddToDashboard={!showBothProducts}
            useCaseConfigs={data360UseCaseConfigs}
            totalCredits={showBothProducts ? data360Credits : totalCredits}
            totalPrice={showBothProducts ? data360Price : totalPrice}
            onAddTemplate={onAddTemplate}
            addTemplateLabel={getText("calc_add_data360_use_case")}
            onUseCaseInputChange={onUseCaseInputChange}
          />
        )}

        {!hasAgentforce && !hasData360 && (
          <div className="text-center py-8 text-gray-500">{getText("calc_no_products_configured")}</div>
        )}

        <div className="mb-8">
          <EstimationPrimaryActions
            estimation={estimation}
            onSaveEstimation={onSaveEstimation}
            onDownloadReport={onDownloadReport}
            onContactSpecialist={onContactSpecialist}
            showAddToDashboard={false}
          />
        </div>

        {/* Disclaimer — same width as accordion (full content width), visible on desktop and mobile */}
        <div
          className="mt-10 mb-8 w-full space-y-3 text-sm leading-relaxed text-[#023248] font-display"
        >
          <p>{getText("calc_legal_disclaimer")}</p>
        </div>

        {onReset && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={onReset}
              className="text-gray-500 text-sm hover:text-gray-700 underline"
            >
              {getText("calc_reset_calculator")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalEstimationStep;
