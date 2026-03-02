import React from "react";
import { SelectableCard } from "./";


export interface CompanySizeCardOption {
  id: string;
  badge: string;
  range: string;
  unit: string;
}

interface CompanySizeCardProps {
  size: CompanySizeCardOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function CompanySizeCard({
  size,
  isSelected,
  onSelect,
}: CompanySizeCardProps) {
  return (
    <SelectableCard
      isSelected={isSelected}
      onClick={() => onSelect(size.id)}
      className="company-size-card w-[200px] h-[120px] gap-[8px]"
    >
      <span 
        className="company-size-card__badge flex items-center justify-center shrink-0 gap-[12px] font-sans"
        style={{
          height: '22.5px',
          padding: '0 8px',
          borderRadius: '12px',
          border: '1px solid #04E1CB',
          background: '#04E1CB',
          color: '#024D4C',
          fontFeatureSettings: "'liga' off, 'clig' off",
          fontSize: '12px',
          fontWeight: 700,
          lineHeight: '18px',
          letterSpacing: '0.024px'
        }}
      >
        {size.badge}
      </span>
      <div className="flex flex-col items-start self-stretch">
        <span 
          className="company-size-card__range self-stretch text-center text-[#032D60] text-[24px] font-semibold font-display"
          style={{ 
            height: '30px',
            lineHeight: '32px',
            letterSpacing: '-0.06px',
            fontVariantNumeric: 'lining-nums proportional-nums',
            fontFeatureSettings: "'liga' off, 'clig' off"
          }}
        >
          {size.range}
        </span>
        <span 
          className="company-size-card__unit self-stretch text-center text-[#032D60] text-[16px] font-normal font-sans"
          style={{ 
            height: '22.5px',
            lineHeight: '24px',
            letterSpacing: '0.02px',
            fontFeatureSettings: "'liga' off, 'clig' off"
          }}
        >
          {size.unit}
        </span>
      </div>
    </SelectableCard>
  );
}
