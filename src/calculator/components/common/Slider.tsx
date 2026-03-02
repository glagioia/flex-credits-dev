import React, { useState, useEffect } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  isPercentage?: boolean;
  allowDecimals?: boolean;
  decimalPlaces?: number;
  disabled?: boolean;
  /** Number of segments/steps for the dots. E.g., 4 = dots at 0%, 25%, 50%, 75%, 100% */
  numSteps?: number;
  /** Optional className for the root container */
  className?: string;
  /** Optional inline style for the root container (e.g. width: 350) */
  style?: React.CSSProperties;
  /** ID of the element that labels this input (for accessibility) */
  'aria-labelledby'?: string;
  /** ID of the element that describes this input (for accessibility) */
  'aria-describedby'?: string;
}

/**
 * Slider Component - Figma Design
 *
 * Features:
 * - Thick track with rounded ends
 * - Dynamic dots based on numSteps parameter (contained within track)
 * - Large thumb with white border
 * - Editable value display box with space for 3 digits (100%)
 * - Real-time sync: typing in input immediately moves slider
 * - Disabled state support
 */
const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min,
  max,
  isPercentage = false,
  allowDecimals = false,
  decimalPlaces = 1,
  disabled = false,
  numSteps = 10,
  className = '',
  style,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  const range = max - min;
  const percentage = ((value - min) / range) * 100;

  // State for the editable input (allows partial typing)
  const [inputValue, setInputValue] = useState<string>(formatValueFn(value));

  function formatValueFn(val: number): string {
    if (allowDecimals) {
      return val.toFixed(decimalPlaces);
    }
    return Math.round(val).toString();
  }

  // Sync input display when value prop changes externally (from slider drag)
  useEffect(() => {
    setInputValue(formatValueFn(value));
  }, [value, allowDecimals, decimalPlaces]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseFloat(e.target.value);
    if (!allowDecimals) {
      newValue = Math.round(newValue);
    } else {
      newValue = parseFloat(newValue.toFixed(decimalPlaces));
    }
    onChange(newValue);
  };

  // Handle direct input - update slider in real-time (onChange)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    // Try to parse and update slider immediately
    let parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      // Clamp to min/max
      if (parsed < min) parsed = min;
      if (parsed > max) parsed = max;

      // Round if not allowing decimals
      if (!allowDecimals) {
        parsed = Math.round(parsed);
      } else {
        parsed = parseFloat(parsed.toFixed(decimalPlaces));
      }

      onChange(parsed);
    }
  };

  // On blur, clean up the display (format properly)
  const handleInputBlur = () => {
    let parsed = parseFloat(inputValue);

    // If invalid, reset to current value
    if (isNaN(parsed)) {
      setInputValue(formatValueFn(value));
      return;
    }

    // Clamp and format
    if (parsed < min) parsed = min;
    if (parsed > max) parsed = max;
    if (!allowDecimals) {
      parsed = Math.round(parsed);
    } else {
      parsed = parseFloat(parsed.toFixed(decimalPlaces));
    }

    setInputValue(formatValueFn(parsed));
  };

  // Small padding to keep dots just inside the track edges (~10px visual margin)
  // The track is rendered at full width, dots get a small inset
  const dotInsetPercent = 4; // 4% inset from each edge (~10px)

  // Calculate dot position with minimal inset
  const getDotPosition = (pct: number) => {
    // Map 0-100 to dotInsetPercent - (100 - dotInsetPercent)
    return dotInsetPercent + (pct / 100) * (100 - 2 * dotInsetPercent);
  };

  // Colors based on state
  const primaryColor = disabled ? 'bg-[#747474]' : 'bg-[#066AFE]';
  const labelColor = disabled ? 'text-[#747474]' : 'text-[#066AFE]';

  // Generate dots dynamically based on numSteps
  const dots = Array.from({ length: numSteps + 1 }, (_, i) => {
    const dotPercentage = (i / numSteps) * 100;
    const dotPosition = getDotPosition(dotPercentage);
    const isActive = dotPercentage <= percentage;

    return (
      <div
        key={i}
        className={`absolute w-2 h-2 rounded-full z-10 -translate-x-1/2 -translate-y-1/2 ${
          isActive ? 'bg-white/70' : 'bg-[#C9C9C9]'
        }`}
        style={{
          left: `${dotPosition}%`,
          top: '50%',
        }}
      />
    );
  });

  // Thumb position with same logic
  const thumbPosition = getDotPosition(percentage);

  return (
    <div
      className={`font-sans h-auto md:h-[82px] flex flex-col-reverse md:flex-row w-full min-w-0 items-center gap-4 p-4 rounded-2xl bg-[#f5f5f5] bg-opacity-50 border-y-2 border-[#FFFFFF] ${!disabled ? 'shadow-[0px_15px_20px_0px_rgba(6,106,254,0.2)]' : ''} ${className}`.trim()}
      style={style}
    >
      {/* Slider Track Container */}
      <div className="w-full md:w-auto flex-1 pt-4">
        {/* Track with extra height for thumb overflow */}
        <div className="relative h-8 flex items-center">
          {/* Track background (gray/inactive) */}
          <div className="absolute w-full h-5 bg-[#E5E5E5] rounded-full" />

          {/* Filled track (blue/gray active) */}
          <div
            className={`absolute h-5 ${primaryColor} rounded-full transition-all duration-200`}
            style={{
              left: 0,
              width: `${thumbPosition}%`,
            }}
          />

          {/* Dots layer */}
          <div className="absolute w-full h-full">
            {dots}
          </div>

          {/* Thumb (large circle with white border) */}
          <div
            className={`absolute w-8 h-8 ${primaryColor} rounded-full border-4 border-white z-20 shadow-md -translate-x-1/2 -translate-y-1/2`}
            style={{
              left: `${thumbPosition}%`,
              top: '50%',
            }}
          />

          {/* Hidden range input for interaction */}
          <input
            type="range"
            min={min}
            max={max}
            step={allowDecimals ? Math.pow(10, -decimalPlaces) : 1}
            value={value}
            onChange={handleSliderChange}
            disabled={disabled}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            className="absolute w-full h-full opacity-0 cursor-pointer z-30 disabled:cursor-not-allowed"
          />
        </div>

        {/* Min/Max labels */}
        <div className="flex justify-between mt-1 px-0">
          <span className={`text-sm font-bold ${labelColor}`}>
            {isPercentage ? `${min}%` : min}
          </span>
          <span className={`text-sm font-bold ${labelColor}`}>
            {isPercentage ? `${max}%` : max}
          </span>
        </div>
      </div>

      {/* Editable Value display box - supports up to 3 digits */}
      <div className="flex-shrink-0 min-w-[80px] h-14 border-[2.5px] rounded-2xl flex items-center justify-center bg-white" style={{borderColor: disabled ? "#939393" : "#032D60"}}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className="w-[45px] text-center text-[#032D60] text-[24px] font-black bg-transparent outline-none disabled:cursor-not-allowed"
          style={{ fontVariantNumeric: 'tabular-nums', color: disabled ? "#B0ADAB" : ""}}
        />
        {isPercentage && (
          <span className="text-[#032D60] text-base font-bold" style={{ color: disabled ? "#939393" : ""}}>%</span>
        )}
      </div>
    </div>
  );
};

export default Slider;