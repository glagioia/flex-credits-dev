import React, { useCallback } from 'react';
import { TemplateConfig, UseCaseConfig, Button, BUTTON_TYPES, EmployeeTemplateConfig, EmployeeConfigValues } from "../common";
import { Agentforce, Data360 } from '@sfdc/eaas/sdk';
import { getText } from '../../../utils/textUtils';

export type ConfigStepProduct = 'agentforce' | 'data360';

/** Theme for Configure step. */
export const CONFIGURE_THEME: Record<ConfigStepProduct, { primary: string; primaryBorder: string; headerBg: string }> = {
	agentforce: { primary: "#0176D3", primaryBorder: "#0176D3", headerBg: "#00B3FF" },
	data360: { primary: "#0176D3", primaryBorder: "#0176D3", headerBg: "#022AC0" },
};

interface ConfigStepProps {
  product: ConfigStepProduct;
  isMobile?: boolean;
  /** Temporary Agentforce items being configured (not yet added to estimation) */
  pendingConfigItems: Agentforce.EstimationConfigItem[];
  /** Items already added to the estimation object */
  estimationConfigItems?: Agentforce.EstimationConfigItem[];
  /** All available templates (for display name lookup) */
  templates?: Agentforce.Template[];
  /** All available topics per template */
  templateTopics?: Record<string, Agentforce.Topic[]>;
  /** Data360 use cases (for data360 product) */
  useCases?: Data360.UseCase[];
  /** Pending Data360 estimation config */
  pendingData360Config?: Data360.EstimationConfigItem | null;
  /** Called when topic input values change (Agentforce) */
  onTopicInputChange: (templateId: string, topicId: string, values: Record<string, number>) => void;
  /** Called when topic is toggled on/off (Agentforce) */
  onTopicToggle: (templateId: string, topicId: string, enabled: boolean) => void;
  /** Called when use case input values change (Data360) */
  onUseCaseInputChange?: (useCaseId: string, values: Record<string, number>) => void;
  /** Called when user clicks "Add Template" button */
  onAddTemplate: () => void;
  /** Called when user clicks "Add to Estimate" button */
  onAddToEstimate: () => void;
  /** Called when user clicks "Return to Dashboard" button */
  onReturnToDashboard?: () => void;
  /** Called when user clicks "Edit Data Foundation" link */
  onEditDataFoundation?: () => void;
  /** Called when a numeric input is updated (for analytics). Agentforce only. */
  onTrackNumericInputChange?: (params: { topicDisplayName: string; inputPosition: number; value: number }) => void;
  /** Pending employee template IDs */
  pendingEmployeeTemplateIds?: string[];
  /** Employee template configurations (templateId -> config values) */
  employeeTemplateConfigs?: Record<string, EmployeeConfigValues>;
  /** Called when employee template config changes */
  onEmployeeTemplateConfigChange?: (templateId: string, values: EmployeeConfigValues) => void | Promise<void>;
  /** Gating SKUs per employee template (templateId -> SKUs) */
  templateGatingSKUs?: Record<string, Agentforce.GatingSku[]>;
  /** Pending employee config items (templateId -> EstimationConfigItem) */
  pendingEmployeeConfigItems?: Record<string, Agentforce.EstimationConfigItem>;
  /** Last known credits by topic ID (persisted in parent, used when topic is disabled) */
  lastCreditsByTopicId?: Record<string, number>;
  /** Last known pricing by topic ID (persisted in parent, used when topic is disabled) */
  lastPricingByTopicId?: Record<string, number>;
  /** Called to update last known topic values in parent */
  onUpdateLastTopicValues?: (credits: Record<string, number>, pricing: Record<string, number>) => void;
  /** ID of the template that was just newly configured (for auto-enabling first topic) */
  newlyConfiguredTemplateId?: string | null;
}

const ConfigStep: React.FC<ConfigStepProps> = ({
  product,
  isMobile,
  pendingConfigItems,
  estimationConfigItems = [],
  templates = [],
  templateTopics = {},
  useCases = [],
  pendingData360Config,
  onTopicInputChange,
  onTopicToggle,
  onUseCaseInputChange,
  onAddTemplate,
  onAddToEstimate,
  onReturnToDashboard,
  onEditDataFoundation,
  onTrackNumericInputChange,
  pendingEmployeeTemplateIds = [],
  employeeTemplateConfigs = {},
  onEmployeeTemplateConfigChange,
  templateGatingSKUs = {},
  pendingEmployeeConfigItems = {},
  lastCreditsByTopicId = {},
  lastPricingByTopicId = {},
  onUpdateLastTopicValues,
  newlyConfiguredTemplateId,
}) => {
  const isAgentforce = product === 'agentforce';
  const theme = CONFIGURE_THEME[product];

  const sectionTitle = isAgentforce
		? getText("calc_configure_use_case_configure_agent_template_subtitle")
		: getText("calc_configure_use_case_configure_use_case_subtitle");

  // Filter out pending items that are already in estimation (prevent duplicates from SDK mutations)
  const pendingNotInEstimation = pendingConfigItems.filter(
    (pending) => !estimationConfigItems.some(
      (est) => est.template.templateId === pending.template.templateId
    )
  );

  // Filter out employee templates from estimation - they are handled separately via pendingEmployeeTemplates
  const estimationNonEmployeeItems = estimationConfigItems.filter((item) => {
    const t = item.template as { seats?: number };
    return !((t?.seats ?? 0) > 0);
  });

  // Combine pending and estimation items for display (excluding employee templates)
  const allConfigItems = [...pendingNotInEstimation, ...estimationNonEmployeeItems];

  // Build topicCredits and topicPrices maps from config items
  const getTopicCreditsMap = (item: Agentforce.EstimationConfigItem): Record<string, number> => {
    const map: Record<string, number> = {};
    item.template.topics?.forEach((t) => {
      map[t.topicId] = t.credits;
    });
    return map;
  };

  const getTopicPricesMap = (item: Agentforce.EstimationConfigItem): Record<string, number> => {
    const map: Record<string, number> = {};
    item.template.topics?.forEach((t) => {
      map[t.topicId] = t.price;
    });
    return map;
  };

  const getTopicInputValuesMap = (item: Agentforce.EstimationConfigItem, topics: Agentforce.Topic[]): Record<string, Record<string, number>> => {
    const map: Record<string, Record<string, number>> = {};
    item.template.topics?.forEach((t) => {
      const topicDef = topics.find((tp) => tp.id === t.topicId);
      const values: Record<string, number> = {};
      t.inputs.forEach((input) => {
        const v = input.value as number;
        const inputDef = topicDef?.inputs?.find((i) => i.key === input.inputKey);
        const displayVal = inputDef?.dataType === "PERCENT" && v <= 1 ? Math.round(v * 100) : v;
        values[input.inputKey] = displayVal;
      });
      map[t.topicId] = values;
    });
    return map;
  };

  const getDisabledTopicsMap = (item: Agentforce.EstimationConfigItem): Record<string, boolean> => {
    const map: Record<string, boolean> = {};
    item.template.topics?.forEach((t) => {
      map[t.topicId] = t.selected === false;
    });
    return map;
  };

  const handleTopicInputChange = useCallback(
    (templateId: string, topicId: string, values: Record<string, number>) => {
      onTopicInputChange(templateId, topicId, values);
    },
    [onTopicInputChange]
  );

  const handleTopicToggle = useCallback(
    (templateId: string, topicId: string, enabled: boolean) => {
      onTopicToggle(templateId, topicId, enabled);
    },
    [onTopicToggle]
  );

  // Helper to get use case credits/price from pending config
  const getUseCaseCredits = (useCaseId: string): number => {
    const useCaseConfig = pendingData360Config?.useCases?.find((uc) => uc.useCase === useCaseId);
    return useCaseConfig?.credits ?? 0;
  };

  const getUseCasePrice = (useCaseId: string): number => {
    const useCaseConfig = pendingData360Config?.useCases?.find((uc) => uc.useCase === useCaseId);
    return useCaseConfig?.price ?? 0;
  };

  const getUseCaseInputValues = (useCase: Data360.UseCase): Record<string, number> => {
    const useCaseConfig = pendingData360Config?.useCases?.find((uc) => uc.useCase === useCase.id);
    const values: Record<string, number> = {};
    useCaseConfig?.inputs?.forEach((inp) => {
      const key = inp.inputKey ?? (inp as { key?: string }).key ?? '';
      const v = (inp.value as number) ?? 0;
      const inputDef = useCase.inputs?.find((i) => (i.key ?? (i as { inputKey?: string }).inputKey) === key);
      const displayVal = inputDef?.type === "PERCENT" && v <= 1 ? Math.round(v * 100) : v;
      values[key] = displayVal;
    });
    return values;
  };

  // --- Data360: list of selected use cases with inputs ---
  if (!isAgentforce) {
    // Get use cases that are in the pending config
    const configuredUseCaseIds = pendingData360Config?.useCases?.map((uc) => uc.useCase) ?? [];
    const selectedItems = useCases.filter((u) => configuredUseCaseIds.includes(u.id));

    return (
			<div className={`step-content step-configure mx-auto max-w-[1360px] px-4 py-6 md:px-8 ${isMobile ? "pb-8" : "py-8"}`}>
				{/* Section title */}
				<h3
					className={`font-display mb-4 text-center font-bold text-[#023248] ${isMobile ? "text-[24px]" : "text-2xl"}`}
				>
					{sectionTitle}
				</h3>

				{/* Edit Data Foundation link */}
				{onEditDataFoundation && (
					<div className="flex w-full justify-end mb-4">
						<Button buttonType={BUTTON_TYPES.LINK} onClick={onEditDataFoundation}>
							{getText("calc_edit_data_foundation")}
						</Button>
					</div>
				)}

				{/* Use case config cards */}
				{selectedItems.length === 0 && (
					<div className="py-8 text-center text-gray-500">{getText("calc_no_use_cases_configured")}</div>
				)}

				{selectedItems.map((useCase) => (
					<UseCaseConfig
						key={useCase.id}
						useCase={useCase}
						credits={getUseCaseCredits(useCase.id)}
						price={getUseCasePrice(useCase.id)}
						initialInputValues={getUseCaseInputValues(useCase)}
						onInputChange={(useCaseId, values) => {
							onUseCaseInputChange?.(useCaseId, values);
						}}
						headerBgColor={theme.headerBg}
						isMobile={isMobile}
					/>
				))}

				{/* Buttons section */}
				{isMobile ? (
					<div className="mt-8 flex w-full flex-col items-center gap-4">
						<div className="w-full text-center">
							<Button buttonType={BUTTON_TYPES.LINK} onClick={onAddTemplate}>
								{getText("calc_configure_button_configure_another_use_case")}
							</Button>
						</div>
						<div className="w-full [&>div]:w-full [&_button]:w-full">
							<Button onClick={onAddToEstimate}>{getText("calc_configure_button_add_to_estimate")}</Button>
						</div>
						{onReturnToDashboard && (
							<div className="w-full text-center">
								<Button buttonType={BUTTON_TYPES.LINK} onClick={onReturnToDashboard}>
									{getText("calc_return_to_dashboard")}
								</Button>
							</div>
						)}
					</div>
				) : (
					<div className="mt-8 flex items-center">
						{onReturnToDashboard && (
							<Button buttonType={BUTTON_TYPES.LINK} onClick={onReturnToDashboard}>
								{getText("calc_return_to_dashboard")}
							</Button>
						)}
						<div className="ml-auto flex items-center gap-4">
							<Button buttonType={BUTTON_TYPES.LINK} onClick={onAddTemplate}>
								{getText("calc_configure_button_configure_another_use_case")}
							</Button>
							<Button onClick={onAddToEstimate}>{getText("calc_configure_button_add_to_estimate")}</Button>
						</div>
					</div>
				)}

				{/* Use last message / disclaimer */}
				<div className="font-sans mt-10 text-sm text-[#023248]">
					<p>{getText("calc_configure_use_last_message_first")}</p>
					<p>{getText("calc_configure_use_last_message_second")}</p>
					<p>{getText("calc_configure_use_last_message_third")}</p>
				</div>
			</div>
		);
  }

  // Get employee templates from estimation (those with seats > 0)
  const estimationEmployeeItems = estimationConfigItems.filter((item) => {
    const t = item.template as { seats?: number };
    return (t?.seats ?? 0) > 0;
  });

  // Get pending employee templates
  const pendingEmployeeTemplates = templates.filter(
    (t) => t.targetAudience === 'EMPLOYEE' && pendingEmployeeTemplateIds.includes(t.id)
  );

  // Get estimation employee templates (not in pending - to avoid duplicates)
  const estimationEmployeeTemplates = templates.filter((t) => {
    if (t.targetAudience !== 'EMPLOYEE') return false;
    // Skip if already in pending
    if (pendingEmployeeTemplateIds.includes(t.id)) return false;
    // Include if in estimation
    return estimationEmployeeItems.some((item) => item.template.templateId === t.id);
  });

  // Combine all employee templates (pending + estimation)
  const allEmployeeTemplates = [...pendingEmployeeTemplates, ...estimationEmployeeTemplates];

  // Check if there's any content to show
  const hasContent = allConfigItems.length > 0 || allEmployeeTemplates.length > 0;

  // --- Agentforce: templates with topics ---
  return (
		<div className={`step-content step-configure mx-auto max-w-[1360px] px-4 md:px-8 ${isMobile ? "py-6 pb-8" : "py-8"}`}>
			<div className='font-display md:text-[32px] text-[20px] font-bold w-full pt-4 md:pb-12 pb-6 flex justify-center text-[#023248]'>{getText("calc_configure_use_case_configure_agent_template_subtitle")}</div>
			{!hasContent && (
				<div className="py-8 text-center text-gray-500">{getText("calc_no_templates_configured")}</div>
			)}

			{/* Regular templates with topics */}
			{allConfigItems.map((configItem) => {
				const template = templates.find((t) => t.id === configItem.template.templateId);
				const topics = templateTopics[configItem.template.templateId] || [];

				if (!template) return null;

				// Template is "new" if it matches the newly configured template ID
				const isNewTemplate = configItem.template.templateId === newlyConfiguredTemplateId;

				return (
					<TemplateConfig
						key={configItem.template.templateId}
						template={template}
						topics={topics}
						topicCredits={getTopicCreditsMap(configItem)}
						topicPrices={getTopicPricesMap(configItem)}
						initialDisabledTopics={getDisabledTopicsMap(configItem)}
						initialTopicInputValues={getTopicInputValuesMap(configItem, topics)}
						onTopicInputChange={(topicId, values) =>
							handleTopicInputChange(configItem.template.templateId, topicId, values)
						}
						onTopicToggle={(topicId, enabled) => handleTopicToggle(configItem.template.templateId, topicId, enabled)}
						onTrackNumericInputChange={onTrackNumericInputChange}
						isMobile={isMobile}
						lastCreditsByTopicId={lastCreditsByTopicId}
						lastPricingByTopicId={lastPricingByTopicId}
						onUpdateLastTopicValues={onUpdateLastTopicValues}
						isNewTemplate={isNewTemplate}
					/>
				);
			})}

			{/* Employee templates (from pending and estimation) */}
			{allEmployeeTemplates.map((template) => {
				const isInPending = pendingEmployeeTemplateIds.includes(template.id);
				const skuOptions = templateGatingSKUs[template.id] || [];

				// Get config item from pending or estimation
				const pendingConfigItem = pendingEmployeeConfigItems[template.id];
				const estimationConfigItem = estimationEmployeeItems.find(
					(item) => item.template.templateId === template.id
				);
				const configItem = pendingConfigItem || estimationConfigItem;

				// Get values from pending config or estimation
				const pendingConfig = employeeTemplateConfigs[template.id];
				const estTemplate = estimationConfigItem?.template as { seats?: number; gatingSkuId?: string } | undefined;

				const config = isInPending && pendingConfig
					? pendingConfig
					: {
						skuId: estTemplate?.gatingSkuId ?? null,
						seats: estTemplate?.seats ?? 0,
					};

				// Get seats and pricing from the config item (calculated by SDK)
				const totalSeats = configItem?.template?.seats ?? config.seats;
				const totalPricing = configItem?.template?.price ?? 0;

				return (
					<EmployeeTemplateConfig
						key={template.id}
						template={template}
						skuOptions={skuOptions}
						values={config}
						onChange={(templateId, values) => {
							(onEmployeeTemplateConfigChange || (() => {}))(templateId, values);
						}}
						totalSeats={totalSeats}
						totalPricing={totalPricing}
						isMobile={isMobile}
					/>
				);
			})}

			{/* Buttons section */}
			{isMobile ? (
				<div className="mt-8 flex w-full flex-col items-center gap-4">
					<div className="w-full text-center">
						<Button buttonType={BUTTON_TYPES.LINK} onClick={onAddTemplate}>
							{getText("calc_configure_button_configure_another_use_case")}
						</Button>
					</div>
					<div className="w-full [&>div]:w-full [&_button]:w-full">
						<Button onClick={onAddToEstimate}>{getText("calc_configure_button_add_to_estimate")}</Button>
					</div>
					{onReturnToDashboard && (
						<div className="w-full text-center">
							<Button buttonType={BUTTON_TYPES.LINK} onClick={onReturnToDashboard}>
								{getText("calc_return_to_dashboard")}
							</Button>
						</div>
					)}
				</div>
			) : (
				<div className="mt-8 flex items-center">
					{onReturnToDashboard && (
						<Button buttonType={BUTTON_TYPES.LINK} onClick={onReturnToDashboard}>
							{getText("calc_return_to_dashboard")}
						</Button>
					)}
					<div className="ml-auto flex items-center gap-4">
						<Button buttonType={BUTTON_TYPES.LINK} onClick={onAddTemplate}>
							{getText("calc_configure_button_configure_another_use_case")}
						</Button>
						<Button onClick={onAddToEstimate}>{getText("calc_configure_button_add_to_estimate")}</Button>
					</div>
				</div>
			)}

			{/* Use last message / disclaimer */}
			<div className="mt-10 text-sm text-[#023248] font-display">
				<p>{getText("calc_configure_use_last_message_first")}</p>
				<p>{getText("calc_configure_use_last_message_second")}</p>
				<p>{getText("calc_configure_use_last_message_third")}</p>
			</div>
		</div>
	);
};

export default ConfigStep;
