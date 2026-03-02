import React from "react";
import { SelectableCard } from "./";

export interface IndustryCardOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface IndustryCardProps {
  industry: IndustryCardOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}



export function IndustryCard({ industry, isSelected, onSelect }: IndustryCardProps) {
  return (
		<SelectableCard
			isSelected={isSelected}
			onClick={() => onSelect(industry.id)}
			className="industry-card flex h-[120px] w-[200px] flex-col items-center justify-center gap-2 rounded-2xl p-6 "
		>
			<div className="h-[40px] w-[40px] flex-shrink-0 [&>svg]:h-full [&>svg]:w-full">
				{industry.icon}
			</div>
			<span
				className="industry-card__label text-center text-[16px] font-bold leading-[20px] text-[#023248] font-display"
			>
				{industry.label}
			</span>
		</SelectableCard>
	);
}
