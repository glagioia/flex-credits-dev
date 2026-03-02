import React, { useState } from 'react';
import { Button, RecommendedBadge } from '../common';
import { ProductIcon } from '../icons';
import { trackContentClick } from '../../utils/analytics';
import { getText } from '../../../utils/textUtils';

interface Product {
  id: string;
  displayName: string;
  description: string;
  recommended?: boolean;
}

export const PRODUCT_AGENTFORCE = 'agentforce';
export const PRODUCT_DATA360 = 'data360';

const products: Product[] = [
	{
		id: PRODUCT_AGENTFORCE,
		displayName: getText("calc_product_agentforce_name"),
		description: getText("calc_product_agentforce_description"),
	},
	{
		id: PRODUCT_DATA360,
		displayName: getText("calc_product_data360_name"),
		description: getText("calc_product_data360_description"),
	},
];

interface SelectProductProps {
	onNext?: (selectedProductId: string) => void;
	/** Initially selected product ID (for showing blue border when returning to this step) */
	initialSelectedProduct?: string | null;
	isMobile?: boolean;
}

const SelectProductStep: React.FC<SelectProductProps> = ({ onNext, initialSelectedProduct = null, isMobile }) => {
	const [selectedProductId, setSelectedProductId] = useState<string | null>(initialSelectedProduct);

	const handleProductSelect = (product: Product) => {
		trackContentClick({
			bladeName: "sf/pricing-calculator/select",
			moduleName: "Select Product",
			linkText: product.displayName,
			linkType: "primary cta",
			modulePosition: product.id === PRODUCT_AGENTFORCE ? "1" : "2",
			moduleType: "cta",
		});
		setSelectedProductId(product.id);
	};

	const handleNext = () => {
		if (!selectedProductId || !onNext) return;
		trackContentClick({
			bladeName: "sf/pricing-calculator/select",
			moduleName: "Selection Navigation",
			linkText: getText("calc_product_selection_button_next"),
			linkType: "primary cta",
			modulePosition: "3",
			moduleType: "cta",
		});
		onNext(selectedProductId);
	};

	return (
		<div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
			{/* Section Title */}
			<h3
				className="font-sans mb-6 text-center text-[20px] font-bold text-[#023248] md:text-[24px]"
			>
				{getText("calc_product_selection_subtitle")}
			</h3>

			{/* Products Grid - Vertical on mobile, Horizontal on desktop */}
			<div className="flex flex-col gap-4 md:flex-row md:justify-center md:gap-6 md:px-0">
				{products.map((product) => {
					const isSelected = selectedProductId === product.id;

					return (
						<button
							key={product.id}
							onClick={() => handleProductSelect(product)}
							className={`flex flex-col relative rounded-[24px] border-[3px] border-solid bg-[#F0F8FF] p-5 text-left transition-all duration-200 w-[366px] h-[200px] ${
								isSelected ? "border-[#0176D3]" : "border-white/30"
							}`}
							style={{
								boxShadow: isSelected ? "" : "0 4px 12px 0 #066AFE33",
								width: isMobile ? "100%" : "366px",
								height: isMobile ? "150px" : "200px" 
							}}
						>
							{/* Recommended Badge */}
							{product.recommended && (
								<div className="absolute right-4 top-4">
									<RecommendedBadge />
								</div>
							)}

							{/* Icon */}
							<div className="mb-3 flex gap-3 items-center">
								<ProductIcon type={product.id} />

								{/* Product Name */}
								<h4
								className="font-sans text-[20px] font-bold text-[#0176D3] md:text-[24px]"
							>
								{product.displayName}
							</h4>
							</div>

							{/* Description */}
							<p
								className="font-sans text-[16px] leading-[20px] text-[#023248] md:text-[15px] md:leading-[22px]"
							>
								{product.description}
							</p>
						</button>
					);
				})}
			</div>

			{/* Next Button */}
			<div className="mt-8 md:mt-12 md:pb-12 [&>div]:w-full md:[&>div]:w-auto [&_button]:w-full md:[&_button]:w-auto">
				<Button onClick={handleNext} disabled={!selectedProductId}>
					{getText("calc_product_selection_button_next")}
				</Button>
			</div>
		</div>
	);
};

export default SelectProductStep;
