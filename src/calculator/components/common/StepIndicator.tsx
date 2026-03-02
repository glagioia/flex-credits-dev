import React, { useState, useRef, useEffect } from 'react';

export interface Step {
  key: string;
  text: string;
}

interface StepIndicatorProps {
  steps: Step[];
  activeStep: string;
  /** Step keys the user is allowed to navigate to (back or forward). Forward only up to steps already visited. */
  maxReachableStepKey?: string;
  onStepClick?: (stepKey: string) => void;
  isMobile?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  activeStep,
  maxReachableStepKey,
  onStepClick,
  isMobile = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownType, setDropdownType] = useState<'before' | 'after'>('after');
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  const activeIndex = steps.findIndex((step) => step.key === activeStep);
  const maxReachableIndex = maxReachableStepKey != null
    ? steps.findIndex((step) => step.key === maxReachableStepKey)
    : activeIndex - 1;

  const isStepClickable = (index: number) => {
    if (!onStepClick || index === activeIndex) return false;
    if (index < activeIndex) return true;
    return index <= maxReachableIndex;
  };

  const handleStepClick = (stepKey: string, index: number) => {
    if (!onStepClick) return;
    if (index < activeIndex || (index > activeIndex && index <= maxReachableIndex)) {
      onStepClick(stepKey);
    }
    setIsDropdownOpen(false);
  };

  const toggleDropdown = (type: 'before' | 'after') => {
    if (isDropdownOpen && dropdownType === type) {
      setIsDropdownOpen(false);
    } else {
      setDropdownType(type);
      setIsDropdownOpen(true);
    }
  };

  // Close dropdown when clicking outside (mobile)
  useEffect(() => {
    if (!isMobile || !isDropdownOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (mobileContainerRef.current && !mobileContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isMobile, isDropdownOpen]);

  // Mobile version
  if (isMobile) {
    let visibleStart: number;
    let visibleEnd: number;

    // Step 1: Show only step 1, hide 2 and 3 in dropdown
    if (activeIndex === 0) {
      visibleStart = 0;
      visibleEnd = 1;
    }
    // Step 2: Show steps 1 and 2, hide step 3 in dropdown
    else if (activeIndex === 1) {
      visibleStart = 0;
      visibleEnd = 2;
    }
    // Step 3: Show only step 3, hide steps 1 and 2 in dropdown
    else if (activeIndex === 2) {
      visibleStart = 2;
      visibleEnd = 3;
    }
    // Default fallback for more than 3 steps
    else {
      visibleStart = Math.max(0, activeIndex);
      visibleEnd = activeIndex + 1;
    }

    const hiddenBefore = steps.slice(0, visibleStart);
    const hiddenAfter = steps.slice(visibleEnd);
    const visibleSteps = steps.slice(visibleStart, visibleEnd);

    const renderDropdownButton = (type: "before" | "after") => (
      <button
        onClick={() => toggleDropdown(type)}
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[4px] border border-[#0176D3]"
      >
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`text-[#0176D3] transition-transform ${
            isDropdownOpen && dropdownType === type ? "rotate-180" : ""
          }`}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );

    const renderDropdownMenu = (hiddenSteps: Step[], position: 'left' | 'right') => {
      if (!isDropdownOpen || hiddenSteps.length === 0) return null;
      if ((position === 'left' && dropdownType !== 'before') ||
          (position === 'right' && dropdownType !== 'after')) return null;

      return (
        <div
          className={`font-sans absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[200px] z-50 ${
            position === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {hiddenSteps.map((step) => {
            const stepIndex = steps.findIndex((s) => s.key === step.key);
            const clickable = isStepClickable(stepIndex);
            const content = (
              <span className="text-[14px] font-medium">
                {stepIndex + 1}. {step.text}
              </span>
            );
            return (
              <div key={step.key} className="w-full">
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.key, stepIndex)}
                    className="w-full px-4 py-3 text-left flex items-center text-[#0176D3] hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {content}
                  </button>
                ) : (
                  <div className="w-full px-4 py-3 text-left flex items-center">
                    <span className="text-[#032D60]">{content}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="relative inline-flex" ref={mobileContainerRef}>
        <div className="font-sans inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-3 shadow-sm">
          {/* Dropdown for hidden previous steps */}
          {hiddenBefore.length > 0 && (
            <>
              {renderDropdownButton('before')}
              <span className="text-[14px] font-normal text-[#181818] opacity-60">
                &gt;
              </span>
            </>
          )}

          {/* Visible steps */}
          {visibleSteps.map((step, idx) => {
            const stepIndex = steps.findIndex((s) => s.key === step.key);
            const isActive = step.key === activeStep;
            const clickable = isStepClickable(stepIndex);
            const isLast = idx === visibleSteps.length - 1;

            return (
              <React.Fragment key={step.key}>
                {clickable ? (
                  <button
                    onClick={() => handleStepClick(step.key, stepIndex)}
                    className="whitespace-nowrap text-[14px] font-sans font-normal text-[#0176D3] underline transition-opacity hover:opacity-80"
                  >
                    {stepIndex + 1}. {step.text}
                  </button>
                ) : (
                  <span
                    className={`whitespace-nowrap text-[14px] font-sans ${
                      isActive ? "font-bold text-[#0B5CAB]" : "font-normal text-[#0B5CAB]"
                    }`}
                  >
                    {stepIndex + 1}. {step.text}
                  </span>
                )}
                {(!isLast || hiddenAfter.length > 0) && (
                  <span className="text-[14px] font-sans font-normal text-[#181818] opacity-60">&gt;</span>
                )}
              </React.Fragment>
            );
          })}

          {/* Dropdown for hidden future steps */}
          {hiddenAfter.length > 0 && renderDropdownButton('after')}
        </div>

        {/* Dropdown menus */}
        {renderDropdownMenu(hiddenBefore, 'left')}
        {renderDropdownMenu(hiddenAfter, 'right')}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="font-sans inline-flex items-center gap-4 rounded-full bg-white px-6 py-3 shadow-sm">
      {steps.map((step, index) => {
        const isActive = step.key === activeStep;
        const clickable = isStepClickable(index);

        return (
          <React.Fragment key={step.key}>
            {clickable ? (
              <button
                onClick={() => handleStepClick(step.key, index)}
                className="text-[14px] font-medium text-[#0176D3] underline transition-opacity hover:opacity-80"
              >
                {index + 1}. {step.text}
              </button>
            ) : (
              <span className={`text-[14px] ${isActive ? "font-bold text-[#0176D3]" : "font-medium text-[#032D60]"}`}>
                {index + 1}. {step.text}
              </span>
            )}
            {index < steps.length - 1 && <span className="font-normal text-[#181818] opacity-60">&gt;</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
