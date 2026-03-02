import type { Estimation, Agentforce, Data360 } from '@sfdc/eaas/sdk';
import type { TemplateConfigSummary } from '../types/EstimationSummary';
import type { Data360UseCaseConfigSummary, EstimationSummaryProduct } from '../components/estimation';

function buildTemplateConfigSummary(
  configItem: Agentforce.EstimationConfigItem,
  templates: Agentforce.Template[],
  templateTopics: Record<string, Agentforce.Topic[]>
): TemplateConfigSummary | null {
  const template = templates.find((t) => t.id === configItem.template.templateId);
  if (!template) return null;

  const rawTopics = templateTopics[configItem.template.templateId] || template.topics || [];
  const topics: Agentforce.Topic[] = rawTopics.map((t) => {
    const fromTemplate = template.topics?.find((tp) => tp.id === t.id);
    if (fromTemplate) {
      const useTemplateInputs = fromTemplate.inputs && fromTemplate.inputs.length > 0;
      return {
        ...t,
        formula: t.formula ?? fromTemplate.formula,
        inputs: useTemplateInputs ? fromTemplate.inputs : (t.inputs ?? fromTemplate.inputs),
      };
    }
    return t;
  });

  const topicCredits: Record<string, number> = {};
  const topicPrices: Record<string, number> = {};
  const disabledTopics: Record<string, boolean> = {};
  const topicInputValues: Record<string, Record<string, number>> = {};

  (configItem.template.topics ?? []).forEach((topicConfig) => {
    topicCredits[topicConfig.topicId] = topicConfig.credits;
    topicPrices[topicConfig.topicId] = topicConfig.price;
    disabledTopics[topicConfig.topicId] = topicConfig.selected === false;

    const values: Record<string, number> = {};
    topicConfig.inputs.forEach((input) => {
      values[input.inputKey] = input.value as number;
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

interface Data360EstimationConfig {
  useCases?: Array<{ useCase?: string | number; price?: number; credits?: number; inputs?: { inputKey?: string; key?: string; value?: number }[]; [key: string]: unknown }>;
  meters?: Array<{ meterId?: string | number; credits?: number; price?: number; discount?: number | null; [key: string]: unknown }>;
  price?: number;
  credits?: number;
  [key: string]: unknown;
}

export interface Data360MeterRow {
  meterId: string;
  meterName: string;
  flexOnlyPrice: number;
  profilesFlexPrice: number;
}

export interface Data360Breakdown {
  totalCost: number;
  flexOnlyCost: number;
  profilesCost: number;
  savingsFromVolume: number;
  flexCreditsTotal: number;
  meters: Data360MeterRow[];
}

export interface EstimationReportData {
  totalCredits: number;
  totalPrice: number;
  templateConfigs: TemplateConfigSummary[];
  data360UseCaseConfigs: Data360UseCaseConfigSummary[];
  data360Breakdown: Data360Breakdown | null;
  product: EstimationSummaryProduct;
  productTotals: { agentforcePrice: number; agentforceCredits: number; data360Price: number };
}

interface Data360Meter {
  id: string;
  displayName?: string;
  label?: string;
  name?: string;
  [key: string]: unknown;
}

function getMeterName(meters: Data360Meter[], meterId: string | number): string {
  const idStr = String(meterId);
  const m = meters.find((x) => String(x.id) === idStr);
  const name = (m?.displayName ?? m?.label ?? m?.name) as string | undefined;
  return name ?? `Meter ${idStr}`;
}

export function parseEstimationReportData(
  estimation: Estimation | null | undefined,
  templates: Agentforce.Template[],
  templateTopics: Record<string, Agentforce.Topic[]>,
  useCases: Data360.UseCase[],
  excludedFromCalculationsTemplateIds?: Set<string>,
  meters?: Data360.Meter[]
): EstimationReportData {
  const meterList = (meters ?? []) as Data360Meter[];

  const empty: EstimationReportData = {
    totalCredits: 0,
    totalPrice: 0,
    templateConfigs: [],
    data360UseCaseConfigs: [],
    data360Breakdown: null,
    product: 'agentforce',
    productTotals: { agentforcePrice: 0, agentforceCredits: 0, data360Price: 0 },
  };

  if (!estimation?.config) return empty;

  const configs: TemplateConfigSummary[] = [];
  const d360Configs: Data360UseCaseConfigSummary[] = [];
  let data360Breakdown: Data360Breakdown | null = null;
  let credits = 0;
  let price = 0;
  let agentforcePrice = 0;
  let agentforceCredits = 0;
  let data360Price = 0;
  let hasA = false;
  let hasD = false;
  const excluded = excludedFromCalculationsTemplateIds ?? new Set<string>();

  for (const productConfig of estimation.config) {
    if (productConfig.product === 'agentforce' && Array.isArray(productConfig.config)) {
      hasA = true;
      const agentforceItems = productConfig.config as Agentforce.EstimationConfigItem[];
      for (const item of agentforceItems) {
        if (excluded.has(item.template.templateId)) continue;
        const summary = buildTemplateConfigSummary(item, templates, templateTopics);
        if (summary) configs.push(summary);
        credits += item.template.credits ?? 0;
        price += item.template.price ?? 0;
        agentforcePrice += item.template.price ?? 0;
        agentforceCredits += item.template.credits ?? 0;
      }
    }

    if (productConfig.product === 'data360') {
      hasD = true;
      const cfg = productConfig.config as Data360EstimationConfig | Data360ConfigItem[] | undefined;
      const productConfigCredits = (productConfig as { credits?: number }).credits;

      if (cfg && !Array.isArray(cfg)) {
        const d360 = cfg as Data360EstimationConfig;
        if (Array.isArray(d360.useCases)) {
          d360.useCases.forEach((uc, index) => {
            const useCaseId = String(uc.useCase ?? '');
            const useCase = useCases.find((u) => u.id === useCaseId) ?? useCases[index];
            const itemPrice = typeof uc.price === 'number' ? uc.price : 0;
            price += itemPrice;
            data360Price += itemPrice;
            d360Configs.push({
              useCaseId: useCaseId || useCase?.id || `data360-${index}`,
              title: useCase?.title ?? `Use Case ${index + 1}`,
              price: itemPrice,
              credits: typeof uc.credits === 'number' ? uc.credits : undefined,
              description: useCase?.description,
              useCase: useCase ?? undefined,
            });
          });
        }
        if (d360Configs.length === 0 && typeof d360.price === 'number' && d360.price > 0) {
          price += d360.price;
          data360Price += d360.price;
        }

        const d360Price = typeof d360.price === 'number' ? d360.price : data360Price;
        const flexOnlyCost = Math.round(d360Price * 0.7);
        const profilesCost = d360Price - flexOnlyCost;
        let meterRows: Data360MeterRow[] = [];
        const meterConfigs = Array.isArray(d360.meters) ? d360.meters : [];
        if (meterConfigs.length > 0) {
          meterConfigs.forEach((m) => {
            const meterId = String(m.meterId ?? '');
            const meterPrice = typeof m.price === 'number' ? m.price : 0;
            const flexOnly = Math.round(meterPrice * 0.7);
            meterRows.push({
              meterId,
              meterName: getMeterName(meterList, m.meterId ?? ''),
              flexOnlyPrice: flexOnly,
              profilesFlexPrice: meterPrice,
            });
          });
        } else {
          meterRows = d360Configs.map((uc, idx) => ({
            meterId: uc.useCaseId,
            meterName: uc.title,
            flexOnlyPrice: Math.round(uc.price * 0.7),
            profilesFlexPrice: uc.price,
          }));
        }
        data360Breakdown = {
          totalCost: d360Price,
          flexOnlyCost,
          profilesCost,
          savingsFromVolume: 0,
          flexCreditsTotal: typeof productConfigCredits === 'number' ? productConfigCredits : (typeof d360.credits === 'number' ? d360.credits : 0),
          meters: meterRows,
        };
      } else if (Array.isArray(cfg)) {
        const arrItems = cfg as Data360ConfigItem[];
        arrItems.forEach((item, index) => {
          const useCaseId = String(item.useCaseId ?? item.id ?? '');
          const useCase = useCases.find((u) => u.id === useCaseId) ?? useCases[index];
          const itemPrice = typeof item.price === 'number' ? item.price : 0;
          price += itemPrice;
          data360Price += itemPrice;
          d360Configs.push({
            useCaseId: useCaseId || useCase?.id || `data360-${index}`,
            title: useCase?.title ?? `Use Case ${index + 1}`,
            price: itemPrice,
            description: useCase?.description,
            useCase: useCase ?? undefined,
          });
        });
        const arrTotal = data360Price;
        const arrFlexOnly = Math.round(arrTotal * 0.7);
        const arrProfiles = arrTotal - arrFlexOnly;
        const arrMeterRows: Data360MeterRow[] = d360Configs.map((uc, idx) => ({
          meterId: uc.useCaseId,
          meterName: uc.title,
          flexOnlyPrice: Math.round(uc.price * 0.7),
          profilesFlexPrice: uc.price,
        }));
        data360Breakdown = {
          totalCost: arrTotal,
          flexOnlyCost: arrFlexOnly,
          profilesCost: arrProfiles,
          savingsFromVolume: 0,
          flexCreditsTotal: 0,
          meters: arrMeterRows,
        };
      }
    }
  }

  const useIncludedOnlyTotals = excluded.size > 0;
  const totalCreditsVal = useIncludedOnlyTotals ? credits : (estimation.totalCredits ?? 0);
  const totalPriceVal = useIncludedOnlyTotals ? price : (estimation.totalPrice ?? 0);

  let productMode: EstimationSummaryProduct = 'agentforce';
  if (hasA && hasD) productMode = 'both';
  else if (hasD) productMode = 'data360';

  return {
    totalCredits: totalCreditsVal,
    totalPrice: totalPriceVal,
    templateConfigs: configs,
    data360UseCaseConfigs: d360Configs,
    data360Breakdown,
    product: productMode,
    productTotals: { agentforcePrice, agentforceCredits, data360Price },
  };
}
