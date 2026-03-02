import React from "react";
import { type Text } from "../../types/Page";
import { Link } from "../Link";

interface TextBladeProps {
	blade: Text;
	theme?: "light" | "light_gradient" | "night";
}

const TextBlade: React.FC<TextBladeProps> = ({ blade, theme = "light" }) => {
	const textColor = theme === "night" ? "text-white" : "text-gray-900";
	const { headline, description, link_1, link_2, eyebrow, blade_layout, headline_size, column_grid } =
		blade.attributes || {};

	// Determine layout classes based on blade_layout and column_grid
	const getLayoutClasses = () => {
		if (column_grid === "two-column") {
			return "lg:grid lg:grid-cols-2 lg:gap-16";
		}
		if (column_grid === "three-column") {
			return "lg:grid lg:grid-cols-3 lg:gap-12";
		}
		return ""; // Single column default
	};

	// Determine headline size
	const getHeadlineClasses = () => {
		switch (headline_size) {
			case "large":
				return "text-5xl lg:text-6xl";
			case "medium":
				return "text-4xl lg:text-5xl";
			case "small":
				return "text-3xl lg:text-4xl";
			default:
				return "text-4xl lg:text-5xl"; // Default medium
		}
	};

	// Determine if it's a centered layout
	const isCenteredLayout = blade_layout === "centered" || blade_layout === "center";

	return (
		<div className="w-full">
			<div className="container">
				<div className={`${getLayoutClasses()} ${isCenteredLayout ? "text-center" : ""}`}>
					<div className={`${column_grid ? "" : "mx-auto max-w-4xl"} ${isCenteredLayout ? "mx-auto" : ""}`}>
						{eyebrow && (
							<div className="mb-6">
								{eyebrow.image && <img src={eyebrow.image.src} alt={eyebrow.image.alt || ""} className="mb-3 h-8 w-8" />}
								{eyebrow.label && <div className="text-sm font-medium">{eyebrow.label}</div>}
							</div>
						)}

						<h2
							className={`${getHeadlineClasses()} mb-6 leading-tight ${textColor}`}
							dangerouslySetInnerHTML={{ __html: headline || "" }}
						/>

						{description && (
							<div className={`mb-8 text-lg leading-relaxed ${textColor}`} dangerouslySetInnerHTML={{ __html: description }} />
						)}

						{(link_1 || link_2) && (
							<div
								className={`flex gap-4 ${isCenteredLayout ? "justify-center" : ""} ${column_grid ? "flex-col sm:flex-row" : "flex-col sm:flex-row"}`}>
								{link_1 && (
									<Link
										url={link_1.url}
										variant={link_1.variant}
										trackingName={link_1.label || ""}
										trackingVariant="sf/react-external">
										{link_1.label}
									</Link>
								)}
								{link_2 && (
									<Link
										url={link_2.url}
										variant={link_2.variant}
										trackingName={link_2.label || ""}
										trackingVariant="sf/react-external">
										{link_2.label}
									</Link>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export { TextBlade };
