import React from 'react';
import { getText } from '../../../utils/textUtils';

interface IProps {
  audience: string;
}
const TargetAudienceBadge: React.FC<IProps> = ({ audience }) => {
    const employeeColor = "bg-[#90D0FE] text-[#032D60] font-bold font-sans";
    const customerColor = "bg-[#C29EF1] text-[#032D60] font-bold font-sans";

    const employeeText = getText("calc_agent_facing");
    const customerText = getText("calc_customer");

    const text = audience === "EMPLOYEE" ? employeeText : customerText;

    const backgroundColor = audience === "EMPLOYEE" ? employeeColor : customerColor;

  return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${backgroundColor}`}

		>
			{text}
		</span>
	);
};

export default TargetAudienceBadge;
