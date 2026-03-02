import React from "react";
import { type CardHeadshot } from "../../types/Page";
import { Link } from "../Link";

export function HeadShotCard({ headshot }: { headshot: CardHeadshot }) {
	const {
		customer_name,
		customer_attribution_role,
		customer_attribution_company,
		image,
		eyebrow,
		description,
		link_1,
		card_layout,
	} = headshot;

	const alignmentClass =
		card_layout?.[0] === "center" ? "text-center" : card_layout?.[0] === "right" ? "text-right" : "text-left";

	const cardContent = (
		<div className="h-full p-6">
			{/* Eyebrow */}
			{eyebrow && (
				<div className="mb-4">
					{eyebrow.image && <img src={eyebrow.image.src} alt={eyebrow.image.alt || ""} className="mb-2 h-6 w-6" />}
					{eyebrow.label && (
						<span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">{eyebrow.label}</span>
					)}
				</div>
			)}

			{/* Image */}
			<div className="mb-4 flex justify-center">
				<div className="h-20 w-20 overflow-hidden rounded-full">
					<img
						src={image.src}
						alt={image.alt || customer_name}
						className="h-full w-full object-cover"
						width={image.width}
						height={image.height}
					/>
				</div>
			</div>

			{/* Content */}
			<div className={alignmentClass}>
				<h3 className="mb-1 text-lg">{customer_name}</h3>
				<p className="mb-1 text-sm font-medium">{customer_attribution_role}</p>
				<p className="text-sm">{customer_attribution_company}</p>
				{description && <p className="mt-3 text-sm">{description}</p>}
			</div>
		</div>
	);

	if (link_1) {
		return (
			<div className="h-full">
				<Link
					url={link_1.url || ""}
					className="block h-full"
					trackingName={link_1.label || customer_name}
					trackingVariant="sf/react-external">
					{cardContent}
				</Link>
			</div>
		);
	}

	return <div className="h-full">{cardContent}</div>;
}
