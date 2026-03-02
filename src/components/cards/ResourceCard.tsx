import React from "react";
import { type CardResource } from "../../types/Page";
import { Link } from "../Link";

export function ResourceCard({ resource }: { resource: CardResource }) {
	const { headline, description, badge, link_1 } = resource;

	return (
		<Link
			url={link_1.url || ""}
			className="h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-8 outline outline-1 outline-offset-[-1px] outline-white/10 focus:outline-2 focus:outline-white/30"
			trackingName={link_1.label || "Resource"}>
			{/* Content */}
			<div className="flex flex-col gap-2">
				<div className="text-left text-white">
					<h3 className="mb-4 text-4xl group-hover:text-blue-600">{headline}</h3>
					{description && <p className="mb-6" dangerouslySetInnerHTML={{ __html: description }} />}
				</div>
				{/* Badge */}
				{badge && (
					<div className="flex flex-wrap gap-2">
						{badge.split(",").map((badgeText, index) => (
							<span
								key={index}
								className="color-white inline-block rounded-full border border-white px-3 py-1 text-xs uppercase text-white">
								{badgeText.trim()}
							</span>
						))}
					</div>
				)}
			</div>
		</Link>
	);
}
