import React, { useId } from 'react';
import { NumberInput, Slider, Tooltip } from './index';

interface InputConfig {
  min?: number;
  max?: number;
  default?: number;
}


export interface InputRowProps {
  /** Display label/title */
  label: string;
  /** Optional tooltip text (shown on hover of info icon) */
  tooltip?: string;
  /** Optional description text (shown below the label) */
  description?: string;
  /** Whether to render for mobile layout */
  isMobile?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether to hide the top border */
  hideBorder?: boolean;
  /** When true (mobile layout), pushes input to bottom so multiple rows align horizontally */
  alignInputToBottom?: boolean;
  /** Custom input element - if provided, overrides dataType-based rendering */
  children?: React.ReactNode;
  // --- Props for built-in input rendering (used when children is not provided) ---
  /** Input key identifier */
  inputKey?: string;
  /** Input type: 'PERCENT' for slider with %, 'NUMBER' for number input */
  dataType?: string;
  /** Input configuration (min, max, default) */
  config?: InputConfig;
  /** Current value */
  value?: number;
  /** Called when value changes */
  onChange?: (value: number) => void;
}

const InputRow: React.FC<InputRowProps> = ({
  label,
  tooltip,
  description,
  isMobile = false,
  disabled = false,
  hideBorder = false,
  alignInputToBottom = false,
  children,
  dataType,
  config,
  value = 0,
  onChange,
}) => {
  // Generate unique IDs for accessibility
  const uniqueId = useId();
  const labelId = `input-label-${uniqueId}`;
  const descriptionId = description ? `input-desc-${uniqueId}` : undefined;

  const isPercent = dataType === 'PERCENT';

  // Render built-in input based on dataType (when children not provided)
  const renderBuiltInInput = () => {
    if (!dataType || !onChange) return null;

    if (isPercent) {
      return (
        <Slider
          value={value}
          onChange={onChange}
          min={config?.min ?? 0}
          max={config?.max ?? 100}
          isPercentage
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
        />
      );
    }

    return (
      <NumberInput
        value={value}
        onChange={onChange}
        min={config?.min}
        max={config?.max}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
      />
    );
  };

  // Clone children to pass accessibility props if they're React elements
  const enhancedChildren = children
    ? React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            'aria-labelledby': labelId,
            'aria-describedby': descriptionId,
          });
        }
        return child;
      })
    : null;

  const inputElement = enhancedChildren || renderBuiltInInput();

  // Mobile layout: stacked vertically
  if (isMobile) {
    return (
      <div
        className={`flex flex-1 flex-col py-5 ${hideBorder ? '' : 'border-t border-[#D8E6F1]'}`}
      >
        {/* Title with optional tooltip */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            id={labelId}
            className="text-[16px] font-bold leading-[20px] text-[#023248] font-sans"
          >
            {label}
          </span>
          {tooltip && <Tooltip content={tooltip} />}
        </div>

        {/* Description */}
        {description && (
          <p
            id={descriptionId}
            className={`text-[14px] leading-[20px] mt-2 font-sans ${
              disabled ? 'text-[#B0ADAB]' : 'text-[#706E6B]'
            }`}
          >
            {description}
          </p>
        )}

        {/* Input - full width below */}
        {inputElement && (
          <div className={`mt-4 w-full ${alignInputToBottom ? 'mt-auto' : ''}`}>
            {inputElement}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout: horizontal with input on the right
  return (
    <div
      className={`flex items-start justify-between py-5 ${
        hideBorder ? '' : 'border-t border-[#FFF]'
      }`}
    >
      <div className="flex-1 pr-8">
        {/* Title with optional tooltip */}
        <div className="flex items-center gap-2">
          <span
            id={labelId}
            className="text-[16px] font-bold leading-[20px] text-[#023248] font-sans"
          >
            {label}
          </span>
          {tooltip && <Tooltip content={tooltip} />}
        </div>

        {/* Description */}
        {description && (
          <p
            id={descriptionId}
            className={`text-[14px] leading-[20px] mt-2 font-sans ${
              disabled ? 'text-[#B0ADAB]' : 'text-[#706E6B]'
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {/* Input on the right */}
      {inputElement && (
        <div className="w-[336px] flex-shrink-0">
          {inputElement}
        </div>
      )}
    </div>
  );
};

export default InputRow;
