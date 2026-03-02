import React, { JSX, Suspense, lazy } from "react";
import { type Blade } from "../utils/hooks/useWpData";
import {
	type Marquee,
	type Nup,
	type Text,
} from "../types/Page";

const MarqueeBlade = lazy(() => import("./blades/MarqueeBlade").then((m) => ({ default: m.MarqueeBlade })));
const TextBlade = lazy(() => import("./blades/TextBlade").then((m) => ({ default: m.TextBlade })));
const NupBlade = lazy(() => import("./blades/NupBlade").then((m) => ({ default: m.NupBlade })));

interface RenderBladesProps {
	blade: Blade;
	theme?: "light" | "light_gradient" | "night";
	debug?: boolean;
}

function BladeLoadingFallback() {
	return <div className="min-h-[200px] animate-pulse bg-gray-100/10" />;
}

export function RenderBlades({ blade, theme = "night", debug = false }: RenderBladesProps): JSX.Element {
	const renderBlade = () => {
		switch (blade.name) {
			case "sf/marquee":
				return <MarqueeBlade blade={blade as Marquee} theme={theme} />;
			case "sf/text":
				return <TextBlade blade={blade as Text} theme={theme} />;
			case "sf/nup":
				return <NupBlade blade={blade as Nup} theme={theme} />;
			default:
				if (debug === true) {
					return (
						<div className="border border-red-300 bg-red-50 p-4 text-red-800">
							<h3 className="">Unknown Blade Type: {blade.name}</h3>
							<p>This blade type is not yet supported.</p>
							<details className="mt-2">
								<summary className="cursor-pointer font-medium">Debug Info</summary>
								<pre className="mt-2 overflow-auto text-xs">{JSON.stringify(blade, null, 2)}</pre>
							</details>
						</div>
					);
				} else {
					return null;
				}
		}
	};

	const content = renderBlade();

	// Don't wrap null/debug content in Suspense
	if (content === null || debug) {
		return content ?? <></>;
	}

	return <Suspense fallback={<BladeLoadingFallback />}>{content}</Suspense>;
}
