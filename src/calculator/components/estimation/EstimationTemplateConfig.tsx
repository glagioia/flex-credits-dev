import React, { useState, useEffect } from 'react';
import { NumberInput, Slider } from '../common';
import { getText } from '../../../utils/textUtils';
import type { Agentforce } from '@sfdc/eaas/sdk';
import { getFormulaChipLabels } from '../common/TemplateConfig';

interface InputConfig {
  min?: number;
  max?: number;
  default?: number;
}

export interface EstimationTemplateConfigProps {
  template: Agentforce.Template;
  topics: Agentforce.Topic[];
  topicCredits: Record<string, number>;
  topicPrices: Record<string, number>;
  /** Topic id -> true when toggled off (selected: false). Display as disabled with 0 credits/price. */
  disabledTopics?: Record<string, boolean>;
  initialTopicInputValues?: Record<string, Record<string, number>>;
  readOnly?: boolean;
  onTopicInputChange?: (topicId: string, values: Record<string, number>) => void;
  /** Not used in estimation (no per-topic toggle); kept for API compatibility. */
  onTopicToggle?: (topicId: string, enabled: boolean) => void;
  inputLayout?: 'stacked' | 'inline';
  contentMaxWidth?: number | string;
}

export const EstimationTemplateConfig: React.FC<EstimationTemplateConfigProps> = ({
  template,
  topics,
  topicCredits,
  topicPrices,
  disabledTopics,
  initialTopicInputValues,
  readOnly = false,
  onTopicInputChange,
  inputLayout = 'inline',
  contentMaxWidth = 1800,
}) => {
  const [topicInputValues, setTopicInputValues] = useState<Record<string, Record<string, number>>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [showFormulas, setShowFormulas] = useState(false);
  const [initializedTopicIds, setInitializedTopicIds] = useState<string[]>([]);

  useEffect(() => {
    const currentTopicIds = topics.map((t) => t.id);
    const newTopicIds = currentTopicIds.filter((id) => !initializedTopicIds.includes(id));
    if (newTopicIds.length === 0) return;

    const newExpanded: Record<string, boolean> = {};
    const newValues: Record<string, Record<string, number>> = {};

    topics.forEach((topic) => {
      if (!initializedTopicIds.includes(topic.id)) {
        const saved = initialTopicInputValues?.[topic.id];
        const inputValues: Record<string, number> = {};
        topic.inputs?.forEach((input) => {
          const config = input.config as InputConfig | undefined;
          inputValues[input.key] = saved?.[input.key] ?? config?.default ?? 0;
        });
        newValues[topic.id] = inputValues;
        newExpanded[topic.id] = topics.indexOf(topic) === 0;
      }
    });

    if (Object.keys(newValues).length > 0) {
      setTopicInputValues((prev) => ({ ...prev, ...newValues }));
      setExpandedTopics((prev) => ({ ...prev, ...newExpanded }));
      setInitializedTopicIds(currentTopicIds);
    }
  }, [topics, initialTopicInputValues]);

  const toggleTopicExpanded = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleInputChange = (topicId: string, inputKey: string, value: number) => {
    setTopicInputValues((prev) => {
      const newValues = {
        ...prev[topicId],
        [inputKey]: value,
      };
      onTopicInputChange?.(topicId, newValues);
      return {
        ...prev,
        [topicId]: newValues,
      };
    });
  };

  const renderInput = (
    topic: Agentforce.Topic,
    input: Agentforce.TopicInput,
    disabled: boolean
  ) => {
    const config = input.config as InputConfig | undefined;
    const value = topicInputValues[topic.id]?.[input.key] ?? config?.default ?? 0;

    if (input.dataType === 'HIDDEN') return null;

    if (input.dataType === 'PERCENT') {
      return (
        <div className="flex justify-between py-5 flex-col gap-8 items-start">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2">
              <span
                className={`font-sans text-[16px] font-bold leading-[20px] ${disabled ? 'text-[#B0ADAB]' : 'text-[#023248]'}`}
              >
                {input.label}
              </span>
            </div>
            {input.description && (
              <p
                className={`font-sans text-[16px] leading-[20px] mt-1 ${disabled ? 'text-[#B0ADAB]' : 'text-[#023248]'}`}
              >
                {input.description}
              </p>
            )}
          </div>
          <div className="w-full md:max-w-[350px] flex-shrink-0">
            <Slider
              value={value}
              onChange={(val) => handleInputChange(topic.id, input.key, val)}
              min={config?.min ?? 0}
              max={config?.max ?? 100}
              isPercentage
              disabled={disabled}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between py-5 flex-col gap-8 items-start">
        <div className="flex-1 pr-8">
          <div className="flex items-center gap-2">
            <span
              className={`font-sans text-[#023248] font-semibold text-[16px] leading-[24px] tracking-[0.08px] ${disabled ? 'text-[#B0ADAB]' : 'text-[#023248]'}`}
            >
              {input.label}
            </span>
          </div>
          {input.description && (
            <p
              className={`font-sans text-[16px] leading-[20px] mt-1 ${disabled ? 'text-[#B0ADAB]' : 'text-[#023248]'}`}
            >
              {input.description}
            </p>
          )}
        </div>
        <div className="w-full max-w-[350px] flex-shrink-0">
          <NumberInput
            value={value}
            onChange={(val) => handleInputChange(topic.id, input.key, val)}
            min={config?.min}
            max={config?.max}
            disabled={disabled}
          />
        </div>
      </div>
    );
  };

  const contentStyle = contentMaxWidth
    ? { maxWidth: typeof contentMaxWidth === 'number' ? `${contentMaxWidth}px` : contentMaxWidth }
    : undefined;

  return (
    <div style={contentStyle}>
      <div>
        {topics.map((topic, index) => {
          const isDisabled = disabledTopics?.[topic.id] === true;
          const isExpanded = expandedTopics[topic.id] ?? false;
          const hasInputs = topic.inputs && topic.inputs.length > 0;
          const credits = isDisabled ? 0 : (topicCredits[topic.id] ?? topic.mostLikelyCredits ?? 0);
          const pricing = isDisabled ? 0 : (topicPrices[topic.id] ?? 0);

          return (
            <div
              key={topic.id}
              className={`transition-colors ${isDisabled ? 'bg-[#F3F3F3]' : 'bg-[#e7f4ff]'} ${index > 0 ? 'border-t border-[#D8E6F1]' : ''}`}
            >
              <div className="md:py-5 w-full">
                {/* Topic title row */}
                <div className="flex justify-between md:flex-row flex-col items-start md:items-center gap-3 w-full py-4 md:p-0">
                  <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => hasInputs && toggleTopicExpanded(topic.id)}
                    className={`mt-1 flex-shrink-0 transition-transform ${isExpanded ? '' : '-rotate-90'} ${!hasInputs ? 'invisible' : ''}`}
                  >
                    <svg className={`h-5 w-5 ${isDisabled ? 'text-[#B0ADAB]' : 'text-[#023248]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <h4
                      className={`font-sans font-semibold text-[20px] leading-[28px] tracking-[-0.06px] cursor-pointer ${isDisabled ? 'text-[#B0ADAB]' : 'text-[#023248]'}`}
                      onClick={() => hasInputs && toggleTopicExpanded(topic.id)}
                    >
                      {topic.displayName}
                    </h4>
                    {topic.description && (
                      <p
                        className={`font-sans text-[14px] leading-[20px] mt-1 max-w-[480px] ${isDisabled ? 'text-[#B0ADAB]' : 'text-[#706E6B]'}`}
                      >
                        {topic.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center min-w-[56px]">
                    <div className={`font-sans text-[20px] font-semibold leading-[28px] tracking-[-0.06px] whitespace-nowrap ${isDisabled ? 'text-[#B0ADAB]' : 'text-[#022AC0]'}`}>
                      {isDisabled ? 0 : 1}
                    </div>
                    <div className={`font-sans text-[13px] leading-[18px] ${isDisabled ? 'text-[#B0ADAB]' : 'text-[#706E6B]'}`}>
                      {getText("calc_configure_use_case_actions")}
                    </div>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <div className={`font-sans text-[20px] font-semibold leading-[28px] tracking-[-0.06px] whitespace-nowrap ${isDisabled ? 'text-[#B0ADAB]' : 'text-[#022AC0]'}`}>
                      {Number(credits).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                    <div className={`font-sans text-[13px] leading-[18px] ${isDisabled ? 'text-[#B0ADAB]' : 'text-[#706E6B]'}`}>
                      {getText("calc_configure_use_case_credits")}
                    </div>
                  </div>
                  <div className="text-center min-w-[110px]">
                    <div className={`font-sans text-[20px] font-semibold leading-[28px] tracking-[-0.06px] whitespace-nowrap ${isDisabled ? 'text-[#B0ADAB]' : 'text-[#022AC0]'}`}>
                      {pricing != null ? `$${Number(pricing).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
                    </div>
                    <div className={`font-sans text-[13px] leading-[18px] ${isDisabled ? 'text-[#B0ADAB]' : 'text-[#706E6B]'}`}>
                      {getText("calc_configure_use_case_pricing")}
                    </div>
                  </div>
                </div>
                </div>

              </div>

              {hasInputs && isExpanded && (
                <div className="md:px-6 pb-5 md:ml-8">
                  <div className={inputLayout === 'inline' ? 'flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-6' : ''}>
                    {topic.inputs?.filter((input) => input.dataType !== 'HIDDEN').map((input) => (
                      <div key={input.key} className={inputLayout === 'inline' ? 'md:min-w-[280px] md:flex-1' : ''}>
                        {renderInput(topic, input, readOnly || isDisabled)}
                      </div>
                    ))}
                  </div>
                  {/* <div className="mt-6 pt-4 border-t border-[#ffffff]"> */}
                    {/* <button
                      type="button"
                      onClick={() => setShowFormulas((v) => !v)}
                      className="text-[#0B5CAB] font-bold text-[14px] hover:underline flex items-center gap-1"
                    >
                      {showFormulas ? getText("calc_hide_formulas") : getText("calc_show_formulas")}
                      <span className="inline-block transition-transform" style={{ transform: showFormulas ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </button> */}
                    {/* {showFormulas && (
                      <div className="mt-3">
                        <p className="font-sans text-[14px] text-[#000] mb-2 font-bold">
                          {getText("calc_dashboard_number_of_credits")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {getFormulaChipLabels(topic).map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF5FE] text-[#023248] text-sm border border-[#D8E6F1]"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div> */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
