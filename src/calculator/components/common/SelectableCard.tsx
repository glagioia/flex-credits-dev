import React, { ReactNode } from "react";

interface SelectableCardProps {
  isSelected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export function SelectableCard({
  isSelected,
  onClick,
  children,
  className = "",
}: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        selectable-card
        flex flex-col items-center justify-center
        border-[2.166px]
        ${isSelected
          ? "selectable-card--selected border-[#0176D3] border-[3px] shadow-[0_10px_10px_0_rgba(6,106,254,0.20)]"
          : "selectable-card--unselected border-[rgba(255,255,255,0.25)] shadow-[0_10px_10px_0_rgba(6,106,254,0.20)]"
        }
        ${className}
      `}
      style={{
        background: "rgba(255, 255, 255, 0.60)",
        borderRadius: "16px",
      }}
    >
      {children}
    </button>
  );
}
