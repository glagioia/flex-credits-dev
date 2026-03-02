import React from "react";
import { type Marquee } from "../../types/Page";
import { Link } from "../Link";

interface MarqueeBladeProps {
	blade: Marquee;
	theme?: "light" | "light_gradient" | "night";
}

const MarqueeBlade: React.FC<MarqueeBladeProps> = ({ blade, theme = "light" }) => {
	const textColor = theme === "night" ? "text-white" : "text-gray-900";
	const { headline, description, link_1, link_2, media, blade_layout } = blade.attributes || {};

	// Image component
	const imageComponent = media?.image && (
		<div className="mb-8 md:mb-0 md:w-1/3">
			<div className="overflow-hidden rounded-2xl">
				<img
					src={media.image.src}
					alt={media.image.alt || ""}
					className="w-full object-cover"
					width={media.image.width}
					height={media.image.height}
				/>
			</div>
		</div>
	);

	// Content component
	const contentComponent = (
		<div className={`${media?.image ? "md:w-2/3" : "w-full"} flex flex-col justify-center`}>
			<h1 className={`mb-6 text-4xl leading-tight lg:text-5xl [&_strong]:text-[#1AB9FF] ${textColor}`}>
				{headline ? <span dangerouslySetInnerHTML={{ __html: headline }} /> : null}
			</h1>
			{description && (
				<div className={`mb-8 text-lg leading-relaxed ${textColor}`} dangerouslySetInnerHTML={{ __html: description }} />
			)}
			<div className="flex flex-col gap-4 sm:flex-row">
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
		</div>
	);

	return (
		<div className="w-full bg-black bg-[linear-gradient(180deg,#066AFE_0%,#00B3FF_32.94%,#90D0FE_69.55%,#EAF5FE_100%)]">
			<div className="container">
				<div className="px-8 py-12 lg:px-16 lg:py-20">
					<div className={`flex flex-col items-center gap-12 ${media?.image ? "lg:flex-row" : ""}`}>
						{blade_layout === "right" ? (
							<>
								{imageComponent}
								{contentComponent}
							</>
						) : (
							<>
								{contentComponent}
								{imageComponent}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export { MarqueeBlade };
