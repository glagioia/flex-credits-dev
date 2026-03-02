import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  /** ID of the element that labels this input (for accessibility) */
  'aria-labelledby'?: string;
  /** ID of the element that describes this input (for accessibility) */
  'aria-describedby'?: string;
}

const INPUT_MAX_VALUE = 1e12; // UI guardrail in case max is not provided

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

const parseFormattedNumber = (str: string): number => {
  const cleaned = str.replace(/,/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  min,
  max = INPUT_MAX_VALUE,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [displayValue, setDisplayValue] = useState(formatNumber(value));

  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digitsOnly = input.replace(/[^\d]/g, '');

    if (digitsOnly === '') {
      setDisplayValue('');
      // Don't trigger onChange yet - wait for blur to apply min value
      return;
    }

    let numericValue = parseInt(digitsOnly, 10);

    if (min !== undefined && numericValue < min) {
      numericValue = min;
    }
    if (max !== undefined && numericValue > max) {
      numericValue = max;
    }

    setDisplayValue(formatNumber(numericValue));
    onChange(numericValue);
  };

  const handleBlur = () => {
    if (displayValue === '') {
      setDisplayValue(formatNumber(min ?? 0));
      onChange(min ?? 0);
    }
  };

  return (
		<div
			className={`font-sans h-[82px] flex items-center gap-2 rounded-2xl border-y-2 border-[#FFFFFF] bg-[#f5f5f5] bg-opacity-60 p-4 ${!disabled ? "shadow-[0px_15px_20px_0px_rgba(6,106,254,0.2)]" : ""}`}
		>
			<div className="flex h-[50px] w-full flex-shrink-0 items-center justify-center rounded-lg border-[1.5px] border-[#747474] bg-white">
				<input
					type="text"
					value={displayValue}
					onChange={handleChange}
					onBlur={handleBlur}
					placeholder={placeholder}
					disabled={disabled}
					aria-labelledby={ariaLabelledBy}
					aria-describedby={ariaDescribedBy}
					className="w-full bg-transparent text-center text-[24px] font-black text-[#032D60] outline-none disabled:cursor-not-allowed"
					style={{ fontVariantNumeric: "tabular-nums", color: disabled ? "#939393" : "" }}
				/>
			</div>
		</div>
	);
};

export default NumberInput;
