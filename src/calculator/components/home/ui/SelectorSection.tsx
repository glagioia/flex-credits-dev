import React, { ReactNode } from "react";

interface SelectorSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SelectorSection({ title, children, className = "" }: SelectorSectionProps) {
  return (
    <div className={`selector-section flex flex-col items-center gap-[36px] ${className}`}>
      <h3 
        className="selector-section__title self-stretch text-[#023248] text-center text-[24px] font-semibold leading-[32px] tracking-[-0.06px] font-display"
        style={{ 
          fontVariantNumeric: 'lining-nums proportional-nums',
          fontFeatureSettings: "'liga' off, 'clig' off"
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
