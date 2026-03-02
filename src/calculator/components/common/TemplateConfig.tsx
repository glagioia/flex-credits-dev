import React, { useState, useEffect } from 'react';
import { Toggler, InputRow } from './index';
import { Agentforce } from '@sfdc/eaas/sdk';
import { getText } from '../../../utils/textUtils';
import { formatCreditsShort, formatPriceShort } from '../../utils/estimationFormatters';

interface InputConfig {
  min?: number;
  max?: number;
  default?: number;
}

interface TopicState {
  enabled: boolean;
  inputValues: Record<string, number>;
}

/** Extract formula variable labels from topic.formula placeholders {inputKey} and topic.inputs (SDK). */
export function tokenize(formula: string): string[] {
  // Match either a block of characters/numbers/decimals OR a single operator/parenthesis
  const regex = /[a-zA-Z0-9_.]+|[+*\/\-()]/g;
  
  // Return the matches, or an empty array if nothing is found
  return formula.match(regex) || [];
} 

/** Extract formula variable labels from topic.formula placeholders {inputKey} and topic.inputs (SDK). */
export function getFormulaChipLabels(topic: Agentforce.Topic): string[] {
	if(!topic.formula) {
		return [];
	}
	
  const keys = tokenize(topic.formula);

  return keys.map(
    (key) => topic.inputs?.find((i) => i.key == key.toString())?.label ?? key
  );
}

/** Build readable formula string: replace input keys in topic.formula with labels, use × between factors. */
export function getReadableFormula(topic: Agentforce.Topic): string {
  if (!topic.formula || !topic.formula.trim()) return '—';
  const parts = topic.formula.split(/\s*\*\s*/).map((key) => {
    const trimmed = key.trim();
    const label = topic.inputs?.find((i) => i.key === trimmed)?.label ?? trimmed;
    return label;
  });
  return parts.length > 0 ? parts.join(' × ') : topic.formula;
}

interface TemplateConfigProps {
  template: Agentforce.Template;
  topics: Agentforce.Topic[];
  topicCredits: Record<string, number>;
  topicPrices: Record<string, number>;
  onTopicInputChange: (topicId: string, values: Record<string, number>) => void;
  onTopicToggle: (topicId: string, enabled: boolean) => void;
  /** When true, render only topics list (no template header/footer). Use inside another accordion. */
  variant?: 'full' | 'contentOnly';
  /** When true, show "Hide formulas" / "Number of Credits" chips below each topic's inputs (formula from SDK). */
  showFormulaChips?: boolean;
  /** When true, initial enabled state is derived from topicCredits > 0 (for estimation step). */
  useTopicCreditsForInitialEnabled?: boolean;
  /** Topic id -> true when topic is toggled off. Restores off state when re-entering STEP_CONFIGURE. */
  initialDisabledTopics?: Record<string, boolean>;
  /** Initial input values per topic (topicId -> inputKey -> value). Used in FinalEstimationStep to show values from STEP_CONFIGURE. */
  initialTopicInputValues?: Record<string, Record<string, number>>;
  /** Layout of inputs per topic: stacked (one per row) or inline (side by side). Default stacked for ConfigStep. */
  inputLayout?: 'stacked' | 'inline';
  /** Max width of the content area (e.g. 1400 for FinalEstimationStep). Number = px, string used as-is. */
  contentMaxWidth?: number | string;
  /** When true, all inputs and topic toggles are disabled (read-only view). */
  readOnly?: boolean;
  /** Called when a numeric input is updated (for analytics). Config step only. */
  onTrackNumericInputChange?: (params: { topicDisplayName: string; inputPosition: number; value: number }) => void;
  /** Whether to render for mobile layout */
  isMobile?: boolean;
  /** Last known credits by topic ID (persisted in parent, used when topic is disabled) */
  lastCreditsByTopicId?: Record<string, number>;
  /** Last known pricing by topic ID (persisted in parent, used when topic is disabled) */
  lastPricingByTopicId?: Record<string, number>;
  /** Called to update last known topic values in parent */
  onUpdateLastTopicValues?: (credits: Record<string, number>, pricing: Record<string, number>) => void;
  /** When true, this is a newly configured template. Auto-enables and expands first topic. */
  isNewTemplate?: boolean;
}

const TemplateConfig: React.FC<TemplateConfigProps> = ({
  template,
  topics,
  topicCredits,
  topicPrices,
  onTopicInputChange,
  onTopicToggle,
  variant = 'full',
  showFormulaChips = false,
  useTopicCreditsForInitialEnabled = false,
  initialDisabledTopics,
  initialTopicInputValues,
  inputLayout = 'stacked',
  contentMaxWidth,
  readOnly = false,
  onTrackNumericInputChange,
  isMobile = false,
  lastCreditsByTopicId = {},
  lastPricingByTopicId = {},
  onUpdateLastTopicValues,
  isNewTemplate = false,
}) => {
  const [topicStates, setTopicStates] = useState<Record<string, TopicState>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [showFormulas, setShowFormulas] = useState(false);
  const [initializedTopicIds, setInitializedTopicIds] = useState<string[]>([]);

  // Initialize topic states when topics change. Do NOT depend on topicCredits or initialDisabledTopics
  // as those update on every input change and would reset the form/expanded state.
  useEffect(() => {
    // Only initialize for new topics, preserve existing state
    const currentTopicIds = topics.map((t) => t.id);
    const newTopicIds = currentTopicIds.filter((id) => !initializedTopicIds.includes(id));

    if (newTopicIds.length === 0) return;

    const newStates: Record<string, TopicState> = {};
    const newExpanded: Record<string, boolean> = {};

    topics.forEach((topic) => {
      if (!initializedTopicIds.includes(topic.id)) {
        const saved = initialTopicInputValues?.[topic.id];
        const inputValues: Record<string, number> = {};
        topic.inputs?.forEach((input) => {
          const config = input.config as InputConfig | undefined;
          inputValues[input.key] = saved?.[input.key] ?? config?.default ?? 0;
        });

        const disabled = initialDisabledTopics?.[topic.id] === true;
        newStates[topic.id] = {
          enabled: disabled ? false : (useTopicCreditsForInitialEnabled ? (topicCredits[topic.id] ?? 0) > 0 : true),
          inputValues,
        };
        // Only auto-expand first topic for new templates
        newExpanded[topic.id] = isNewTemplate && topics.indexOf(topic) === 0;
      }
    });

    if (Object.keys(newStates).length > 0) {
      setTopicStates((prev) => ({ ...prev, ...newStates }));
      setExpandedTopics((prev) => ({ ...prev, ...newExpanded }));
      setInitializedTopicIds(currentTopicIds);
    }
  }, [topics, useTopicCreditsForInitialEnabled]);

  // After initialization, enable the first topic by mimicking a toggle click
  // This ensures the SDK is notified and recalculates credits/pricing
  // Only for new templates (not already in pending or estimation)
  useEffect(() => {
    // Skip for existing templates - they should retain their configured state
    if (!isNewTemplate) return;
    if (topics.length === 0) return;
    const firstTopic = topics[0];
    const firstTopicState = topicStates[firstTopic.id];

    // Only trigger if first topic exists, has state, and is not yet enabled
    // Also check that we have initialized (to avoid running before state is set)
    if (
      firstTopicState &&
      !firstTopicState.enabled &&
      initializedTopicIds.includes(firstTopic.id)
    ) {
      // Mimic toggle click: set enabled and notify parent
      setTopicStates((prev) => ({
        ...prev,
        [firstTopic.id]: {
          ...prev[firstTopic.id],
          enabled: true,
        },
      }));
      onTopicToggle(firstTopic.id, true);
      onTopicInputChange(firstTopic.id, firstTopicState.inputValues);
    }
  }, [initializedTopicIds, isNewTemplate]);

  // Update last known credits/pricing whenever they change for enabled topics
  // This persists in parent so values survive component unmount/remount
  useEffect(() => {
    if (!onUpdateLastTopicValues) return;

    const newCredits: Record<string, number> = {};
    const newPricing: Record<string, number> = {};
    let hasChanges = false;

    topics.forEach((topic) => {
      const isEnabled = topicStates[topic.id]?.enabled ?? true;
      const currentCredits = topicCredits[topic.id] ?? 0;
      const currentPricing = topicPrices[topic.id] ?? 0;

      // Only update if topic is enabled and has non-zero values
      if (isEnabled && (currentCredits > 0 || currentPricing > 0)) {
        if (lastCreditsByTopicId[topic.id] !== currentCredits) {
          newCredits[topic.id] = currentCredits;
          hasChanges = true;
        }
        if (lastPricingByTopicId[topic.id] !== currentPricing) {
          newPricing[topic.id] = currentPricing;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      onUpdateLastTopicValues(newCredits, newPricing);
    }
  }, [topics, topicCredits, topicPrices, topicStates, lastCreditsByTopicId, lastPricingByTopicId, onUpdateLastTopicValues]);

  const toggleTopicExpanded = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const handleToggle = (topicId: string, enabled: boolean) => {
    setTopicStates((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        enabled,
      },
    }));
    onTopicToggle(topicId, enabled);

    if (enabled) {
      const currentValues = topicStates[topicId]?.inputValues || {};
      onTopicInputChange(topicId, currentValues);
      // Expand the accordion when enabling a topic (if it's collapsed)
      if (!expandedTopics[topicId]) {
        setExpandedTopics((prev) => ({
          ...prev,
          [topicId]: true,
        }));
      }
    } else {
      // Collapse the accordion when disabling a topic
      setExpandedTopics((prev) => ({
        ...prev,
        [topicId]: false,
      }));
    }
  };

  const handleInputChange = (topicId: string, inputKey: string, value: number) => {
    const topic = topics.find((t) => t.id === topicId);
    const inputIndex = topic?.inputs?.findIndex((i) => i.key === inputKey) ?? -1;
    const inputPosition = inputIndex >= 0 ? inputIndex + 1 : 1;
    if (topic && onTrackNumericInputChange) {
      onTrackNumericInputChange({
        topicDisplayName: topic.displayName ?? "",
        inputPosition,
        value,
      });
    }

    setTopicStates((prev) => {
      const newValues = {
        ...prev[topicId]?.inputValues,
        [inputKey]: value,
      };

      onTopicInputChange(topicId, newValues);

      return {
        ...prev,
        [topicId]: {
          ...prev[topicId],
          inputValues: newValues,
        },
      };
    });
  };

  // Calculate totals
  const totalCredits = topics.reduce((sum, topic) => {
    if (!topicStates[topic.id]?.enabled) return sum;
    return sum + (topicCredits[topic.id] || 0);
  }, 0);

  const totalPricing = topics.reduce((sum, topic) => {
    if (!topicStates[topic.id]?.enabled) return sum;
    return sum + (topicPrices[topic.id] ?? 0);
  }, 0);

  const renderInput = (
    topic: Agentforce.Topic,
    input: Agentforce.TopicInput,
    disabled: boolean,
	hideBorder?: boolean
  ) => {
    const config = input.config as InputConfig | undefined;
    const value = topicStates[topic.id]?.inputValues[input.key] ?? config?.default ?? 0;

    return (
      <InputRow
        inputKey={input.key}
        label={input.label}
        tooltip={input.description}
        description={input.description}
        dataType={input.dataType}
        config={config}
        value={value}
        onChange={(val) => handleInputChange(topic.id, input.key, val)}
        disabled={disabled}
        isMobile={isMobile}
		hideBorder={hideBorder}
      />
    );
  };

  const contentStyle = contentMaxWidth
    ? { maxWidth: typeof contentMaxWidth === 'number' ? `${contentMaxWidth}px` : contentMaxWidth }
    : undefined;

  return (
		<div
			className={variant === "contentOnly" ? "" : "mb-6 overflow-hidden rounded-[16px] border border-[#D8E6F1]"}
			style={variant === "contentOnly" ? contentStyle : undefined}
		>
			{variant === "full" && (
				isMobile ? (
					<div className="bg-[#00B3FF] px-6 py-5">
						<h3
							className="text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
						>
							{template.displayName}
						</h3>
						<p
							className="mt-1 text-[14px] leading-[20px] text-[#444444] font-sans"
						>
							{getText("calc_configure_use_case_subtitle")}
						</p>
						{/* Stats row */}
						<div className="mt-4 flex items-center justify-between border-t border-[#032D60]/20 px-8 pt-4">
							<div className="min-w-0 flex-1 text-center">
								<div
									className="truncate text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
									title={formatCreditsShort(totalCredits)}
								>
									{formatCreditsShort(totalCredits)}
								</div>
								<div
									className="truncate text-[12px] leading-[16px] text-[#444444] font-sans"
									title={getText("calc_configure_use_case_credits")}
								>
									{getText("calc_configure_use_case_credits")}
								</div>
							</div>
							<div className="min-w-0 flex-1 text-center">
								<div
									className="truncate text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
									title={`$ ${formatPriceShort(totalPricing)}`}
								>
									$ {formatPriceShort(totalPricing)}
								</div>
								<div
									className="truncate text-[12px] leading-[16px] text-[#444444] font-sans"
									title={getText("calc_configure_use_case_pricing")}
								>
									{getText("calc_configure_use_case_pricing")}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-between bg-[#00B3FF] px-6 py-5">
						<div>
							<h3
								className="text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
							>
								{template.displayName}
							</h3>
							<p
								className="mt-1 text-[14px] leading-[20px] text-[#444444] font-sans"
							>
								{getText("calc_configure_use_case_subtitle")}
							</p>
						</div>
						<div className="flex items-center gap-10">
							<div className="min-w-0 text-center">
								<div
									className="truncate max-w-[220px] text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
									title={formatCreditsShort(totalCredits)}
								>
									{formatCreditsShort(totalCredits)}
								</div>
								<div
									className="truncate text-[12px] leading-[16px] text-[#444444] font-sans"
									title={getText("calc_configure_use_case_credits")}
								>
									{getText("calc_configure_use_case_credits")}
								</div>
							</div>
							<div className="min-w-0 text-center">
								<div
									className="truncate max-w-[220px] text-[20px] font-bold leading-[28px] text-[#032D60] font-sans"
									title={`$ ${formatPriceShort(totalPricing)}`}
								>
									$ {formatPriceShort(totalPricing)}
								</div>
								<div
									className="truncate text-[12px] leading-[16px] text-[#444444] font-sans"
									title={getText("calc_configure_use_case_pricing")}
								>
									{getText("calc_configure_use_case_pricing")}
								</div>
							</div>
						</div>
					</div>
				)
			)}

			{/* Topics */}
			<div>
				{topics.map((topic, index) => {
					const isEnabled = topicStates[topic.id]?.enabled ?? true;
					const isExpanded = expandedTopics[topic.id] ?? false;
					const hasInputs = topic.inputs && topic.inputs.length > 0;
					// When enabled: show live values from props (calculated by SDK)
					// When disabled: show last known values (visual only, not counted in totals)
					const credits = isEnabled
						? (topicCredits[topic.id] ?? 0)
						: (lastCreditsByTopicId[topic.id] ?? 0);
					const pricing = isEnabled
						? (topicPrices[topic.id] ?? 0)
						: (lastPricingByTopicId[topic.id] ?? 0);

					return (
						<div
							key={topic.id}
							className={`transition-colors ${
								isEnabled ? "bg-white bg-opacity-50" : "bg-[#F3F3F3]"
							} ${index > 0 ? "border-t border-[#D8E6F1]" : ""}`}
						>
							{/* Topic Header - Mobile */}
							{isMobile ? (
								<div className="px-6 py-5">
									{/* Title row with arrow and toggle */}
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-2">
											<button
												onClick={() => hasInputs && toggleTopicExpanded(topic.id)}
												className={`mt-1 flex-shrink-0 transition-transform ${
													isExpanded ? "rotate-180" : ""
												} ${!hasInputs ? "invisible" : ""}`}
											>
												<svg
													className="h-5 w-5 text-[#023248]"
													style={{scale: isMobile ? 1.1 : 1.5}}
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
												</svg>
											</button>
											<h4
												className="cursor-pointer text-[20px] font-semibold leading-[28px] tracking-[-0.06px] text-[#023248] font-sans"
												onClick={() => hasInputs && toggleTopicExpanded(topic.id)}
											>
												{topic.displayName}
											</h4>
										</div>
										<Toggler value={isEnabled} onChange={(val) => handleToggle(topic.id, val)} disabled={readOnly} />
									</div>
									{/* Description */}
									<p
										className={`mt-2 text-[14px] leading-[20px] font-sans ${
											isEnabled ? "text-[#706E6B]" : "text-[#B0ADAB]"
										}`}
									>
										{topic.description}
									</p>
									{/* Stats row */}
									<div className="mt-4 flex items-center justify-between px-4 pt-4">
										<div className="min-w-0 flex-1 text-center">
											<div
												className={`truncate text-[24px] font-semibold leading-[32px] tracking-[-0.06px] font-sans ${
													isEnabled ? "text-[#022AC0]" : "text-[#B0ADAB]"
												}`}
												title={(topic?.metadata?.actionCount ?? 1)}
											>
												{(topic?.metadata?.actionCount ?? 1)}
											</div>
											<div
												className={`font-sans truncate text-[14px] leading-[20px] ${isEnabled ? "text-[#706E6B]" : "text-[#B0ADAB]"}`}
												title={getText("calc_configure_use_case_actions")}
											>
												{getText("calc_configure_use_case_actions")}
											</div>
										</div>
										<div className="min-w-0 flex-1 text-center">
											<div
												className={`font-sans truncate text-[24px] font-semibold leading-[32px] tracking-[-0.06px] ${
													isEnabled ? "text-[#022AC0]" : "text-[#B0ADAB]"
												}`}
												title={formatCreditsShort(credits)}
											>
												{formatCreditsShort(credits)}
											</div>
											<div
												className={`font-sans truncate text-[14px] leading-[20px] ${isEnabled ? "text-[#706E6B]" : "text-[#B0ADAB]"}`}
												title={getText("calc_configure_use_case_credits")}
											>
												{getText("calc_configure_use_case_credits")}
											</div>
										</div>
										<div className="min-w-0 flex-1 text-center">
											<div
												className={`font-sans truncate text-[24px] font-semibold leading-[32px] tracking-[-0.06px] ${
													isEnabled ? "text-[#022AC0]" : "text-[#B0ADAB]"
												}`}
												title={`$ ${formatPriceShort(pricing)}`}
											>
												$ {formatPriceShort(pricing)}
											</div>
											<div
												className={`font-sans truncate text-[14px] leading-[20px] ${isEnabled ? "text-[#706E6B]" : "text-[#B0ADAB]"}`}
												title={getText("calc_configure_use_case_pricing")}
											>
												{getText("calc_configure_use_case_pricing")}
											</div>
										</div>
									</div>
								</div>
							) : (
								/* Topic Header - Desktop */
								<div className="flex items-center justify-between px-6 py-5">
									<div className="flex flex-1 items-start gap-4">
										<button
											onClick={() => hasInputs && toggleTopicExpanded(topic.id)}
											className={`mt-1 flex-shrink-0 transition-transform ${
												isExpanded ? "rotate-180" : ""
											} ${!hasInputs ? "invisible" : ""}`}
										>
											<svg
												className="h-5 w-5 text-[#023248]"
												style={{scale: 1.5}}
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</button>
										<div className="flex-1">
											<h4
												className="cursor-pointer text-[20px] font-semibold leading-[28px] tracking-[-0.06px] text-[#023248] font-sans"
												onClick={() => hasInputs && toggleTopicExpanded(topic.id)}
											>
												{topic.displayName}
											</h4>
											<p
												className={`font-sans mt-1 max-w-[480px] text-[14px] leading-[20px] ${
													isEnabled ? "text-[#706E6B]" : "text-[#B0ADAB]"
												}`}
											>
												{topic.description}
											</p>
										</div>
									</div>
									<div className="flex flex-shrink-0 items-center gap-8">
										<div className="w-[60px] text-center">
											<div
												className={`font-sans truncate text-[24px] font-semibold leading-[32px] tracking-[-0.06px] ${
													isEnabled ? "text-[#022AC0]" : "text-[#B0ADAB]"
												}`}
												title={(topic?.metadata?.actionCount ?? 1)}
											>
												{(topic?.metadata?.actionCount ?? 1)}
											</div>
											<div
												className={`font-sans truncate text-[14px] leading-[20px] ${isEnabled ? "text-[#706E6B]" : "text-[#B0ADAB]"}`}
												title={getText("calc_configure_use_case_actions")}
											>
												{getText("calc_configure_use_case_actions")}
											</div>
										</div>
										<div className="w-[100px] text-center">
											<div
												className={`font-sans truncate text-[24px] font-semibold leading-[32px] tracking-[-0.06px] ${
													isEnabled ? "text-[#022AC0]" : "text-[#B0ADAB]"
												}`}
												title={formatCreditsShort(credits)}
											>
												{formatCreditsShort(credits)}
											</div>
											<div
												className={`font-sans truncate text-[14px] leading-[20px] ${isEnabled ? "text-[#706E6B]" : "text-[#B0ADAB]"}`}
												title={getText("calc_configure_use_case_credits")}
											>
												{getText("calc_configure_use_case_credits")}
											</div>
										</div>
										<div className="w-[100px] text-center">
											<div
												className={`font-sans truncate text-[24px] font-semibold leading-[32px] tracking-[-0.06px] ${
													isEnabled ? "text-[#022AC0]" : "text-[#B0ADAB]"
												}`}
												title={`$ ${formatPriceShort(pricing)}`}
											>
												$ {formatPriceShort(pricing)}
											</div>
											<div
												className={`font-sans truncate text-[14px] leading-[20px] ${isEnabled ? "text-[#706E6B]" : "text-[#B0ADAB]"}`}
												title={getText("calc_configure_use_case_pricing")}
											>
												{getText("calc_configure_use_case_pricing")}
											</div>
										</div>
										<div className="flex w-[44px] justify-center">
											<Toggler value={isEnabled} onChange={(val) => handleToggle(topic.id, val)} disabled={readOnly} />
										</div>
									</div>
								</div>
							)}

							{/* Topic Inputs (expanded) TODO: inputs should include a dataType hidden from sdk */ }
							{hasInputs && isExpanded && (
								<div className={`px-6 pb-5 ${isMobile ? '' : 'ml-8 pr-12'}`}>
									<div className={inputLayout === "inline" ? "flex flex-wrap gap-6" : ""}>
										{topic.inputs?.toSorted((a, b) => (a.order ?? 1) - (b.order ?? 1))	
											?.filter((input) => input.label.includes('HIDDEN - SUMMATION OF 20% OF ALL AGENT TEMPLATES WITH "Enhance my Agent" SELECTED') === false)
											.map((input, idx) => (
											<div key={input.key} className={inputLayout === "inline" ? "min-w-[280px] flex-1" : ""}>
												{renderInput(topic, input, !isEnabled || readOnly, idx === 0 && !isMobile)}
											</div>
										))}
									</div>
									{showFormulaChips && (
										<div className="mt-6 border-t border-[#D8E6F1] pt-4">
											<button
												type="button"
												onClick={() => setShowFormulas((v) => !v)}
												className="flex items-center gap-1 text-sm font-medium text-[#0176D3] hover:underline"
											>
												{showFormulas ? "Hide formulas" : "Show formulas"}
												<span
													className="inline-block transition-transform"
													style={{ transform: showFormulas ? "rotate(180deg)" : "none" }}
												>
													▼
												</span>
											</button>
											{showFormulas && (
												<div className="mt-3">
													<p
														className="font-sans mb-2 text-[14px] text-[#706E6B]"
													>
														{getText("calc_dashboard_number_of_credits")}
													</p>
													<div className="flex flex-wrap gap-2">
														{getFormulaChipLabels(topic).map((label) => (
															<span
																key={label}
																className="inline-flex items-center gap-1.5 rounded-full border border-[#D8E6F1] bg-[#EAF5FE] px-3 py-1.5 text-sm text-[#023248]"
															>
																{label}
																<span className="cursor-pointer text-gray-400 hover:text-gray-600" aria-label="Remove">
																	×
																</span>
															</span>
														))}
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{variant === "full" && (
				isMobile ? (
					/* Footer - Small bar only for mobile */
					<div className="h-3 rounded-b-[16px] bg-[#00B3FF]" />
				) : (
					/* Footer - Full for desktop */
					<div className="flex items-center justify-between bg-[#00B3FF] px-6 py-5">
						<h4
							className="font-sans text-[18px] font-bold leading-[26px] text-[#032D60]"
						>
							{getText("calc_configure_use_case_total")}
						</h4>
						<div className="flex items-center gap-10">
							<div className="min-w-0 text-center">
								<div
									className="font-sans truncate text-[20px] font-bold leading-[28px] text-[#032D60]"
									title={formatCreditsShort(totalCredits)}
								>
									{formatCreditsShort(totalCredits)}
								</div>
								<div
									className="font-sans truncate text-[12px] leading-[16px] text-[#444444]"
									title={getText("calc_configure_use_case_credits")}
								>
									{getText("calc_configure_use_case_credits")}
								</div>
							</div>
							<div className="min-w-0 text-center">
								<div
									className="font-sans truncate text-[20px] font-bold leading-[28px] text-[#032D60]"
									title={`$ ${formatPriceShort(totalPricing)}`}
								>
									$ {formatPriceShort(totalPricing)}
								</div>
								<div
									className="font-sans truncate text-[12px] leading-[16px] text-[#444444]"
									title={getText("calc_configure_use_case_pricing")}
								>
									{getText("calc_configure_use_case_pricing")}
								</div>
							</div>
						</div>
					</div>
				)
			)}
		</div>
	);
};

export default TemplateConfig;
