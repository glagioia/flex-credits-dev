import React, { JSX } from "react";
import { getParentBladeData } from "../utils/getParentBladeData";

interface LinkProps {
	children: React.ReactNode;
	url?: string;
	target?: string;
	className?: string;
	variant?: "primary" | "secondary" | "tertiary" | "text" | "card" | "trial";
	trackingName?: string;
	trackingVariant?: string;
	onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const getLinkClasses = (variant: LinkProps["variant"], className: string) => {
	const baseClasses = "inline-flex items-center justify-center transition-all duration-200 font-medium";
	
	const variantClasses: Record<NonNullable<LinkProps["variant"]>, string> = {
		primary: "bg-[#066AFE] hover:bg-blue-700 text-white rounded-full px-6 py-3",
		secondary: "bg-white hover:bg-gray-50 text-[#066AFE] border border-[#066AFE] hover:border-blue-700 rounded-full px-6 py-3",
		tertiary: "bg-black hover:bg-gray-800 text-white rounded-full px-6 py-3",
		text: "text-[#066AFE] hover:text-blue-700 underline",
		card: "",
		trial: "",
	};

	return `${baseClasses} ${variantClasses[variant || "card"]} ${className}`.trim();
};

export function Link({
	children,
	url = "#",
	target = "_self",
	className = "",
	variant = "card",
	trackingName,
	trackingVariant = "sf/react-external",
	onClick,
}: LinkProps): JSX.Element {
	const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
		// Call custom onClick handler if provided
		if (onClick) {
			onClick(event);
		}

		if (trackingName && trackingVariant) {
			const targetElement = event.target as HTMLElement;
			// Count previous siblings for position
			let previousElementCount = 0;
			let previousSibling = targetElement.previousElementSibling;
			while (previousSibling) {
				previousElementCount++;
				previousSibling = previousSibling.previousElementSibling;
			}
			const bladeData = getParentBladeData();
			const eventDetails = {
				event: "custEv_contentClick",
				blade: {
					id: bladeData.id,
					name: trackingName,
					position: bladeData.position,
					source: "www",
					variant: trackingVariant,
					state: "rendered",
					type: "blade",
					module: {
						id: bladeData.id,
						name: targetElement.innerText,
						type: "cta",
						position: previousElementCount + 1,
						link: {
							text: targetElement.innerText,
							url: targetElement.getAttribute("href"),
							type: `${variant} cta`,
							internalDriver: "",
						},
					},
				},
			};
			if ((window as unknown as { dataLayer: unknown[] }).dataLayer) {
				(window as unknown as { dataLayer: unknown[] }).dataLayer.push({
					...eventDetails,
				});
			}
		}
	};

	return (
		<a
			href={url}
			target={target}
			className={getLinkClasses(variant, className)}
			onClick={handleClick}
			data-tracking-name={trackingName}
			data-tracking-variant={trackingVariant}>
			{children}
		</a>
	);
}

export default Link;
