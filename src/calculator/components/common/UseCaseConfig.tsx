import React, { useState, useEffect } from 'react';
import { InputRow } from './index';
import { Data360 } from '@sfdc/eaas/sdk';
import { getText } from '../../../utils/textUtils';
import { formatCreditsShort, formatPriceShort } from '../../utils/estimationFormatters';

interface InputConfig {
  min?: number;
  max?: number;
  default?: number;
}

interface UseCaseConfigProps {
  useCase: Data360.UseCase;
  credits: number;
  price: number;
  initialInputValues?: Record<string, number>;
  onInputChange?: (useCaseId: string, values: Record<string, number>) => void;
  /** Header background color. Defaults to dark blue (#032D60) for Data360. */
  headerBgColor?: string;
  /** Whether to render for mobile layout */
  isMobile?: boolean;
  /** When true, inputs are displayed read-only (no editing) */
  readOnly?: boolean;
}

const UseCaseConfig: React.FC<UseCaseConfigProps> = ({
  useCase,
  credits,
  price,
  initialInputValues,
  onInputChange,
  headerBgColor = '#032D60',
  isMobile = false,
  readOnly = false,
}) => {
  const [inputValues, setInputValues] = useState<Record<string, number>>({});
  const [initialized, setInitialized] = useState(false);

  // Initialize input values when useCase changes
  useEffect(() => {
    if (initialized) return;

    const initialValues: Record<string, number> = {};
    useCase.inputs?.forEach((input) => {
      const config = input.config as InputConfig | undefined;
      const key = input.key ?? (input as { inputKey?: string }).inputKey ?? '';
      initialValues[key] = initialInputValues?.[key] ?? initialInputValues?.[input.key ?? ''] ?? config?.default ?? 0;
    });

    setInputValues(initialValues);
    setInitialized(true);
  }, [useCase, initialInputValues, initialized]);

  const handleInputChange = (inputKey: string, value: number) => {
    if (readOnly) return;
    const newValues = {
      ...inputValues,
      [inputKey]: value,
    };
    setInputValues(newValues);
    onInputChange?.(useCase.id, newValues);
  };

  const renderInput = (input: Data360.UseCaseInput, index: number) => {
    const config = input.config as InputConfig | undefined;
    const key = input.key ?? (input as { inputKey?: string }).inputKey ?? '';
    const value = inputValues[key] ?? inputValues[input.key ?? ''] ?? config?.default ?? 0;

    if (readOnly) {
      return (
        <InputRow
          key={input.key}
          label={input.label}
          tooltip={input.description}
          description={input.description}
          hideBorder={index === 0}
          isMobile={isMobile}
          disabled
          value={value}
          children={<span className="text-base font-medium text-[#032D60]">{Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>}
        />
      );
    }

    return (
      <InputRow
        key={input.key}
        inputKey={input.key}
        label={input.label}
        tooltip={input.description}
        description={input.description}
        dataType={input.type}
        config={config}
        value={value}
        onChange={(val) => handleInputChange(key, val)}
        hideBorder={index === 0}
        isMobile={isMobile}
      />
    );
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="mb-6 overflow-hidden rounded-[16px] border border-[#D8E6F1]">
        {/* Header */}
        <div className="px-6 py-5" style={{ backgroundColor: headerBgColor }}>
          <h3
            className="text-[20px] font-bold leading-[28px] text-white font-sans"
          
          >
            {useCase.title}
          </h3>
          <p
            className="mt-1 text-[14px] leading-[20px] text-white/80 font-sans"
          >
            {getText("calc_configure_use_case_subtitle")}
          </p>
          {/* Stats row */}
          <div className="mt-4 flex items-center justify-between border-t border-white/20 px-8 pt-4 font-sans">
            <div className="text-center">
              <div
                className="text-[20px] font-bold leading-[28px] text-white font-sans"
                
              >
                {formatCreditsShort(credits)}
              </div>
              <div
                className="text-[12px] leading-[16px] text-white/80 font-sans"
               
              >
                {getText("calc_configure_use_case_credits")}
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-[20px] font-bold leading-[28px] text-white font-sans"
              >
                $ {formatPriceShort(price)}
              </div>
              <div
                className="text-[12px] leading-[16px] text-white/80 font-sans"
              >
                {getText("calc_configure_use_case_pricing")}
              </div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-white bg-opacity-50 px-6 py-2">{useCase.inputs?.map((input, index) => renderInput(input, index))}</div>

        {/* Footer - Small bar only */}
        <div className="h-3 rounded-b-[16px] font-sans" style={{ backgroundColor: headerBgColor }} />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="mb-6 overflow-hidden rounded-[16px] border border-[#D8E6F1]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5" style={{ backgroundColor: headerBgColor }}>
        <div>
          <h3
            className="text-[20px] font-bold leading-[28px] text-white font-sans"
          >
            {useCase.title}
          </h3>
          <p
            className="mt-1 text-[14px] leading-[20px] text-white/80 font-sans"
          >
            {getText("calc_configure_use_case_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-10">
          <div className="text-center">
            <div
              className="text-[20px] font-bold leading-[28px] text-white font-sans"
            >
              {formatCreditsShort(credits)}
            </div>
            <div
              className="text-[12px] leading-[16px] text-white/80 font-sans"
            >
              {getText("calc_configure_use_case_credits")}
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-[20px] font-bold leading-[28px] text-white font-sans"
            >
              $ {formatPriceShort(price)}
            </div>
            <div
              className="text-[12px] leading-[16px] text-white/80 font-sans"
            >
              {getText("calc_configure_use_case_pricing")}
            </div>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-white bg-opacity-50 px-6 py-2">{useCase.inputs?.map((input, index) => renderInput(input, index))}</div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-5" style={{ backgroundColor: headerBgColor }}>
        <h4
          className="font-sans text-[18px] font-bold leading-[26px] text-white"
        >
          {getText("calc_configure_use_case_total")}
        </h4>
        <div className="flex items-center gap-10">
          <div className="text-center">
            <div
              className="font-sans text-[20px] font-bold leading-[28px] text-white"
            >
              {formatCreditsShort(credits)}
            </div>
            <div
              className="font-sans text-[12px] leading-[16px] text-white/80"
            >
              {getText("calc_configure_use_case_credits")}
            </div>
          </div>
          <div className="text-center">
            <div
              className="font-sans text-[20px] font-bold leading-[28px] text-white"
            >
              $ {formatPriceShort(price)}
            </div>
            <div
              className="font-sans text-[12px] leading-[16px] text-white/80"
            >
              {getText("calc_configure_use_case_pricing")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCaseConfig;
