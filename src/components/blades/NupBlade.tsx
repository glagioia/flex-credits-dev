import React, { JSX } from "react";
import {
	Nup,
	CardResource,
	CardHeadshot,
	CardQuote,
	CardStatistic,
} from "../../types/Page";
import { ResourceCard, HeadShotCard, QuoteCard, StatisticCard } from "../cards";
import { Link } from "../Link";

interface NupBladeProps {
	blade: Nup;
	theme?: "light" | "light_gradient" | "night";
}

export function NupBlade({ blade, theme = "light" }: NupBladeProps): JSX.Element {
	const textColor = theme === "night" ? "text-white" : "text-gray-900";
	const { headline, description, link_1, link_2 } = blade.attributes || {};
	const mediaItems = blade.media_items || [];

	return (
		<div className="w-full">
			<div className="container">
				{/* Header Section */}
				{(headline || description) && (
					<div className={`mb-12 text-center ${textColor}`}>
						{headline && <h2 className="mb-4 text-3xl md:text-4xl">{headline}</h2>}
						{description && <p className="mx-auto max-w-2xl text-lg" dangerouslySetInnerHTML={{ __html: description }} />}
					</div>
				)}

				{/* Cards Grid */}
				{mediaItems.length > 0 && (
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{mediaItems.map((item) => (
							<div key={item.id}>
								{item.kind === "card_resource" && <ResourceCard resource={item as CardResource} />}
								{item.kind === "card_headshot" && <HeadShotCard headshot={item as CardHeadshot} />}
								{item.kind === "card_quote" && <QuoteCard quote={item as CardQuote} />}
								{item.kind === "card_statistic" && <StatisticCard stat={item as CardStatistic} />}
							</div>
						))}
					</div>
				)}

				{/* CTA Links */}
				{(link_1 || link_2) && (
					<div className="mt-12 flex flex-wrap justify-center gap-4">
						{link_1 && (
							<Link
								url={link_1.url}
								trackingName={link_1.label || ""}
								trackingVariant="sf/react-external"
								variant={link_1.variant}>
								{link_1.label}
							</Link>
						)}
						{link_2 && (
							<Link
								url={link_2.url}
								trackingName={link_2.label || ""}
								trackingVariant="sf/react-external"
								variant={link_2.variant}>
								{link_2.label}
							</Link>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
