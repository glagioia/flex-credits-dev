import { useState } from "react";
import { SelectorSection, ShowMoreToggle, CalculatorBackground, FormDetails } from "../home/ui";
import { Button, CustomSelect, SelectOption, IndustryCard, CompanySizeCard, IndustryCardOption } from "../common";
import { IndustryIcon } from "../icons";
import bombSvg from "../home/ui/assets/bomb.svg"
import pinkStar from "../home/ui/assets/pink_star.svg";
import { Taxonomy } from '@sfdc/eaas/sdk'
import { CompanySizeCardOption } from "../common/CompanySizeCard";
import { trackContentClick } from "../../utils/analytics";
import { getText } from "../../../utils/textUtils";
import { getIndustryIconType } from "../../utils/industryIconMapper";

const getMobileOptions = (industries: Taxonomy.Industry[], companySizes: Taxonomy.CompanySize[]): { industryOptions: SelectOption[], companySizeOptions: (SelectOption & { message?: string; sizeDetails?: string })[]} => {
  const industryOptions = industries.map((option) => ({
    id: option.id,
    label: option.displayName,
    icon: <IndustryIcon type={getIndustryIconType(option)} className="w-6 h-6" />,
  }))

  const companySizeOptions = companySizes.map((option) => ({
    id: option.id,
    label: option.systemName,
    message: option.displayName,
    sizeDetails: option.sizeDetails,
  }))

  return { industryOptions, companySizeOptions }
}

const getCardOptions = (industries: Taxonomy.Industry[], companySizes: Taxonomy.CompanySize[]):  { industryCards: IndustryCardOption[], companySizeCards: CompanySizeCardOption[]} => {
  const industryCards = industries.map((option) => ({
    id: option.id,
    label: option.displayName,
    icon: <IndustryIcon type={getIndustryIconType(option)} />,
  }))

  const companySizeCards = companySizes.map((option) => ({
		id: option.id,
		badge: option.displayName,
		range: option.sizeDetails.split(" ")[0],
		unit: option.sizeDetails.split(" ")[1] || getText("calc_home_company_selector_employee"),
	}));

  return { industryCards, companySizeCards }
}

const INITIAL_VISIBLE_COUNT = 10

interface PricingCalculatorProps {
  industries: Taxonomy.Industry[];
  companySizes: Taxonomy.CompanySize[];
  onSubmit: (industryId: string, companySizeId: string) => void;
  isMobile?: boolean
}

export function PricingCalculator({ 
  industries,
  companySizes,
  onSubmit,
  isMobile
}: PricingCalculatorProps) {
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  const { industryOptions, companySizeOptions } = getMobileOptions(industries, companySizes)
  const { industryCards, companySizeCards } = getCardOptions(industries, companySizes)
  
  const visibleIndustries = showAllIndustries ? industryCards : industryCards.slice(0, INITIAL_VISIBLE_COUNT);

  const isFormComplete = selectedIndustryId !== null && selectedSizeId !== null;

  const handleStartEstimate = () => {
    if (!isFormComplete) return;
    trackContentClick({
			bladeName: "sf/pricing-calculator/intro",
			moduleName: "Introduction Navigation",
			linkText: getText("calc_home_button_start_estimate"),
			linkType: "primary cta",
			modulePosition: "3",
			moduleType: "cta",
		});
    onSubmit(selectedIndustryId, selectedSizeId);
  };

  const handleIndustrySelect = (id: string) => {
    const label = industryCards.find((c) => c.id === id)?.label;
    if (label) {
      trackContentClick({
				bladeName: "sf/pricing-calculator/intro",
				moduleName: getText("calc_home_industry_selector_title"),
				linkText: label,
			});
    }
    setSelectedIndustryId(id);
  };

  const handleCompanySizeSelect = (id: string) => {
    const sizeCard = companySizeCards.find((c) => c.id === id);
    const linkText = sizeCard ? `${sizeCard.range} ${sizeCard.unit}` : undefined;
    if (linkText) {
      trackContentClick({
				bladeName: "sf/pricing-calculator/intro",
				moduleName: getText("calc_home_company_selector_title"),
				linkText,
				modulePosition: "2",
			});
    }
    setSelectedSizeId(id);
  };

  if (isMobile)
    return (
			<div className="mx-auto max-w-4xl px-4 py-10 md:px-8" style={{paddingTop: isMobile ? "1rem" : "", paddingBottom: isMobile ? "0px" : ""}}>
				<div
					className="relative flex w-full flex-col items-start overflow-visible"
					style={{
						height: "330px",
						padding: "32px 10px 41px 10px",
						gap: "10px",
						borderRadius: "16px",
						border: "2px solid rgba(255, 255, 255, 0.25)",
						background: "linear-gradient(180deg, rgba(144, 208, 254, 0.80) 0%, rgba(234, 245, 254, 0.80) 100%)",
						boxShadow: "0 24px 48px -4px rgba(24, 24, 24, 0.20)",
					}}
				>
					{/* Industry Selector */}
					<div className="w-full">
						<label
							className="block p-0 text-left font-display"
							style={{
								color: "#023248",
								fontVariantNumeric: "lining-nums proportional-nums",
								fontFeatureSettings: "'liga' off, 'clig' off",
								fontSize: "16px",
								fontWeight: 600,
								lineHeight: "24px",
								letterSpacing: "0.08px",
							}}
						>
							{getText("calc_home_industry_selector_title")}
						</label>
						{/* 16px de espacio */}
						<div className="mt-4 w-full">
							<CustomSelect
								options={industryOptions}
								value={selectedIndustryId}
								onChange={(id) => {
									const label = industryOptions.find((o) => o.id === id)?.label;
									if (label) {
										trackContentClick({
											bladeName: "sf/pricing-calculator/intro",
											moduleName: getText("calc_home_industry_selector_title"),
											linkText: label,
										});
									}
									setSelectedIndustryId(id);
								}}
								placeholder={getText("calc_home_industry_selector_placeholder")}
							/>
						</div>
					</div>

					{/* 30px de espacio */}
					<div className="mt-[30px] w-full">
						<label
							className="block p-0 text-left font-display"
							style={{
								color: "#023248",
								fontVariantNumeric: "lining-nums proportional-nums",
								fontFeatureSettings: "'liga' off, 'clig' off",
								fontSize: "16px",
								fontWeight: 600,
								lineHeight: "24px",
								letterSpacing: "0.08px",
							}}
						>
							{getText("calc_home_company_selector_title")}
						</label>
						{/* 16px de espacio */}
						<div className="mt-4 w-full">
							<CustomSelect
								options={companySizeOptions.map((cs) => ({
									...cs,
									label: (cs.sizeDetails ?? cs.label) + " Employees" + " - " + (cs.message ?? ""),
								}))}
								value={selectedSizeId}
								onChange={(id) => {
									const option = companySizeOptions.find((o) => o.id === id);
									const linkText = option ? (option.sizeDetails ?? option.label) + " Employees" + " - " + (option.message ?? "") : undefined;
									if (linkText) {
										trackContentClick({
											bladeName: "sf/pricing-calculator/intro",
											moduleName: getText("calc_home_company_selector_title"),
											linkText,
											modulePosition: "2",
										});
									}
									setSelectedSizeId(id);
								}}
								placeholder={getText("calc_home_company_selector_placeholder")}
							/>
						</div>
					</div>

					{/* Decorative Elements */}
					<div className="pointer-events-none absolute -bottom-8">
						<div
							style={{
								width: "24px",
								height: "26px",
								backgroundImage: `url(${pinkStar})`,
								backgroundSize: "contain",
								backgroundRepeat: "no-repeat",
								left: isMobile ? "0px" : "-1rem"
							}}
						/>
					</div>
					<div className="pointer-events-none absolute -bottom-4 left-8" style={{bottom: isMobile ? "-2rem" : "-1rem"}}>
						<div
							style={{
								width: "40px",
								height: "43px",
								backgroundImage: `url(${pinkStar})`,
								backgroundSize: "contain",
								backgroundRepeat: "no-repeat",
							}}
						/>
					</div>
					<div className="pointer-events-none absolute -bottom-10 -right-4" style={{ width: "145px", height: "91px" }}>
						<img src={bombSvg} alt="" className="h-full w-full object-contain" />
					</div>
				</div>

				{/* Submit Button Section */}
				<div className="mt-[120px] w-full pb-[40px] [&>div]:w-full [&_button]:w-full">
					<Button onClick={handleStartEstimate} disabled={!isFormComplete}>
						{getText("calc_home_button_start_estimate")}
					</Button>
				</div>
			</div>
		);

  return (
		<div
			className={`relative mx-auto flex w-full flex-col max-w-[1360px] ${showAllIndustries ? "min-h-[1410px]" : "min-h-[1073px]"} mb-20 mt-0 overflow-visible px-4 pb-10 md:px-8`}
		>
			{/* SVG Background Layer */}
			<CalculatorBackground isExpanded={showAllIndustries} />
			{/* Decorative elements on top */}
			<FormDetails isExpanded={showAllIndustries} />

			{/* Content Layer */}
			<div className="relative z-10 flex min-h-0 flex-1 flex-col items-center gap-[48px] pt-[150px]">
				{/* Industry Selector Section */}
				<SelectorSection title={getText("calc_home_industry_selector_title")} className="w-full max-w-[1360px]">
					<div className="flex flex-col items-center justify-between">
						<div className="flex flex-wrap items-center justify-center gap-x-[36px] gap-y-[32px]">
							{visibleIndustries.map((industry) => (
								<IndustryCard
									key={industry.id}
									industry={industry}
									isSelected={selectedIndustryId === industry.id}
									onSelect={handleIndustrySelect}
								/>
							))}
						</div>
						{industries.length > INITIAL_VISIBLE_COUNT && (
							<ShowMoreToggle
								isExpanded={showAllIndustries}
								onToggle={() => setShowAllIndustries(!showAllIndustries)}
								showMoreLabel={getText("calc_home_industry_selector_show_more")}
								showLessLabel={getText("calc_home_industry_selector_show_less")}
								className="mt-[32px]"
							/>
						)}
					</div>
				</SelectorSection>

				{/* Company Size Selector Section */}
				<SelectorSection title={getText("calc_home_company_selector_title")} className="w-full max-w-[908px]">
					<div className="flex flex-wrap items-center justify-center gap-x-[36px] gap-y-[32px]">
						{companySizeCards.map((size) => (
							<CompanySizeCard
								key={size.id}
								size={size}
								isSelected={selectedSizeId === size.id}
								onSelect={handleCompanySizeSelect}
							/>
						))}
					</div>
				</SelectorSection>

				<div className="flex min-h-0 flex-1 flex-col justify-end pb-[140px] max-[986px]:pb-[220px]">
					<div className="min-h-0 flex-1" aria-hidden="true" />
					<Button onClick={handleStartEstimate} disabled={!isFormComplete}>
						{getText('calc_home_button_start_estimate')}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default PricingCalculator;
