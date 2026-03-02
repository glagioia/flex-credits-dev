import React from "react";

const SubHeader = ({ subHeaderText, isMobile }: { subHeaderText: string; isMobile: boolean }) => (
	<h2
		className={
			isMobile
				? "m-0 p-0 text-center font-display text-[24px] font-semibold leading-[32px] text-[#023248]"
				: "mb-0 text-center font-display text-[40px] font-semibold leading-[48px] tracking-[-0.13px] text-[#023248]"
		}
		style={{
			fontFeatureSettings: "'liga' off, 'clig' off",
		}}
	>
		{subHeaderText}
	</h2>
);

export default SubHeader;
