import React from "react";

const Description = ({ descriptionText, isMobile }: { descriptionText: string; isMobile: boolean }) => (
	<p
		className={
			isMobile
				? "m-0 p-0 text-center text-[16px] font-normal leading-[24px] text-[#023248] font-sans"
				: "mx-auto max-w-2xl self-stretch text-center text-[20px] font-normal leading-[30px] tracking-[0.02px] text-[#023248] font-sans"
		}
		style={{
			fontFeatureSettings: "'liga' off, 'clig' off",
		}}
	>
		{descriptionText}
	</p>
);

export default Description;
