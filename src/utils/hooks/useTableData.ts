import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Page } from "../../types/Page";

type PageBlades = NonNullable<Page["blades"]>;
export type Blade = PageBlades[number];

interface UseTableDataOptions {
	anchorIds?: string[];
	debug?: boolean;
	removeBlades?: boolean;
}

// Type for processed table data
export type TableDataByKey = Record<string, Record<string, string> | string>;

interface UseTableDataResult {
	loading: boolean;
	error: Error | null;
	totalTableCount: number;
	getTableData: (anchorId: string) => TableDataByKey | null;
	getAllTableData: () => Record<string, TableDataByKey>;
	rawTables: Blade[];
}

declare global {
	interface Window {
		wpdata?: Page;
	}
}

export const useTableData = (
	options: UseTableDataOptions = {},
): UseTableDataResult => {
	const { anchorIds = [], debug = false, removeBlades = true } = options;
	const hasFetched = useRef(false);
	const removedBladeIds = useRef<Set<string>>(new Set());

	// Initialize with window.wpdata if available
	const initialData =
		typeof window !== "undefined" && window.wpdata?.blades
			? (window.wpdata.blades as Blade[])
			: null;
	
	const isLocalDev =
		typeof window !== "undefined" &&
		["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

	const [blades, setBlades] = useState<Blade[] | null>(initialData);
	const [loading, setLoading] = useState<boolean>(!initialData);
	const [error, setError] = useState<Error | null>(null);

	// Logger utility
	const logger = useMemo(
		() => ({
			log: (message: string, data?: unknown) => {
				if (debug) {
					console.log(`[useTableData] ${message}`, data);
				}
			},
			error: (message: string, error?: unknown) => {
				if (debug) {
					console.error(`[useTableData] ${message}`, error);
				}
			},
		}),
		[debug],
	);

	// Fetch blade data
	useEffect(() => {
		if (hasFetched.current || blades) {
			return;
		}

		const fetchData = async () => {
			logger.log("Starting data fetch");
			try {
				hasFetched.current = true;
				setLoading(true);

				if (!isLocalDev) {
					logger.log("Not in local dev; skipping page.json fetch");
					setLoading(false);
					return;
				}

				logger.log("Fetching from /page.json (local dev only)");
				const response = await fetch("page.json");
				
				if (!response.ok) {
					throw new Error(
						`Failed to fetch page.json: ${response.status} ${response.statusText}`,
					);
				}

				const jsonData = (await response.json()) as Page;
				logger.log("Fetched blade data:", jsonData?.blades?.length || 0);
				setBlades((jsonData.blades as Blade[]) || []);
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
	}, [blades, isLocalDev, logger]);

	// Filter and process table blades
	const filteredTables = useMemo(() => {
		if (!blades) return [];

		let tables = blades.filter((blade) => blade.name === "sf/simpletable");

		// Apply anchor_id filtering if specified
		if (anchorIds.length > 0) {
			tables = tables.filter(
				(blade) =>
					blade.attributes?.anchor_id &&
					anchorIds.includes(blade.attributes.anchor_id as string),
			);
		}

		logger.log("Filtered tables:", tables.length);
		return tables;
	}, [blades, anchorIds, logger]);

	// Process tables into data structures grouped by anchor_id
	const tablesByAnchorId = useMemo(() => {
		const result: Record<string, TableDataByKey> = {};

		filteredTables.forEach((table) => {
			const anchorId = table.attributes?.anchor_id as string | undefined;
			if (!anchorId) return;

			const processedTable: TableDataByKey = {};
			const mediaItems = table?.media_items;

			mediaItems?.forEach((item) => {
				const headers =
					item?.head?.[0]?.cells?.map((cell) => cell?.content) || [];
				const isTwoColumnTable = headers.length === 2;

				item.body?.forEach((row) => {
					if (!row.cells) return;

					const key = row.cells[0]?.content;
					if (!key) return;

					if (isTwoColumnTable) {
						// Simple key-value for 2-column tables
						processedTable[key] = row.cells[1]?.content || "";
					} else {
						// Nested object for multi-column tables
						processedTable[key] = {};
						for (let i = 1; i < headers.length; i++) {
							const headerKey = headers[i];
							if (headerKey && row.cells[i]) {
								(processedTable[key] as Record<string, string>)[headerKey] =
									row.cells[i].content || "";
							}
						}
					}
				});
			});

			result[anchorId] = processedTable;
		});

		logger.log("Tables by anchor ID:", result);
		return result;
	}, [filteredTables, logger]);

	// Remove blades from DOM
	useEffect(() => {
		if (!removeBlades || !filteredTables.length) {
			return;
		}

		const scheduleRemoval = (fn: () => void) => {
			if (typeof window !== "undefined" && "requestIdleCallback" in window) {
				(window as Window & { requestIdleCallback: (cb: () => void) => void })
					.requestIdleCallback(fn);
			} else {
				setTimeout(fn, 0);
			}
		};

		scheduleRemoval(() => {
			filteredTables.forEach((blade) => {
				if (!blade?.id || removedBladeIds.current.has(blade.id)) return;

				const selector = `[data-blade-id="${blade.id}"]`;
				const element = document.querySelector(selector);
				
				logger.log(`Removing blade ${blade.id}`, { found: !!element });
				element?.remove();
				removedBladeIds.current.add(blade.id);
			});
		});
	}, [filteredTables, removeBlades, logger]);

	// Getter function for single table data
	const getTableData = useCallback(
		(anchorId: string): TableDataByKey | null => {
			return tablesByAnchorId[anchorId] || null;
		},
		[tablesByAnchorId],
	);

	// Getter function for all table data
	const getAllTableData = useCallback((): Record<string, TableDataByKey> => {
		return tablesByAnchorId;
	}, [tablesByAnchorId]);

	return {
		loading,
		error,
		totalTableCount: filteredTables.length,
		getTableData,
		getAllTableData,
		rawTables: filteredTables,
	};
};
