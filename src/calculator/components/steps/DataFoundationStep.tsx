import React, { useState, useMemo, useId } from 'react';
import { Button, Description, NumberInput, Slider, SubHeader, Toggler, Tooltip } from '../common';
import { Data360 } from '@sfdc/eaas/sdk';
import { getText } from '../../../utils/textUtils';

interface InputConfig {
  min?: number;
  max?: number;
  default?: number;
}

interface DataFoundationStepProps {
  inputs: Data360.DataFoundationInput[];
  onNext: (responses: Record<string, number | boolean>) => void;
  onClose: () => void;
  isMobile?: boolean;
  /** Initial responses to pre-populate the form (for editing) */
  initialResponses?: Record<string, number | boolean>;
}


// Close Icon Component
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="#023248"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Input Item Component - Renders different input types based on dataType
interface InputItemProps {
  input: Data360.DataFoundationInput;
  value: number | boolean;
  onChange: (value: number | boolean) => void;
  isMobile?: boolean;
}

const InputItem: React.FC<InputItemProps> = ({ input, value, onChange, isMobile }) => {
  // Generate unique IDs for accessibility
  const uniqueId = useId();
  const labelId = `df-input-label-${uniqueId}`;
  const descriptionId = input.description ? `df-input-desc-${uniqueId}` : undefined;

  const config = input.config as InputConfig | undefined;
  const isPercent = input.type === 'PERCENT';
  const isNumber = input.type === 'NUMBER';
  const isToggle = input.type === 'TOGGLE' || input.type === 'BOOLEAN';

  const renderInput = () => {
    if (isToggle) {
      return (
        <Toggler
          value={value as boolean}
          onChange={(boolValue) => onChange(boolValue)}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
        />
      );
    }

    if (isPercent) {
      return (
        <Slider
          value={value as number}
          onChange={onChange}
          min={config?.min ?? 0}
          max={config?.max ?? 100}
          isPercentage
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
        />
      );
    }

    if (isNumber) {
      return (
        <NumberInput
          value={value as number}
          onChange={onChange}
          min={config?.min}
          max={config?.max}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
        />
      );
    }

    // Fallback for unknown types - treat as number
    return (
      <NumberInput
        value={value as number}
        onChange={onChange}
        min={config?.min}
        max={config?.max}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
      />
    );
  };

  // Mobile layout - stacked (but toggle is inline)
  if (isMobile) {
    if (isToggle) {
      return (
        <div className="py-6 border-t border-gray-200 first:border-t-0">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2 flex-1">
              <span id={labelId} className="text-[#023248] text-[18px] font-bold leading-[26px]">
                {input.label}
              </span>
              <Tooltip content={input.description ?? ""} position="bottom" />
            </div>
            {renderInput()}
          </div>
          {input.description && (
            <p id={descriptionId} className="text-[#023248] text-[14px] leading-[20px] mt-2">
              {input.description}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="py-6 border-t border-gray-200 first:border-t-0">
        <div className="flex items-start gap-2 mb-2">
          <span id={labelId} className="text-[#023248] text-[18px] font-bold leading-[26px]">
            {input.label}
          </span>
          <Tooltip content={input.description ?? ""} position="bottom" />
        </div>
        {input.description && (
          <p id={descriptionId} className="text-[#023248] text-[14px] leading-[20px] mb-4">
            {input.description}
          </p>
        )}
        {renderInput()}
      </div>
    );
  }

  // Desktop layout - side by side
  const inputWidth = isToggle ? 'w-auto' : 'w-[320px]';

  return (
    <div className="flex items-center justify-between py-5 border-t border-[#FFF] first:border-t-0">
      <div className="flex-1 pr-8">
        <div className="flex items-center gap-2">
          <span
            id={labelId}
            className="font-sans text-[#023248] text-[16px] font-bold leading-[24px]"
          >
            {input.label}
          </span>
          <Tooltip content={input.description ?? ""} position="top" />
        </div>
        {input.description && (
          <p
            id={descriptionId}
            className="font-sans text-[#023248] text-[14px] leading-[20px] mt-1"
          >
            {input.description}
          </p>
        )}
      </div>
      <div className={inputWidth}>
        {renderInput()}
      </div>
    </div>
  );
};

// Close Button Component
const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="absolute right-4 top-4 z-10 p-2" aria-label="Close">
    <CloseIcon />
  </button>
);

// Header Component
const Header: React.FC<{ title: string; description: string; isMobile: boolean }> = ({
  title,
  description,
  isMobile,
}) => (
  <div className="flex flex-col items-center gap-[28px] px-8 pb-4 pt-8">
    <SubHeader subHeaderText={title} isMobile={isMobile} />
    <Description descriptionText={description} isMobile={isMobile} />
  </div>
);

// Inputs List Component
const InputsList: React.FC<{
  inputs: Data360.DataFoundationInput[];
  responses: Record<string, number | boolean>;
  onInputChange: (key: string, value: number) => void;
  isMobile?: boolean;
}> = ({ inputs, responses, onInputChange, isMobile }) => (
  <div className="flex-1 overflow-y-auto px-8 pb-4">
    <div>
      {inputs.map((input) => (
        <InputItem
          key={input.id}
          input={input}
          value={responses[input.key] ?? 0}
          onChange={(value) => onInputChange(input.key, value as number)}
          isMobile={isMobile}
        />
      ))}
    </div>
  </div>
);

// Main Component
const DataFoundationStep: React.FC<DataFoundationStepProps> = ({
  inputs,
  onNext,
  onClose,
  isMobile = false,
  initialResponses,
}) => {
  // Initialize responses with initial values (if editing) or default values from inputs
  const [responses, setResponses] = useState<Record<string, number | boolean>>(() => {
    const initial: Record<string, number | boolean> = {};
    inputs.forEach((input) => {
      const config = input.config as InputConfig | undefined;
      const isToggle = input.type === 'TOGGLE' || input.type === 'BOOLEAN';
      if (isToggle) {
        initial[input.key] = initialResponses?.[input.key] ?? false;
      } else {
        const raw = initialResponses?.[input.key] ?? config?.default ?? 0;
        const numVal = typeof raw === 'number' ? raw : 0;
        const displayVal = input.type === 'PERCENT' && numVal <= 1 ? Math.round(numVal * 100) : numVal;
        initial[input.key] = displayVal;
      }
    });
    return initial;
  });

  const handleInputChange = (inputKey: string, value: number | boolean) => {
    setResponses((prev) => ({
      ...prev,
      [inputKey]: value,
    }));
  };

  const handleNext = () => {
    onNext(responses);
  };

  // All inputs are now visible (PERCENT, NUMBER, and TOGGLE types supported)
  const visibleInputs = useMemo(() => {
    return inputs;
  }, [inputs]);

  const header = (
		<Header
			title={getText("calc_data_foundation_subtitle")}
			description={getText("calc_data_foundation_description")}
			isMobile={isMobile}
		/>
	);
  const inputList = (
		<InputsList inputs={visibleInputs} responses={responses} onInputChange={handleInputChange} isMobile={isMobile} />
	);

  // Mobile layout
  if (isMobile) {
    return (
			<div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
				<CloseButton onClick={onClose} />
				{header}
				{inputList}
				<div className="mt-[120px] w-full pb-[40px] [&>div]:w-full [&_button]:w-full">
					<Button onClick={handleNext}>{getText("calc_data_foundation_button_go_to_use_cases")}</Button>
				</div>
			</div>
		);
  }

// Desktop modal layout
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pt-[100px]">
      {/* 1. Wrapper principal de escritorio con shadow que contornea la curva final */}
      <div
        className="relative mx-4 flex max-h-[85vh] w-full max-w-[1000px] flex-col"
        style={{ filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))" }}
      >
        {/* 2. Cuerpo del modal: light-blue con bordes redondeados SOLO arriba y base plana */}
        <div className="relative flex flex-col overflow-hidden rounded-t-[24px] bg-[#D9EDFC]">
          <CloseButton onClick={onClose} />
          {header}
          {inputList}
          <div className="flex justify-end bg-gradient-to-t from-[#D9EDFC] to-transparent px-8 py-6">
					<Button onClick={handleNext}>{getText("calc_data_foundation_button_go_to_use_cases")}</Button>
				</div>
        </div>
        {/* Rounded Footer */}
        <div className="w-full leading-[0] mt-[-1px]">
          <svg
            className="w-full h-20 text-[#D9EDFC] block"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 L1440,0 L1440,70 C1440,100 1410,100 1410,100 C720,20 30,100 30,100 C0,100 0,70 0,70 L0,0 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DataFoundationStep;