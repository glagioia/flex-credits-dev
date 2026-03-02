import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Page, Contiguouscontainer } from "../../types/Page";

type PageBlades = NonNullable<Page["blades"]>;
export type Blade = PageBlades[number];
export type ContiguousContainer = Contiguouscontainer;

interface UseWpDataOptions {
	removeBlades?: boolean;
	debug?: boolean;
}

interface UseWpDataResult {
	blades: Blade[] | null;
	loading: boolean;
	error: Error | null;
	totalBladeCount: number;
	getSingleBlade: (anchorId: string) => Blade | null;
	getMultipleBlades: (anchorId: string) => Blade[];
	getContainerBlade: (anchorId: string) => ContiguousContainer | null;
	getContainerBlades: (anchorId: string) => ContiguousContainer[];
}

declare global {
	interface Window {
		wpdata?: Page;
	}
}

export const useWpData = (options: UseWpDataOptions = {}): UseWpDataResult => {
	const { removeBlades, debug = false } = options;
	const hasFetched = useRef(false);

	const initialData =
		typeof window !== "undefined" && window.wpdata ? (window.wpdata as Page) : null;
	const isLocalDev =
		typeof window !== "undefined" &&
		["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

	const [data, setData] = useState<Page | null>(initialData);
	const [loading, setLoading] = useState<boolean>(!initialData);
	const [error, setError] = useState<Error | null>(null);

	const logger = useMemo(
		() => ({
			log: (message: string, data?: unknown) => {
				if (debug) {
					console.log(`[useWpData] ${message}`, data);
				}
			},
			error: (message: string, error?: unknown) => {
				if (debug) {
					console.error(`[useWpData] ${message}`, error);
				}
			},
		}),
		[debug],
	);

	logger.log("Initialized with options:", {
		debug,
		removeBlades,
	});

	useEffect(() => {
		// If data is already present (e.g., window.wpdata injected), skip fetching.
		if (hasFetched.current || data) {
			return;
		}

		const fetchData = async () => {
			logger.log("Starting data fetch");
			try {
				hasFetched.current = true;
				setLoading(true);

				if (!isLocalDev) {
					logger.log("window.wpdata not found and not in local dev; skipping fetch");
					setLoading(false);
					return;
				}

				logger.log("window.wpdata not found, fetching from /page.json (local dev only)");
				const response = await fetch("page.json");
				if (!response.ok) {
					throw new Error(
						`Failed to fetch page.json: ${response.status} ${response.statusText}`,
					);
				}
				const jsonData = (await response.json()) as Page;
				logger.log("Fetched jsonData:", jsonData);
				logger.log("Number of blades in jsonData:", jsonData?.blades?.length || 0);
				setData(jsonData);
				setLoading(false);
			} catch (err) {
				logger.error("Error in fetchData:", err);
				setError(
					err instanceof Error ? err : new Error("An unknown error occurred"),
				);
				setLoading(false);
			}
		};

		void fetchData();
	}, [data, isLocalDev, logger]);

	// All blades organized by anchor_id for single blade access
	const singleBladesById = useMemo(() => {
		if (!data?.blades) return {};

		const singleBlades: { [key: string]: Blade } = {};
		data.blades.forEach((blade) => {
			const anchorId = getBladeAnchorId(blade);

			if (anchorId) {
				// Only take the first blade for each anchor_id
				if (!singleBlades[anchorId]) {
					singleBlades[anchorId] = blade as Blade;
				}
			}
		});

		logger.log("Single blades by anchor_id:", singleBlades);

		return singleBlades;
	}, [data?.blades, logger]);

	// All blades grouped by anchor_id for multiple blade access
	const multipleBladesById = useMemo(() => {
		if (!data?.blades) return {};

		const groupedBlades: { [key: string]: Blade[] } = {};
		data.blades.forEach((blade) => {
			const anchorId = getBladeAnchorId(blade);

			if (anchorId) {
				if (!groupedBlades[anchorId]) {
					groupedBlades[anchorId] = [];
				}
				groupedBlades[anchorId].push(blade);
			}
		});

		logger.log("Grouped blades by anchor_id:", groupedBlades);

		return groupedBlades;
	}, [data?.blades, logger]);

	const getSingleBlade = useCallback(
		(anchorId: string): Blade | null => {
			return singleBladesById[anchorId] || null;
		},
		[singleBladesById],
	);

	const getMultipleBlades = useCallback(
		(anchorId: string): Blade[] => {
			return multipleBladesById[anchorId] || [];
		},
		[multipleBladesById],
	);

	const getContainerBlade = useCallback(
		(anchorId: string): ContiguousContainer | null => {
			const blade = singleBladesById[anchorId];
			if (!blade || blade.name !== "sf/contiguouscontainer") return null;
			return blade as ContiguousContainer;
		},
		[singleBladesById],
	);

	const getContainerBlades = useCallback(
		(anchorId: string): ContiguousContainer[] => {
			const containers = multipleBladesById[anchorId] || [];
			return containers.filter(
				(blade): blade is ContiguousContainer => blade.name === "sf/contiguouscontainer",
			);
		},
		[multipleBladesById],
	);

	const removedBladeIds = useRef<Set<string>>(new Set());

	useEffect(() => {
		if (!removeBlades || !data?.blades?.length) {
			return;
		}

		const scheduleRemoval = (fn: () => void) => {
			if (typeof window !== "undefined" && "requestIdleCallback" in window) {
				(window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(fn);
			} else {
				setTimeout(fn, 0);
			}
		};

		scheduleRemoval(() => {
			data.blades?.forEach((blade) => {
				if (!blade?.id || removedBladeIds.current.has(blade.id)) return;
				removeBlade(blade.id, debug);
				removedBladeIds.current.add(blade.id);
			});
		});
	}, [data?.blades, debug, removeBlades]);

	return {
		blades: (data?.blades as Blade[]) || null,
		loading,
		error,
		getSingleBlade,
		getMultipleBlades,
		getContainerBlade,
		getContainerBlades,
		totalBladeCount: data?.blades?.length || 0,
	};
};

// Gets blade based on anchor_id
export const getBladeAnchorId = (blade: Blade): string | undefined => {
	return blade.attributes && "anchor_id" in blade.attributes
		? (blade.attributes.anchor_id as string)
		: undefined;
};

// removes blade from the DOM based on bladeId
export const removeBlade = (bladeId: string, debug = false): void => {
	const selector = `[data-blade-id="${bladeId}"]`;
	const element = document.querySelector(selector);
	if (debug) {
		console.log(
			`[useWpData] Attempting to remove original blade with selector: ${selector}`,
			{
				found: !!element,
			},
		);
	}
	element?.remove();
};

// Extracts child blades from a container blade's media_items
export const getChildBladesFromContainer = (blade: Blade): Blade[] => {
	if (!blade.media_items || !Array.isArray(blade.media_items)) {
		return [];
	}
	// Only items with id, name, attributes are blades
	return blade.media_items.filter(
		(item): item is Blade =>
			typeof item === "object" &&
			item !== null &&
			"id" in item &&
			"name" in item &&
			"attributes" in item,
	);
};
