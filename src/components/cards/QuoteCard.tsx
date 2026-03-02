import React from "react";
import { type CardQuote } from "../../types/Page";
import { Link } from "../Link";

export function QuoteCard({ quote }: { quote: CardQuote }) {
	const { quote_text, name, role, company_name, quote_image, link_1 } = quote;

	// Extract quote text - handle flexible structure
	const quoteContent =
		typeof quote_text === "string"
			? quote_text
			: (quote_text as any)?.quote || (quote_text as any)?.text || JSON.stringify(quote_text);

	return (
		<div className="h-full">
			<Link
				url={link_1.url || ""}
				className="block h-full"
				trackingName={link_1.label || "Quote"}
				trackingVariant="sf/react-external">
				<div className="h-full p-6">
					{/* Quote Image */}
					{quote_image && (quote_image.headshot || quote_image.logo || quote_image.product) && (
						<div className="mb-4 flex justify-center">
							{quote_image.headshot && (
								<div className="h-16 w-16 overflow-hidden rounded-full">
									<img
										src={quote_image.headshot.src}
										alt={quote_image.headshot.alt || name}
										className="h-full w-full object-cover"
									/>
								</div>
							)}
							{quote_image.logo && !quote_image.headshot && (
								<div className="h-12 w-auto">
									<img
										src={quote_image.logo.src}
										alt={quote_image.logo.alt || company_name}
										className="h-full w-auto object-contain"
									/>
								</div>
							)}
							{quote_image.product && !quote_image.headshot && !quote_image.logo && (
								<div className="h-16 w-16">
									<img
										src={quote_image.product.src}
										alt={quote_image.product.alt || "Product"}
										className="h-full w-full rounded-md object-cover"
									/>
								</div>
							)}
						</div>
					)}

					{/* Quote Text */}
					<div className="mb-4 text-center">
						<blockquote className="text-lg italic">"{quoteContent}"</blockquote>
					</div>

					{/* Attribution */}
					<div className="text-center">
						<p className="">{name}</p>
						<p className="text-sm">{role}</p>
						<p className="text-sm">{company_name}</p>
					</div>
				</div>
			</Link>
		</div>
	);
}
