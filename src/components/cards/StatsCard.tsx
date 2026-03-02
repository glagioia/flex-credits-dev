import React, { useState, useEffect } from "react";
import { type CardStatistic } from "../../types/Page";
import { Link } from "../Link";

export function StatisticCard({ stat }: { stat: CardStatistic }) {
	const { statistic, caption, description, link_1, counter_animation } = stat;
	const [displayValue, setDisplayValue] = useState(counter_animation ? "0" : statistic);

	useEffect(() => {
		if (counter_animation) {
			// Simple counter animation
			const numericValue = parseInt(statistic.replace(/[^\d]/g, ""));
			if (!isNaN(numericValue)) {
				const increment = numericValue / 50; // 50 steps
				let current = 0;
				const timer = setInterval(() => {
					current += increment;
					if (current >= numericValue) {
						setDisplayValue(statistic);
						clearInterval(timer);
					} else {
						setDisplayValue(Math.floor(current).toString() + statistic.replace(/\d/g, "").slice(0, 1));
					}
				}, 40); // 2 second total animation

				return () => clearInterval(timer);
			}
		}
	}, [statistic, counter_animation]);

	const cardContent = (
		<div className="h-full p-6">
			{/* Statistic */}
			<div className="text-center">
				<div className="mb-2 text-4xl text-blue-600">{displayValue}</div>
				<h3 className="mb-2 text-lg">{caption}</h3>
				{description && <p className="text-sm">{description}</p>}
			</div>
		</div>
	);

	if (link_1) {
		return (
			<div className="h-full">
				<Link
					url={link_1.url || ""}
					className="block h-full"
					trackingName={link_1.label || "Statistic"}
					trackingVariant="sf/react-external">
					{cardContent}
				</Link>
			</div>
		);
	}

	return <div className="h-full">{cardContent}</div>;
}
