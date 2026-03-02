import React, { useState, useCallback, useEffect, useRef } from "react";
import SelectProductStep, { PRODUCT_AGENTFORCE, PRODUCT_DATA360 } from "./steps/SelectProductStep";
import { StepIndicator, Step, SubHeader, Description } from "./common";
import { PricingCalculator, ConfigStep, FinalEstimationStep, DataFoundationStep, DownloadReportFormStep, SaveEstimationFormStep } from './steps';
import { SaveEstimationModal, CopyPublicLinkModal, ExportReportModal } from './estimation';
import UseCaseSelectorStep, { type LineOfBusiness } from './steps/UseCaseSelectorStep';
import { HeroStars, HeroFloatingIcon } from './home';
import { useIsMobile } from '../../utils/hooks/useIsMobile';
import { Taxonomy, Estimation, Agentforce, EstimationInputValue, Data360 } from "@sfdc/eaas/sdk";
import { sdk } from "../../sdk";
import { trackContentClick } from "../utils/analytics";
import { generateReportPreviewFromData } from "../pdf/generateReportPreview";
import { parseEstimationReportData } from "../pdf/estimationReportData";
import { getText } from "../../utils/textUtils";
import { EmployeeConfigValues } from "./common";

/** Agent template display name -> module position (1-8) for custEv_contentClick */
const TEMPLATE_MODULE_POSITION: Record<string, string> = {
	"Service Agent": "1",
	"Sales Agent": "2",
	"Scheduling Agent": "3",
	"Commerce Merchant Agent": "4",
	"Commerce Shopper Agent": "5",
	"Leadgen Agent": "6",
	"Loan Product Assistance": "7",
	"Mobile Worker": "8",
};

// Step constants
export const STEP_INDUSTRY_SIZE = 0;
export const STEP_SELECT_PRODUCT = 1;
export const STEP_DATA360_QUESTIONS = 5; // Data 360 specific step (before Add Use Case)
export const STEP_ADD_USE_CASE = 2;
export const STEP_CONFIGURE = 3;
export const STEP_ESTIMATION = 4;
export const STEP_DOWNLOAD_FORM = 6;
export const STEP_DOWNLOAD_REPORT = 7;
export const STEP_SAVE_ESTIMATION_FORM = 8;
export const STEP_ESTIMATE_READY_TO_SHARE = 9;

// Default currency for Agentforce calculations
const DEFAULT_CURRENCY = "USD";

/** Debounce delay (ms) before applying topic input/toggle changes in estimation step */
const ESTIMATION_INPUT_DEBOUNCE_MS = 400;

const steps: Step[] = [
	{ key: STEP_SELECT_PRODUCT.toString(), text: getText("calc_step_select_product") },
	{ key: STEP_ADD_USE_CASE.toString(), text: getText("calc_step_add_use_case") },
	{ key: STEP_CONFIGURE.toString(), text: getText("calc_step_configure") },
];

interface UniversalPricingCalculatorProps {
	forceView?: "auto" | "desktop" | "mobile";
	estimationId?: string;
}

type GetEstimationByIdResponse = {
	id: string;
	industry?: string;
	companySize?: string;
	industryId?: string;
	companySizeId?: string;
	totalCredits?: number;
	totalPrice?: number;
	totalSeats?: number;
	config?: Array<{ product: string; config: unknown }>;
};

const UniversalPricingCalculator: React.FC<UniversalPricingCalculatorProps> = ({ forceView = "auto", estimationId }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [industries, setIndustries] = useState<Taxonomy.Industry[]>([]);
	const [companySizes, setCompanySizes] = useState<Taxonomy.CompanySize[]>([]);
	const [lineOfBusinesses, setLineOfBusinesses] = useState<LineOfBusiness[]>([]);
	const [templates, setTemplates] = useState<Agentforce.Template[]>([]);
	const [useCases, setUseCases] = useState<Data360.UseCase[]>([]);
	const [meters, setMeters] = useState<Data360.Meter[]>([]);
	const [dataFoundationInputs, setDataFoundationInputs] = useState<Data360.DataFoundationInput[]>([]);

	// Topics cache per template (templateId -> topics)
	const [templateTopics, setTemplateTopics] = useState<Record<string, Agentforce.Topic[]>>({});

	// Gating SKUs cache per employee template (templateId -> SKUs)
	const [templateGatingSKUs, setTemplateGatingSKUs] = useState<Record<string, Agentforce.GatingSku[]>>({});

	// Temporary config items being configured (not yet added to estimation)
	const [pendingConfigItems, setPendingConfigItems] = useState<Agentforce.EstimationConfigItem[]>([]);
	const [pendingData360Config, setPendingData360Config] = useState<Data360.EstimationConfigItem | null>(null);

	// Track "working product" - the product being configured that should show as selected (blue border)
	// This persists when going back to Select Product step to show what was being worked on
	const [workingProduct, setWorkingProduct] = useState<string | null>(null);

	// Employee template configurations (templateId -> config values)
	const [employeeTemplateConfigs, setEmployeeTemplateConfigs] = useState<Record<string, EmployeeConfigValues>>({});
	// Track which employee templates are pending (selected but not yet added to estimation)
	const [pendingEmployeeTemplateIds, setPendingEmployeeTemplateIds] = useState<string[]>([]);
	// Pending employee config items (templateId -> EstimationConfigItem)
	const [pendingEmployeeConfigItems, setPendingEmployeeConfigItems] = useState<
		Record<string, Agentforce.EstimationConfigItem>
	>({});

	// Track last known credits/pricing for each topic (persists across step navigation)
	// Used to display values when topic is disabled (visual only, not counted in totals)
	const [lastCreditsByTopicId, setLastCreditsByTopicId] = useState<Record<string, number>>({});
	const [lastPricingByTopicId, setLastPricingByTopicId] = useState<Record<string, number>>({});

	// Track which template was just newly configured (for auto-enabling first topic)
	// Set when clicking "Configure" on a new template, cleared when navigating away from config step
	const [newlyConfiguredTemplateId, setNewlyConfiguredTemplateId] = useState<string | null>(null);

	// "Committed" state - snapshot saved when clicking "Configure another use case"
	// Going back via step indicator restores to this state instead of clearing everything
	const [committedConfigItems, setCommittedConfigItems] = useState<Agentforce.EstimationConfigItem[]>([]);
	const [committedData360Config, setCommittedData360Config] = useState<Data360.EstimationConfigItem | null>(null);
	const [committedEmployeeTemplateIds, setCommittedEmployeeTemplateIds] = useState<string[]>([]);
	const [committedEmployeeConfigItems, setCommittedEmployeeConfigItems] = useState<
		Record<string, Agentforce.EstimationConfigItem>
	>({});
	const [committedEmployeeTemplateConfigs, setCommittedEmployeeTemplateConfigs] = useState<
		Record<string, EmployeeConfigValues>
	>({});

	// Data foundation responses (saved values for editing)
	const [dataFoundationResponses, setDataFoundationResponses] = useState<Record<string, number | boolean>>({});
	// Track which step to return to when closing edit modal
	const [stepBeforeEditFoundationInputs, setStepBeforeEditFoundationInputs] = useState<number | null>(null);

	const [currentStep, setCurrentStep] = useState<number>(STEP_INDUSTRY_SIZE);
	const [maxStepReachedAmongThree, setMaxStepReachedAmongThree] = useState<number>(STEP_SELECT_PRODUCT);
	const [hasReachedEstimation, setHasReachedEstimation] = useState(false);
	const [estimation, setEstimation] = useState<Estimation | null>(null);
	const [hiddenTemplateIds, setHiddenTemplateIds] = useState<Set<string>>(() => new Set());
	const [saveEstimationModalOpen, setSaveEstimationModalOpen] = useState(false);
	const [copyLinkModalOpen, setCopyLinkModalOpen] = useState(false);
	const [exportReportModalOpen, setExportReportModalOpen] = useState(false);
	const [savedPublicLink, setSavedPublicLink] = useState<string>("");
	const [savedLastUpdated, setSavedLastUpdated] = useState<string>("");
	// Refs for debounced estimation update (STEP_ESTIMATION accordion inputs)
	const estimationRef = useRef<Estimation | null>(null);
	const estimationDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const estimationPendingApplyRef = useRef<(() => Promise<void>) | null>(null);

	const isMobileFromHook = useIsMobile();
	const isMobile = forceView === "mobile" || (forceView === "auto" && isMobileFromHook);

	const reportData = React.useMemo(
		() => parseEstimationReportData(estimation, templates, templateTopics, useCases, hiddenTemplateIds, meters),
		[estimation, templates, templateTopics, useCases, hiddenTemplateIds, meters],
	);

	// Keep estimation ref in sync for debounced handlers
	useEffect(() => {
		estimationRef.current = estimation;
	}, [estimation]);

	// Clear debounce timer on unmount
	useEffect(() => {
		return () => {
			if (estimationDebounceTimerRef.current) {
				clearTimeout(estimationDebounceTimerRef.current);
				estimationDebounceTimerRef.current = null;
			}
		};
	}, []);

	// Fetch initial data
	const fetchInitialData = useCallback(async () => {
		try {
			setError(null);
			setLoading(true);
			const [industriesData, companySizesData] = await Promise.all([
				sdk.taxonomy.getIndustries(),
				sdk.taxonomy.getCompanySizes(),
			]);
			setIndustries(industriesData);
			setCompanySizes(companySizesData);

			try {
				const configs = await sdk.estimations.getConfigs();
				const lobData = (configs as any)?.taxonomy?.lineOfBusinesses;
				if (Array.isArray(lobData)) {
					setLineOfBusinesses(lobData.map((l: Record<string, unknown>) => ({
						id: String(l.id),
						systemName: (l.systemName as string) ?? "",
						displayName: (l.displayName as string) ?? "",
						description: l.description as string | undefined,
					})));
				}
			} catch {
				// lineOfBusinesses not available from API, leave empty
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			console.error(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchInitialData();
	}, [fetchInitialData]);

	// Load estimation by ID when URL has ?id= or data-id is passed (e.g. shared link)
	useEffect(() => {
		if (!estimationId || industries.length === 0 || companySizes.length === 0) return;

		let cancelled = false;

		const run = async () => {
			setLoading(true);
			setError(null);

			try {
				const raw = await sdk.estimations.getEstimationById(estimationId);
				if (cancelled) return;

				const resp = raw as unknown as GetEstimationByIdResponse;
				const industryName = resp.industry ?? "";
				const companySizeName = resp.companySize ?? "";
				const industryId = resp.industryId ?? industries.find((i) => i.displayName === industryName)?.id ?? "";
				const companySizeId =
					resp.companySizeId ?? companySizes.find((s) => s.displayName === companySizeName || s.systemName === companySizeName)?.id ?? "";

				const config = Array.isArray(resp.config) ? resp.config : [];
				const hasAgentforce = config.some((pc) => pc.product === PRODUCT_AGENTFORCE);
				const hasData360 = config.some((pc) => pc.product === PRODUCT_DATA360);

				const [templatesData, useCasesData, metersData, dataFoundationInputsData] = await Promise.all([
					hasAgentforce ? sdk.agentforce.getTemplates() : Promise.resolve([]),
					hasData360 ? sdk.data360.getUseCases() : Promise.resolve([]),
					hasData360 ? sdk.data360.getMeters() : Promise.resolve([]),
					hasData360 ? sdk.data360.getDataFoundationInputs() : Promise.resolve([]),
				]);

				if (cancelled) return;

				if (hasAgentforce) setTemplates(templatesData);
				if (hasData360) {
					setUseCases(useCasesData);
					setMeters(metersData);
					setDataFoundationInputs(dataFoundationInputsData);
				}

				const agentforceItems = config
					.filter((pc) => pc.product === PRODUCT_AGENTFORCE && Array.isArray(pc.config))
					.flatMap((pc) => pc.config as Agentforce.EstimationConfigItem[]);
				const uniqueTemplateIds = [...new Set(agentforceItems.map((i) => i.template.templateId))];
				const employeeTemplateIds = uniqueTemplateIds.filter((tid) => {
					const item = agentforceItems.find((i) => i.template.templateId === tid);
					const t = item?.template as { seats?: number; gatingSkuId?: string };
					return (t?.seats ?? 0) > 0 || !!t?.gatingSkuId;
				});
				const topicTemplateIds = uniqueTemplateIds.filter((id) => !employeeTemplateIds.includes(id));

				const [topicsMap, gatingMap] = await Promise.all([
					Promise.all(topicTemplateIds.map((tid) => sdk.agentforce.getTopicsByTemplate(tid).then((topics) => [tid, topics] as const))).then(
						(pairs) => Object.fromEntries(pairs)
					),
					Promise.all(employeeTemplateIds.map((tid) => sdk.agentforce.getGatingSkusByTemplate(tid).then((skus) => [tid, skus] as const))).then(
						(pairs) => Object.fromEntries(pairs)
					),
				]);

				if (cancelled) return;

				setTemplateTopics(topicsMap);
				setTemplateGatingSKUs(gatingMap);

				const normalizedConfig = config.map((pc) => {
					if (pc.product !== PRODUCT_DATA360 || Array.isArray(pc.config)) return pc;
					const cfg = pc.config as Record<string, unknown>;
					const pr = cfg.pricingResults as Record<string, { meters?: unknown[] }> | undefined;
					const meters = Array.isArray(cfg.meters) ? cfg.meters : pr?.FLEX_CREDITS?.meters ?? [];
					return { ...pc, config: { ...cfg, meters } };
				});

				const estimation: Estimation = {
					id: resp.id,
					industryId,
					companySizeId,
					totalCredits: resp.totalCredits,
					totalPrice: resp.totalPrice,
					totalSeats: resp.totalSeats,
					config: normalizedConfig as Estimation["config"],
				};
				setEstimation(estimation);

				const afItems = agentforceItems.filter((i) => {
					const t = i.template as { seats?: number };
					return !((t?.seats ?? 0) > 0);
				});
				const empItems = agentforceItems.filter((i) => {
					const t = i.template as { seats?: number };
					return (t?.seats ?? 0) > 0;
				});

				setCommittedConfigItems(afItems);
				setCommittedEmployeeTemplateIds(employeeTemplateIds);
				const empConfigItems: Record<string, Agentforce.EstimationConfigItem> = {};
				const empTemplateConfigs: Record<string, EmployeeConfigValues> = {};
				empItems.forEach((item) => {
					const tid = item.template.templateId;
					const t = item.template as { seats?: number; gatingSkuId?: string };
					empConfigItems[tid] = item;
					empTemplateConfigs[tid] = {
						skuId: t?.gatingSkuId ?? null,
						seats: t?.seats ?? 0,
					};
				});
				setCommittedEmployeeConfigItems(empConfigItems);
				setCommittedEmployeeTemplateConfigs(empTemplateConfigs);

				const d360Config = config.find((pc) => pc.product === PRODUCT_DATA360);
				if (d360Config && !Array.isArray(d360Config.config)) {
					const cfg = d360Config.config as { inputDataFoundation?: Array<{ inputKey: string; value: number | boolean }> };
					const inputs = cfg.inputDataFoundation ?? [];
					const responses: Record<string, number | boolean> = {};
					inputs.forEach((inp) => {
						responses[inp.inputKey] = inp.value;
					});
					setDataFoundationResponses(responses);
					const normalizedCfg = normalizedConfig.find((pc) => pc.product === PRODUCT_DATA360);
					setCommittedData360Config((normalizedCfg?.config as Data360.EstimationConfigItem) ?? null);
				} else {
					setCommittedData360Config(null);
				}

				const lastProduct = normalizedConfig[normalizedConfig.length - 1]?.product ?? PRODUCT_AGENTFORCE;
				setWorkingProduct(lastProduct);
				setCurrentStep(STEP_ESTIMATION);
				setHasReachedEstimation(true);
				setMaxStepReachedAmongThree(STEP_CONFIGURE);
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Failed to load estimation");
					console.error("[load-by-id]", err);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		run();
		return () => {
			cancelled = true;
		};
	}, [estimationId, industries, companySizes]);

	// Load useCases and meters when estimation has Data360 (e.g. shared link, direct load)
	useEffect(() => {
		const hasData360 = estimation?.config?.some((pc) => pc.product === PRODUCT_DATA360);
		if (hasData360) {
			if (useCases.length === 0) {
				sdk.data360.getUseCases().then(setUseCases).catch((err) => console.error('Failed to fetch Data360 use cases:', err));
			}
			if (meters.length === 0) {
				sdk.data360.getMeters().then(setMeters).catch((err) => console.error('Failed to fetch Data360 meters:', err));
			}
		}
	}, [estimation?.config, useCases.length, meters.length]);

	// Track furthest step reached among Select Product / Add Use Case / Configure
	useEffect(() => {
		if (currentStep === STEP_SELECT_PRODUCT || currentStep === STEP_ADD_USE_CASE || currentStep === STEP_CONFIGURE) {
			setMaxStepReachedAmongThree((prev) => Math.max(prev, currentStep));
		}
	}, [currentStep]);

	// Track when user reaches the estimation step (dashboard)
	useEffect(() => {
		if (currentStep === STEP_ESTIMATION) {
			setHasReachedEstimation(true);
		}
	}, [currentStep]);

	// Helper function to clear all pending items AND committed state
	const clearAllPendingItems = useCallback(() => {
		setPendingConfigItems([]);
		setPendingData360Config(null);
		setPendingEmployeeTemplateIds([]);
		setPendingEmployeeConfigItems({});
		setDataFoundationResponses({});
		// Also clear committed state
		setCommittedConfigItems([]);
		setCommittedData360Config(null);
		setCommittedEmployeeTemplateIds([]);
		setCommittedEmployeeConfigItems({});
		setCommittedEmployeeTemplateConfigs({});
	}, []);

	// Commit current pending state - save a snapshot that can be restored later
	const commitPendingItems = useCallback(() => {
		setCommittedConfigItems([...pendingConfigItems]);
		setCommittedData360Config(pendingData360Config ? { ...pendingData360Config } : null);
		setCommittedEmployeeTemplateIds([...pendingEmployeeTemplateIds]);
		setCommittedEmployeeConfigItems({ ...pendingEmployeeConfigItems });
		setCommittedEmployeeTemplateConfigs({ ...employeeTemplateConfigs });
	}, [
		pendingConfigItems,
		pendingData360Config,
		pendingEmployeeTemplateIds,
		pendingEmployeeConfigItems,
		employeeTemplateConfigs,
	]);

	// Restore pending state from committed snapshot (discard uncommitted changes)
	const restoreToCommittedState = useCallback(() => {
		setPendingConfigItems([...committedConfigItems]);
		setPendingData360Config(committedData360Config ? { ...committedData360Config } : null);
		setPendingEmployeeTemplateIds([...committedEmployeeTemplateIds]);
		setPendingEmployeeConfigItems({ ...committedEmployeeConfigItems });
		setEmployeeTemplateConfigs({ ...committedEmployeeTemplateConfigs });
	}, [
		committedConfigItems,
		committedData360Config,
		committedEmployeeTemplateIds,
		committedEmployeeConfigItems,
		committedEmployeeTemplateConfigs,
	]);

	// Navigation handlers
	const goToStep = useCallback((step: number) => {
		setCurrentStep(step);
		window.scrollTo(0, 0);
	}, []);

	const goToNextStep = useCallback(() => {
		setCurrentStep((prev) => Math.min(prev + 1, STEP_ESTIMATION));
		window.scrollTo(0, 0);
	}, []);

	/**
	 * Handle step indicator clicks - acts as "cancel" for uncommitted changes.
	 * Restores to committed state (keeps previously saved items, discards uncommitted changes).
	 */
	const handleStepIndicatorClick = useCallback(
		(stepKey: string) => {
			const targetStep = parseInt(stepKey, 10);

			if (targetStep < currentStep) {
				// Restore to committed state (discard uncommitted changes, keep committed items)
				restoreToCommittedState();

				if (targetStep === STEP_SELECT_PRODUCT) {
					// Going to Select Product - disable Configure step (user is at product selection)
					setMaxStepReachedAmongThree(STEP_SELECT_PRODUCT);
				} else if (targetStep === STEP_ADD_USE_CASE) {
					// Going to Add Use Case - enable Configure step only if there are committed items
					const hasCommittedItems =
						committedConfigItems.length > 0 ||
						committedData360Config !== null ||
						committedEmployeeTemplateIds.length > 0;
					setMaxStepReachedAmongThree(hasCommittedItems ? STEP_CONFIGURE : STEP_ADD_USE_CASE);
				}
			}

			goToStep(targetStep);
		},
		[
			currentStep,
			restoreToCommittedState,
			committedConfigItems,
			committedData360Config,
			committedEmployeeTemplateIds,
			goToStep,
		],
	);

	/**
	 * Navigate from ConfigStep back to Add Use Case step via "Configure another use case" button
	 * This COMMITS the current pending items (saves a snapshot) and navigates to add more.
	 */
	const handleConfigureAnotherUseCase = useCallback(() => {
		// Commit current state so it's preserved if user navigates back
		commitPendingItems();
		goToStep(STEP_ADD_USE_CASE);
	}, [commitPendingItems, goToStep]);

	/**
	 * Navigate from Dashboard (STEP_ESTIMATION) to Select Product step to add a new product
	 * This clears working product since we're starting fresh
	 */
	const handleAddProductFromDashboard = useCallback(() => {
		setWorkingProduct(null);
		goToStep(STEP_SELECT_PRODUCT);
	}, [goToStep]);

	/**
	 * Navigate back to Dashboard (STEP_ESTIMATION) without saving pending changes.
	 * Clears all pending items since user is explicitly leaving without adding to estimate.
	 */
	const handleReturnToDashboard = useCallback(() => {
		clearAllPendingItems();
		setWorkingProduct(null);
		goToStep(STEP_ESTIMATION);
	}, [clearAllPendingItems, goToStep]);

	const startEstimation = async (industryId: string, companySizeId: string) => {
		const estimationObject = await sdk.estimations.createEstimation({ industryId, companySizeId });

		setEstimation({
			id: estimationObject.id,
			industryId: estimationObject.industryId,
			companySizeId: estimationObject.companySizeId,
		});
		goToNextStep();
	};

	const setSelectedProduct = async (productId: string) => {
		if (estimation == null) return;

		// Clear pending items when switching to a different product
		const isSwitchingProduct = workingProduct !== null && workingProduct !== productId;
		if (isSwitchingProduct) {
			clearAllPendingItems();
			// Reset max step since we cleared everything
			setMaxStepReachedAmongThree(STEP_ADD_USE_CASE);
		} else {
			// Same product - check if there are committed items to re-enable Configure step
			const hasCommittedItems =
				committedConfigItems.length > 0 || committedData360Config !== null || committedEmployeeTemplateIds.length > 0;
			if (hasCommittedItems) {
				setMaxStepReachedAmongThree(STEP_CONFIGURE);
			} else {
				setMaxStepReachedAmongThree(STEP_ADD_USE_CASE);
			}
		}

		// Set working product to track what's being configured
		setWorkingProduct(productId);

		const currentConfig = estimation.config || [];
		const lastProduct = currentConfig[currentConfig.length - 1];
		const isSelectingANewProduct = lastProduct?.product !== productId;
		if (isSelectingANewProduct) {
			setEstimation({
				...estimation,
				config: [
					...currentConfig,
					{
						product: productId,
						config: [], // TODO: THIS IS NOT CORRECT. Depending on the product, config can be an array or an object.
					},
				],
			});
		}

		if (productId === PRODUCT_AGENTFORCE) {
			const templatesData = await sdk.agentforce.getTemplates();
			setTemplates(templatesData);
			goToNextStep();
		}
		if (productId === PRODUCT_DATA360) {
			const inputs = await sdk.data360.getDataFoundationInputs();
			const useCasesData = await sdk.data360.getUseCases();
			setDataFoundationInputs(inputs);
			setUseCases(useCasesData);
			goToStep(STEP_DATA360_QUESTIONS);
		}
	};

	const handleDataFoundationSubmit = async (responses: Record<string, number | boolean>) => {
		// Save responses for future editing
		setDataFoundationResponses(responses);

		const inputValues: EstimationInputValue[] = Object.entries(responses).map(([inputKey, value]) => ({
			inputKey,
			value,
		}));

		try {
			const configItem: Data360.EstimationConfigItem =
				pendingData360Config || (await sdk.data360.getOrCreateEstimationConfigItem(estimation ?? undefined));
			configItem.inputDataFoundation = inputValues;
			const updatedConfig = await sdk.data360.updateEstimationConfigItemValues(configItem);
			setPendingData360Config(updatedConfig);
		} catch (err) {
			console.error("Failed to handle Data Foundation submit:", err);
		}

		// Clear edit state and navigate
		setStepBeforeEditFoundationInputs(null);
		goToStep(STEP_ADD_USE_CASE);
	};

	const onConfigureUseCase = async (useCase: Data360.UseCase) => {
		const useCaseId = useCase.id;

		trackContentClick({
			bladeName: "sf/pricing-calculator/templates",
			moduleName: useCase.title,
			linkText: getText("calc_add_use_case_button_configure"),
			linkType: "secondary cta",
			modulePosition: TEMPLATE_MODULE_POSITION[useCase.title] ?? "1",
			moduleType: "cta",
		});

		// Get the current Data360 config - either from pending or from estimation
		let currentConfig = pendingData360Config;

		// If no pending config, check if there's one in estimation (returning from dashboard)
		if (!currentConfig && estimation?.config) {
			const d360ProductConfig = estimation.config.find((pc) => pc.product === PRODUCT_DATA360);
			if (d360ProductConfig && d360ProductConfig.config && !Array.isArray(d360ProductConfig.config)) {
				currentConfig = d360ProductConfig.config as Data360.EstimationConfigItem;
				// Set it as pending so we can add more use cases
				setPendingData360Config(currentConfig);
			}
		}

		if (!currentConfig) {
			console.error("No pending Data360 config - complete Data Foundation step first");
			return;
		}

		// Skip if already configured use case
		if (currentConfig.useCases?.some((uc) => uc.useCase === useCaseId)) {
			goToStep(STEP_CONFIGURE);
			return;
		}

		const inputValues: EstimationInputValue[] = (useCase.inputs || []).map((input) => ({
			inputKey: input.key,
			value: (input.config as { default?: number } | undefined)?.default ?? 0,
		}));

		try {
			// Add use case with SDK
			const updatedConfig = await sdk.data360.updateEstimationConfigItemUseCaseValues(
				currentConfig,
				useCaseId,
				inputValues,
			);
			setPendingData360Config(updatedConfig);
		} catch (err) {
			console.error("Failed to add Data360 use case:", err);
		}

		goToStep(STEP_CONFIGURE);
		return;
	};

	const onConfigureTemplate = async (template: Agentforce.Template) => {
		const templateId = template.id;
		const isEmployeeTemplate = template.targetAudience === "EMPLOYEE";

		// Track analytics
		trackContentClick({
			bladeName: "sf/pricing-calculator/templates",
			moduleName: template.displayName,
			linkText: getText("calc_add_use_case_button_configure"),
			linkType: "secondary cta",
			modulePosition: TEMPLATE_MODULE_POSITION[template.displayName] ?? "1",
			moduleType: "cta",
		});

		// Handle employee templates differently
		if (isEmployeeTemplate) {
			// Check if already pending
			const isInPendingEmployee = pendingEmployeeTemplateIds.includes(templateId);
			if (isInPendingEmployee) {
				goToStep(STEP_CONFIGURE);
				return;
			}

			// Check if already in estimation (returning from dashboard to edit)
			const estimationEmployeeItem = estimation?.config
				?.filter((pc) => pc.product === PRODUCT_AGENTFORCE && Array.isArray(pc.config))
				.flatMap((pc) => pc.config as Agentforce.EstimationConfigItem[])
				.find((item) => {
					const t = item.template as { seats?: number };
					return item.template.templateId === templateId && (t?.seats ?? 0) > 0;
				});

			if (estimationEmployeeItem) {
				// Restore from estimation - fetch gating SKUs if needed
				try {
					if (!templateGatingSKUs[templateId]) {
						const skus = await sdk.agentforce.getGatingSkusByTemplate(templateId);
						setTemplateGatingSKUs((prev) => ({ ...prev, [templateId]: skus }));
					}

					// Restore the config item and values from estimation
					const t = estimationEmployeeItem.template as { seats?: number; gatingSkuId?: string };
					setPendingEmployeeConfigItems((prev) => ({ ...prev, [templateId]: estimationEmployeeItem }));
					setEmployeeTemplateConfigs((prev) => ({
						...prev,
						[templateId]: {
							skuId: t?.gatingSkuId ?? null,
							seats: t?.seats ?? 0,
						},
					}));
					setPendingEmployeeTemplateIds((prev) => [...prev, templateId]);
					goToStep(STEP_CONFIGURE);
				} catch (err) {
					console.error("Failed to restore employee template:", err);
				}
				return;
			}

			try {
				// Fetch and cache gating SKUs for this template
				if (!templateGatingSKUs[templateId]) {
					const skus = await sdk.agentforce.getGatingSkusByTemplate(templateId);
					setTemplateGatingSKUs((prev) => ({ ...prev, [templateId]: skus }));
				}

				// Create config item for employee template
				const configItem = await sdk.agentforce.createEstimationConfigItem(template, DEFAULT_CURRENCY);
				setPendingEmployeeConfigItems((prev) => ({ ...prev, [templateId]: configItem }));

				// Initialize config if not exists
				if (!employeeTemplateConfigs[templateId]) {
					setEmployeeTemplateConfigs((prev) => ({
						...prev,
						[templateId]: { skuId: null, seats: 0 },
					}));
				}

				// Add to pending employee templates
				setPendingEmployeeTemplateIds((prev) => [...prev, templateId]);
				goToStep(STEP_CONFIGURE);
			} catch (err) {
				console.error("Failed to fetch gating SKUs:", err);
			}
			return;
		}

		// Skip if already in pending or estimation (regular templates)
		const isInPending = pendingConfigItems.some((p) => p.template.templateId === templateId);
		const isInEstimation = estimation?.config?.some((pc) => {
			if (pc.product !== PRODUCT_AGENTFORCE || !Array.isArray(pc.config)) return false;
			return (pc.config as Agentforce.EstimationConfigItem[]).some((c) => c.template.templateId === templateId);
		});

		if (isInPending || isInEstimation) {
			// Existing template - clear the newly configured flag (edit mode)
			setNewlyConfiguredTemplateId(null);
			goToStep(STEP_CONFIGURE);
			return;
		}

		try {
			const configItem = await sdk.agentforce.createEstimationConfigItem(template, DEFAULT_CURRENCY);

			// Fetch and cache topics for UI display
			const topics = await sdk.agentforce.getTopicsByTemplate(templateId);
			setTemplateTopics((prev) => ({ ...prev, [templateId]: topics }));

			// Add to pendingConfigItems
			setPendingConfigItems((prev) => [...prev, configItem]);

			// Mark as newly configured (for auto-enabling first topic)
			setNewlyConfiguredTemplateId(templateId);

			// Navigate to Configure step
			goToStep(STEP_CONFIGURE);
		} catch (err) {
			console.error("Failed to configure template:", err);
		}
	};

	// Update last known credits/pricing for topics (called from TemplateConfig when values change)
	const handleUpdateLastTopicValues = useCallback(
		(credits: Record<string, number>, pricing: Record<string, number>) => {
			if (Object.keys(credits).length > 0) {
				setLastCreditsByTopicId((prev) => ({ ...prev, ...credits }));
			}
			if (Object.keys(pricing).length > 0) {
				setLastPricingByTopicId((prev) => ({ ...prev, ...pricing }));
			}
		},
		[]
	);

	const handleEmployeeTemplateConfigChange = async (templateId: string, values: EmployeeConfigValues) => {
		// Update local state immediately for UI responsiveness
		setEmployeeTemplateConfigs((prev) => ({
			...prev,
			[templateId]: values,
		}));

		// Get the current config item for this employee template
		const currentConfigItem = pendingEmployeeConfigItems[templateId];
		if (!currentConfigItem) return;

		// Only call SDK if we have a SKU selected
		if (!values.skuId) return;

		try {
			const updatedConfigItem = await sdk.agentforce.updateEstimationConfigItemGatingSkuId(
				currentConfigItem,
				values.skuId,
				values.seats,
			);
			setPendingEmployeeConfigItems((prev) => ({
				...prev,
				[templateId]: updatedConfigItem,
			}));
		} catch (err) {
			console.error("Failed to update employee template config:", err);
		}
	};

	const handleTopicInputChange = async (templateId: string, topicId: string, values: Record<string, number>) => {
		const inputValues: EstimationInputValue[] = Object.entries(values).map(([inputKey, value]) => ({
			inputKey,
			value,
		}));

		// Check if template is in pending items
		const pendingConfig = pendingConfigItems.find((item) => item.template.templateId === templateId);
		if (pendingConfig) {
			const currentTopic = pendingConfig.template.topics?.find((t) => t.topicId === topicId);
			const selected = currentTopic?.selected ?? true;

			try {
				const updatedConfig = await sdk.agentforce.updateEstimationConfigItemTopicValues(
					pendingConfig,
					topicId,
					selected,
					inputValues,
				);
				setPendingConfigItems((prev) =>
					prev.map((item) => (item.template.templateId === templateId ? updatedConfig : item)),
				);
			} catch (err) {
				console.error("Failed to update topic inputs:", err);
				// SDK failed (e.g., values too large) - still update local state with input values
				// This allows the user to adjust values even when SDK can't calculate
				setPendingConfigItems((prev) =>
					prev.map((item) => {
						if (item.template.templateId !== templateId) return item;
						const updatedTopics = item.template.topics?.map((t) =>
							t.topicId === topicId ? { ...t, inputs: inputValues } : t
						);
						return {
							...item,
							template: { ...item.template, topics: updatedTopics },
						};
					}),
				);
			}
			return;
		}

		// Check if template is in estimation (already added)
		if (!estimation?.config) return;
		const afIndex = estimation.config.findIndex((pc) => pc.product === PRODUCT_AGENTFORCE && Array.isArray(pc.config));
		if (afIndex < 0) return;
		const productConfig = estimation.config[afIndex];
		const items = (productConfig.config as Agentforce.EstimationConfigItem[]) || [];
		const itemIndex = items.findIndex((item) => item.template.templateId === templateId);
		if (itemIndex < 0) return;

		const currentItem = items[itemIndex];
		const currentTopic = currentItem.template.topics?.find((t) => t.topicId === topicId);
		const selected = currentTopic?.selected ?? true;

		try {
			const updatedItem = await sdk.agentforce.updateEstimationConfigItemTopicValues(
				currentItem,
				topicId,
				selected,
				inputValues,
			);
			const newItems = items.map((item, i) => (i === itemIndex ? updatedItem : item));
			const newConfig = [...estimation.config];
			newConfig[afIndex] = { ...productConfig, config: newItems };
			const updatedEstimation: Estimation = { ...estimation, config: newConfig };
			const result = await sdk.estimations.updateEstimation(updatedEstimation);
			setEstimation(result);
		} catch (err) {
			console.error("Failed to update topic inputs in estimation:", err);
		}
	};

	const handleTopicToggle = async (templateId: string, topicId: string, enabled: boolean) => {
		// Check if template is in pending items
		const pendingConfig = pendingConfigItems.find((item) => item.template.templateId === templateId);
		if (pendingConfig) {
			const currentTopic = pendingConfig.template.topics?.find((t) => t.topicId === topicId);
			const inputValues = currentTopic?.inputs || [];

			try {
				const updatedConfig = await sdk.agentforce.updateEstimationConfigItemTopicValues(
					pendingConfig,
					topicId,
					enabled,
					inputValues,
				);
				setPendingConfigItems((prev) =>
					prev.map((item) => (item.template.templateId === templateId ? updatedConfig : item)),
				);
			} catch (err) {
				console.error("Failed to toggle topic:", err);
				// SDK failed (e.g., values too large) - still update local state so user can toggle
				// This allows disabling topics even when SDK can't calculate credits
				setPendingConfigItems((prev) =>
					prev.map((item) => {
						if (item.template.templateId !== templateId) return item;
						const updatedTopics = item.template.topics?.map((t) =>
							t.topicId === topicId ? { ...t, selected: enabled } : t
						);
						return {
							...item,
							template: { ...item.template, topics: updatedTopics },
						};
					}),
				);
			}
			return;
		}

		// Check if template is in estimation (already added)
		if (!estimation?.config) return;
		const afIndex = estimation.config.findIndex((pc) => pc.product === PRODUCT_AGENTFORCE && Array.isArray(pc.config));
		if (afIndex < 0) return;
		const productConfig = estimation.config[afIndex];
		const items = (productConfig.config as Agentforce.EstimationConfigItem[]) || [];
		const itemIndex = items.findIndex((item) => item.template.templateId === templateId);
		if (itemIndex < 0) return;

		const currentItem = items[itemIndex];
		const currentTopic = currentItem.template.topics?.find((t) => t.topicId === topicId);
		const inputValues = currentTopic?.inputs ?? [];

		try {
			const updatedItem = await sdk.agentforce.updateEstimationConfigItemTopicValues(
				currentItem,
				topicId,
				enabled,
				inputValues,
			);
			const newItems = items.map((item, i) => (i === itemIndex ? updatedItem : item));
			const newConfig = [...estimation.config];
			newConfig[afIndex] = { ...productConfig, config: newItems };
			const updatedEstimation: Estimation = { ...estimation, config: newConfig };
			const result = await sdk.estimations.updateEstimation(updatedEstimation);
			setEstimation(result);
		} catch (err) {
			console.error("Failed to toggle topic in estimation:", err);
		}
	};

	/**
	 * Schedule a debounced apply for estimation step. When accordion topic inputs/toggle change,
	 * we wait ESTIMATION_INPUT_DEBOUNCE_MS after the last change then call the SDK and updateEstimation.
	 */
	const scheduleEstimationUpdate = useCallback((apply: () => Promise<void>) => {
		estimationPendingApplyRef.current = apply;
		if (estimationDebounceTimerRef.current) {
			clearTimeout(estimationDebounceTimerRef.current);
		}
		estimationDebounceTimerRef.current = setTimeout(() => {
			estimationDebounceTimerRef.current = null;
			const fn = estimationPendingApplyRef.current;
			estimationPendingApplyRef.current = null;
			fn?.();
		}, ESTIMATION_INPUT_DEBOUNCE_MS);
	}, []);

	/** Topic input change in estimation step: debounced, updates config item and calls updateEstimation. */
	const handleTopicInputChangeInEstimation = useCallback(
		(templateId: string, topicId: string, values: Record<string, number>) => {
			const inputValues: EstimationInputValue[] = Object.entries(values).map(([inputKey, value]) => ({
				inputKey,
				value,
			}));
			scheduleEstimationUpdate(async () => {
				const est = estimationRef.current;
				if (!est?.config) return;
				const afIndex = est.config.findIndex((pc) => pc.product === PRODUCT_AGENTFORCE && Array.isArray(pc.config));
				if (afIndex < 0) return;
				const productConfig = est.config[afIndex];
				const items = (productConfig.config as Agentforce.EstimationConfigItem[]) || [];
				const itemIndex = items.findIndex((item) => item.template.templateId === templateId);
				if (itemIndex < 0) return;
				const currentItem = items[itemIndex];
				const currentTopic = currentItem.template.topics?.find((t) => t.topicId === topicId);
				const selected = currentTopic?.selected ?? true;
				try {
					const updatedItem = await sdk.agentforce.updateEstimationConfigItemTopicValues(
						currentItem,
						topicId,
						selected,
						inputValues,
					);
					const newItems = items.map((item, i) => (i === itemIndex ? updatedItem : item));
					const newConfig = [...est.config];
					newConfig[afIndex] = { ...productConfig, config: newItems };
					const updatedEstimation: Estimation = { ...est, config: newConfig };
					const result = await sdk.estimations.updateEstimation(updatedEstimation);
					setEstimation(result);
				} catch (err) {
					console.error("Failed to update topic inputs in estimation:", err);
				}
			});
		},
		[scheduleEstimationUpdate],
	);

	/** Topic toggle in estimation step: debounced, updates config item and calls updateEstimation. */
	const handleTopicToggleInEstimation = useCallback(
		(templateId: string, topicId: string, enabled: boolean) => {
			scheduleEstimationUpdate(async () => {
				const est = estimationRef.current;
				if (!est?.config) return;
				const afIndex = est.config.findIndex((pc) => pc.product === PRODUCT_AGENTFORCE && Array.isArray(pc.config));
				if (afIndex < 0) return;
				const productConfig = est.config[afIndex];
				const items = (productConfig.config as Agentforce.EstimationConfigItem[]) || [];
				const itemIndex = items.findIndex((item) => item.template.templateId === templateId);
				if (itemIndex < 0) return;
				const currentItem = items[itemIndex];
				const currentTopic = currentItem.template.topics?.find((t) => t.topicId === topicId);
				const inputValues = currentTopic?.inputs ?? [];
				try {
					const updatedItem = await sdk.agentforce.updateEstimationConfigItemTopicValues(
						currentItem,
						topicId,
						enabled,
						inputValues,
					);
					const newItems = items.map((item, i) => (i === itemIndex ? updatedItem : item));
					const newConfig = [...est.config];
					newConfig[afIndex] = { ...productConfig, config: newItems };
					const updatedEstimation: Estimation = { ...est, config: newConfig };
					const result = await sdk.estimations.updateEstimation(updatedEstimation);
					setEstimation(result);
				} catch (err) {
					console.error("Failed to toggle topic in estimation:", err);
				}
			});
		},
		[scheduleEstimationUpdate],
	);

	const handleEmployeeTemplateConfigChangeInEstimation = async (
		templateId: string,
		values: { seats: number; skuId: string | null },
	) => {
		if (!estimation?.config) return;
		const afIndex = estimation.config.findIndex((pc) => pc.product === PRODUCT_AGENTFORCE && Array.isArray(pc.config));
		if (afIndex < 0) return;
		const productConfig = estimation.config[afIndex];
		const items = (productConfig.config as Agentforce.EstimationConfigItem[]) || [];
		const itemIndex = items.findIndex((item) => item.template.templateId === templateId);
		if (itemIndex < 0) return;
		const currentItem = items[itemIndex];
		const templateFromItem = currentItem.template as { gatingSkuId?: string };
		const effectiveSkuId = values.skuId ?? templateFromItem.gatingSkuId ?? null;
		if (!effectiveSkuId) return;
		try {
			const updatedItem = await sdk.agentforce.updateEstimationConfigItemGatingSkuId(
				currentItem,
				effectiveSkuId,
				values.seats,
			);
			const newItems = items.map((item, i) => (i === itemIndex ? updatedItem : item));
			const newConfig = [...estimation.config];
			newConfig[afIndex] = { ...productConfig, config: newItems };
			const updatedEstimation: Estimation = { ...estimation, config: newConfig };
			const result = await sdk.estimations.updateEstimation(updatedEstimation);
			setEstimation(result);
		} catch (err) {
			console.error("Failed to update employee template config in estimation:", err);
		}
	};

	/** Data360 use case input change in estimation step: debounced, updates config and calls updateEstimation. */
	const handleData360UseCaseInputChangeInEstimation = useCallback(
		(useCaseId: string, values: Record<string, number>) => {
			const inputValues: EstimationInputValue[] = Object.entries(values).map(([inputKey, value]) => ({
				inputKey,
				value,
			}));
			scheduleEstimationUpdate(async () => {
				const est = estimationRef.current;
				if (!est?.config) return;
				const d360Index = est.config.findIndex(
					(pc) => pc.product === PRODUCT_DATA360 && pc.config && !Array.isArray(pc.config)
				);
				if (d360Index < 0) return;
				const data360Config = est.config[d360Index].config as Data360.EstimationConfigItem;
				try {
					const updatedConfig = await sdk.data360.updateEstimationConfigItemUseCaseValues(
						data360Config,
						useCaseId,
						inputValues,
					);
					const newConfig = [...est.config];
					newConfig[d360Index] = { ...est.config[d360Index], config: updatedConfig };
					const updatedEstimation: Estimation = { ...est, config: newConfig };
					const result = await sdk.estimations.updateEstimation(updatedEstimation);
					setEstimation(result);
				} catch (err) {
					console.error("Failed to update Data360 use case inputs in estimation:", err);
				}
			});
		},
		[scheduleEstimationUpdate],
	);

	const handleUseCaseInputChange = async (useCaseId: string, values: Record<string, number>) => {
		const inputValues: EstimationInputValue[] = Object.entries(values).map(([inputKey, value]) => ({
			inputKey,
			value,
		}));

		// Check if there's a pending Data360 config
		if (pendingData360Config) {
			// Remove the use case first (SDK will add it back with updated values)
			const configWithoutUseCase: Data360.EstimationConfigItem = {
				...pendingData360Config,
				useCases: pendingData360Config.useCases?.filter((uc) => uc.useCase !== useCaseId) ?? [],
			};

			try {
				const updatedConfig = await sdk.data360.updateEstimationConfigItemUseCaseValues(
					configWithoutUseCase,
					useCaseId,
					inputValues,
				);

				setPendingData360Config(updatedConfig);
			} catch (err) {
				console.error("Failed to update use case inputs:", err);
			}
			return;
		}

		// Check if use case is in estimation (already added)
		if (!estimation?.config) return;
		const d360Index = estimation.config.findIndex(
			(pc) => pc.product === PRODUCT_DATA360 && pc.config && !Array.isArray(pc.config)
		);
		if (d360Index < 0) return;
		const data360Config = estimation.config[d360Index].config as Data360.EstimationConfigItem;

		try {
			const updatedConfig = await sdk.data360.updateEstimationConfigItemUseCaseValues(
				data360Config,
				useCaseId,
				inputValues,
			);
			const newConfig = [...estimation.config];
			newConfig[d360Index] = { ...estimation.config[d360Index], config: updatedConfig };
			const updatedEstimation: Estimation = { ...estimation, config: newConfig };
			const result = await sdk.estimations.updateEstimation(updatedEstimation);
			setEstimation(result);
		} catch (err) {
			console.error("Failed to update Data360 use case inputs in estimation:", err);
		}
	};

	const handleEditDataFoundation = () => {
		setStepBeforeEditFoundationInputs(currentStep);
		goToStep(STEP_DATA360_QUESTIONS);
	};

	const handleCloseDataFoundation = () => {
		if (stepBeforeEditFoundationInputs === null) {
			goToStep(STEP_SELECT_PRODUCT);
			return;
		}

		goToStep(stepBeforeEditFoundationInputs);
		setStepBeforeEditFoundationInputs(null);
	};

	const handleAddToEstimate = async () => {
		trackContentClick({
			bladeName: "sf/pricing-calculator/config",
			moduleName: "Configuration Navigation",
			linkText: "Add to estimate",
			linkType: "primary cta",
			modulePosition: "4",
			moduleType: "cta",
		});

		if (!estimation?.config?.length) {
			goToNextStep();
			return;
		}

		const currentConfig = [...estimation.config];
		const lastProductIndex = currentConfig.length - 1;
		const lastProduct = currentConfig[lastProductIndex];
		const isData360 = lastProduct.product === PRODUCT_DATA360;

		// Check for pending items
		const hasPendingData360 = pendingData360Config && pendingData360Config.useCases?.length;
		const hasRegularTemplates = pendingConfigItems.length > 0;
		const hasEmployeeTemplates = pendingEmployeeTemplateIds.length > 0;
		const hasPendingItems = isData360 ? hasPendingData360 : (hasRegularTemplates || hasEmployeeTemplates);

		// Check for existing items in estimation (editing mode - came back from dashboard)
		const hasExistingAgentforceItems = !isData360 && Array.isArray(lastProduct.config) && lastProduct.config.length > 0;
		const hasExistingData360Items = isData360 && lastProduct.config && !Array.isArray(lastProduct.config) &&
			(lastProduct.config as Data360.EstimationConfigItem).useCases?.length > 0;
		const hasExistingItems = hasExistingAgentforceItems || hasExistingData360Items;

		// If no pending items and no existing items, do nothing
		if (!hasPendingItems && !hasExistingItems) {
			return;
		}

		// If no pending items but has existing items (editing mode), just navigate to dashboard
		// Changes were already saved via input change handlers
		if (!hasPendingItems && hasExistingItems) {
			clearAllPendingItems();
			setWorkingProduct(null);
			goToStep(STEP_ESTIMATION);
			return;
		}

		try {
			// Build updated config based on product type
			// Deep copy to prevent SDK mutations from affecting our state if it throws
			let updatedEstimation: Estimation = {
				...estimation,
				config: estimation.config?.map(pc => ({
					...pc,
					config: Array.isArray(pc.config)
						? pc.config.map(item => ({ ...item, template: { ...item.template } }))
						: pc.config ? { ...pc.config } : pc.config
				}))
			};
			if (isData360) {
				updatedEstimation = await sdk.data360.addItemToEstimation(updatedEstimation, pendingData360Config!);
			} else {
				const existingItems = Array.isArray(lastProduct.config) ? [...lastProduct.config] : [];
				currentConfig[lastProductIndex] = {
					...lastProduct,
					config: [...existingItems, ...pendingConfigItems],
				};
				// Add regular templates
				for (const item of pendingConfigItems) {
					updatedEstimation = await sdk.agentforce.addItemToEstimation(updatedEstimation, item);
				}

				// Add employee templates (skip if already in estimation to prevent duplicates)
				const existingEmployeeTemplateIds = new Set(
					existingItems
						.filter((item) => {
							const t = item.template as { seats?: number };
							return (t?.seats ?? 0) > 0;
						})
						.map((item) => item.template.templateId)
				);

				for (const templateId of pendingEmployeeTemplateIds) {
					// Skip if already in estimation (was restored from estimation for editing)
					if (existingEmployeeTemplateIds.has(templateId)) continue;

					const configItem = pendingEmployeeConfigItems[templateId];
					if (!configItem) continue;

					updatedEstimation = await sdk.agentforce.addItemToEstimation(updatedEstimation, configItem);
				}
			}
			const result = await sdk.estimations.updateEstimation(updatedEstimation);
			setEstimation(result);

			// Clear pending items, committed state, and working product
			if (isData360) {
				setPendingData360Config(null);
				setCommittedData360Config(null);
			} else {
				setPendingConfigItems([]);
				setPendingEmployeeTemplateIds([]);
				setPendingEmployeeConfigItems({});
				setCommittedConfigItems([]);
				setCommittedEmployeeTemplateIds([]);
				setCommittedEmployeeConfigItems({});
				setCommittedEmployeeTemplateConfigs({});
			}
			setWorkingProduct(null);

			goToNextStep();
		} catch (err) {
			console.error("Failed to update estimation:", err);
		}
	};

	const handleDeleteTemplate = async (templateId: string) => {
		if (!estimation?.config) return;

		try {
			const updatedConfig = estimation.config.map((productConfig) => {
				if (productConfig.product !== PRODUCT_AGENTFORCE || !Array.isArray(productConfig.config)) return productConfig;
				const filtered = (productConfig.config as Agentforce.EstimationConfigItem[]).filter(
					(item) => item.template.templateId !== templateId,
				);

				return { ...productConfig, config: filtered };
			});
			const cleanedEstimation: Estimation = {
				...estimation,
				config: updatedConfig,
				totalCredits: undefined,
				totalPrice: undefined,
			};
			const result = await sdk.estimations.updateEstimation(cleanedEstimation);
			setEstimation(result);
			setHiddenTemplateIds((prev) => {
				const next = new Set(prev);
				next.delete(templateId);
				return next;
			});
		} catch (err) {
			console.error("Failed to delete template from estimation:", err);
		}
	};

	/**
	 * Remove a template/use case from pending items or from estimation (when returned from STEP_ESTIMATION)
	 */
	const handleRemoveTemplate = (item: Agentforce.Template | Data360.UseCase, isAgentforce: boolean) => {
		if (isAgentforce) {
			// Check if it's an employee template
			const template = item as Agentforce.Template;
			const isEmployeeTemplate = template.targetAudience === "EMPLOYEE";

			if (isEmployeeTemplate) {
				// Remove from pending employee templates
				setPendingEmployeeTemplateIds((prev) => prev.filter((id) => id !== item.id));
				setPendingEmployeeConfigItems((prev) => {
					const { [item.id]: _, ...rest } = prev;
					return rest;
				});
				return;
			}

			const inPending = pendingConfigItems.some((p) => p.template.templateId === item.id);
			if (inPending) {
				setPendingConfigItems((prev) => prev.filter((p) => p.template.templateId !== item.id));
			} else {
				handleDeleteTemplate(item.id);
			}
		} else {
			const inPending = pendingData360Config?.useCases?.some((uc) => uc.useCase === item.id);
			if (inPending && pendingData360Config) {
				setPendingData360Config((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						useCases: prev.useCases?.filter((uc) => uc.useCase !== item.id) ?? [],
					};
				});
			} else if (estimation?.config) {
				// In estimation - remove use case from Data360 config
				const lastProduct = estimation.config[estimation.config.length - 1];
				if (lastProduct?.product === PRODUCT_DATA360) {
					const cfg = lastProduct.config as Data360.EstimationConfigItem | undefined;
					const filteredUseCases = cfg?.useCases?.filter((uc) => uc.useCase !== item.id) ?? [];
					const updatedConfig = estimation.config.map((productConfig) => {
						if (productConfig.product !== PRODUCT_DATA360) return productConfig;
						return { ...productConfig, config: { ...cfg!, useCases: filteredUseCases } };
					});
					sdk.estimations
						.updateEstimation({
							...estimation,
							config: updatedConfig,
							totalCredits: undefined,
							totalPrice: undefined,
						})
						.then(setEstimation);
				}
			}
		}
	};

	const resetCalculator = useCallback(() => {
		setEstimation(null);
		setPendingConfigItems([]);
		setPendingData360Config(null);
		setDataFoundationResponses({});
		setStepBeforeEditFoundationInputs(null);
		setTemplateTopics({});
		setTemplateGatingSKUs({});
		setHiddenTemplateIds(new Set());
		setEmployeeTemplateConfigs({});
		setPendingEmployeeTemplateIds([]);
		setPendingEmployeeConfigItems({});
		setWorkingProduct(null);
		// Clear committed state
		setCommittedConfigItems([]);
		setCommittedData360Config(null);
		setCommittedEmployeeTemplateIds([]);
		setCommittedEmployeeConfigItems({});
		setCommittedEmployeeTemplateConfigs({});
		// Clear last known topic values
		setLastCreditsByTopicId({});
		setLastPricingByTopicId({});
		// Clear newly configured template flag
		setNewlyConfiguredTemplateId(null);
		setCurrentStep(STEP_INDUSTRY_SIZE);
		setMaxStepReachedAmongThree(STEP_SELECT_PRODUCT);
		setHasReachedEstimation(false);
	}, []);

	const handleHideTemplate = useCallback((templateId: string) => {
		setHiddenTemplateIds((prev) => {
			const next = new Set(prev);
			if (next.has(templateId)) next.delete(templateId);
			else next.add(templateId);
			return next;
		});
	}, []);

	const handleShareEstimation = useCallback(() => {
		if (estimation) {
			sdk.estimations.shareEstimation(estimation);
		}
	}, [estimation]);

	const handleSaveEstimationContinue = useCallback(() => {
		setSaveEstimationModalOpen(false);
		goToStep(STEP_SAVE_ESTIMATION_FORM);
	}, [goToStep]);

	const handleSaveEstimationFormSubmit = useCallback(async (_data: import('./common/LeadCaptureForm').LeadCaptureFormData) => {
		if (!estimation) return;
		let publicUrl = "https://example.com/estimation/placeholder-id";
		if (estimation.id != null) {
			const url = new URL(window.location.href);
			url.searchParams.set("id", estimation.id);
			publicUrl = url.toString();
		}
		try {
			await sdk.estimations.shareEstimation(estimation);
		} catch {
			// shareEstimation puede fallar (ej. SDK con respuesta vacía); usamos la URL construida igual
		}
		setSavedPublicLink(publicUrl);
		setSavedLastUpdated(
			new Date().toLocaleString("en-US", {
				dateStyle: "long",
				timeStyle: "medium",
				timeZone: "UTC",
			}),
		);
		goToStep(STEP_ESTIMATION);
		setCopyLinkModalOpen(true);
	}, [estimation, goToStep]);

	// Get selected template/use case IDs from both pending items AND items already in estimation
	// (needed when returning from STEP_ESTIMATION via "Add Agentforce Template")
	const estimationTemplateIds = (() => {
		if (!estimation?.config?.length) return [];
		const lastProduct = estimation.config[estimation.config.length - 1];
		if (lastProduct?.product !== PRODUCT_AGENTFORCE || !Array.isArray(lastProduct.config)) return [];
		return (lastProduct.config as Agentforce.EstimationConfigItem[]).map((item) => item.template.templateId);
	})();

	const selectedTemplateIds = [
		...new Set([
			...estimationTemplateIds,
			...pendingConfigItems.map((item) => item.template.templateId),
			...pendingEmployeeTemplateIds,
		]),
	];

	const estimationUseCaseIds = (() => {
		if (!estimation?.config?.length) return [];
		const lastProduct = estimation.config[estimation.config.length - 1];
		if (lastProduct?.product !== "data360") return [];
		const cfg = lastProduct.config as Data360.EstimationConfigItem | undefined;
		return cfg?.useCases?.map((uc) => uc.useCase) ?? [];
	})();

	const selectedUseCaseIds = [
		...new Set([...(pendingData360Config?.useCases?.map((uc) => uc.useCase) ?? []), ...estimationUseCaseIds]),
	];

	// Render the current step content
	const renderStepContent = () => {
		if (loading)
			return (
				<div className="flex flex-col items-center justify-center px-4 py-24">
					<p className="text-lg text-[#023248]">Loading...</p>
				</div>
			);
		if (error)
			return (
				<div className="flex flex-col items-center justify-center gap-4 px-4 py-24">
					<p className="text-center text-red-600">{error}</p>
					<button
						type="button"
						onClick={fetchInitialData}
						className="rounded-lg bg-[#0176D3] px-4 py-2 text-white hover:bg-[#014A8F]"
					>
						Retry
					</button>
				</div>
			);

		switch (currentStep) {
			case STEP_INDUSTRY_SIZE:
				return (
					<PricingCalculator
						industries={industries}
						companySizes={companySizes}
						onSubmit={startEstimation}
						isMobile={isMobile}
					/>
				);

			case STEP_SELECT_PRODUCT:
				return <SelectProductStep onNext={setSelectedProduct} initialSelectedProduct={workingProduct} isMobile={isMobile} />;

			case STEP_DATA360_QUESTIONS:
				return (
					<DataFoundationStep
						inputs={dataFoundationInputs}
						onNext={handleDataFoundationSubmit}
						onClose={handleCloseDataFoundation}
						isMobile={isMobile}
						initialResponses={Object.keys(dataFoundationResponses).length > 0 ? dataFoundationResponses : undefined}
					/>
				);

			case STEP_ADD_USE_CASE: {
				if (!estimation || !estimation.config) return null;

				const lastSelectedProduct = estimation.config[estimation.config.length - 1];
				const isAgentforce = lastSelectedProduct.product === PRODUCT_AGENTFORCE;

				return (
					<div className="step-content step-add-use-case mx-auto max-w-6xl px-4 md:px-8">
						<UseCaseSelectorStep
							mode={isAgentforce ? "agent-templates" : "use-cases"}
							onConfigure={(item) =>
								isAgentforce
									? onConfigureTemplate(item as Agentforce.Template)
									: onConfigureUseCase(item as Data360.UseCase)
							}
							items={isAgentforce ? templates : useCases}
							industries={industries}
							lineOfBusinesses={lineOfBusinesses}
							selectedTemplateIds={isAgentforce ? selectedTemplateIds : selectedUseCaseIds}
							onRemoveTemplate={(item) => handleRemoveTemplate(item, isAgentforce)}
							onEditTemplate={async (item) => {
								// Clear newly configured flag when editing (not a new template)
								setNewlyConfiguredTemplateId(null);

								// For Data360: restore pending config from estimation if needed
								if (!isAgentforce && !pendingData360Config && estimation?.config) {
									const d360ProductConfig = estimation.config.find((pc) => pc.product === PRODUCT_DATA360);
									if (d360ProductConfig && d360ProductConfig.config && !Array.isArray(d360ProductConfig.config)) {
										setPendingData360Config(d360ProductConfig.config as Data360.EstimationConfigItem);
									}
								}

								// For Agentforce employee templates: restore from estimation if needed
								if (isAgentforce) {
									const template = item as Agentforce.Template;
									const isEmployeeTemplate = template.targetAudience === "EMPLOYEE";
									const templateId = template.id;

									if (isEmployeeTemplate && !pendingEmployeeTemplateIds.includes(templateId)) {
										// Check if in estimation and restore
										const estimationEmployeeItem = estimation?.config
											?.filter((pc) => pc.product === PRODUCT_AGENTFORCE && Array.isArray(pc.config))
											.flatMap((pc) => pc.config as Agentforce.EstimationConfigItem[])
											.find((configItem) => {
												const t = configItem.template as { seats?: number };
												return configItem.template.templateId === templateId && (t?.seats ?? 0) > 0;
											});

										if (estimationEmployeeItem) {
											try {
												// Fetch gating SKUs if needed
												if (!templateGatingSKUs[templateId]) {
													const skus = await sdk.agentforce.getGatingSkusByTemplate(templateId);
													setTemplateGatingSKUs((prev) => ({ ...prev, [templateId]: skus }));
												}

												// Restore the config
												const t = estimationEmployeeItem.template as { seats?: number; gatingSkuId?: string };
												setPendingEmployeeConfigItems((prev) => ({ ...prev, [templateId]: estimationEmployeeItem }));
												setEmployeeTemplateConfigs((prev) => ({
													...prev,
													[templateId]: {
														skuId: t?.gatingSkuId ?? null,
														seats: t?.seats ?? 0,
													},
												}));
												setPendingEmployeeTemplateIds((prev) => [...prev, templateId]);
											} catch (err) {
												console.error("Failed to restore employee template:", err);
											}
										}
									}
								}

								goToStep(STEP_CONFIGURE);
							}}
							onReturnToDashboard={hasReachedEstimation ? handleReturnToDashboard : undefined}
							isMobile={isMobile}
							onEditDataFoundation={!isAgentforce ? handleEditDataFoundation : undefined}
						/>
					</div>
				);
			}

			case STEP_CONFIGURE: {
				if (!estimation || !estimation.config) return null;

				const lastProduct = estimation.config[estimation.config.length - 1];
				const isAgentforce = lastProduct.product === PRODUCT_AGENTFORCE;

				// Get items already in estimation (if any)
				const estimationConfigItems =
					isAgentforce && Array.isArray(lastProduct.config)
						? (lastProduct.config as Agentforce.EstimationConfigItem[])
						: [];

				return (
					<ConfigStep
						product={isAgentforce ? PRODUCT_AGENTFORCE : PRODUCT_DATA360}
						isMobile={isMobile}
						pendingConfigItems={pendingConfigItems}
						estimationConfigItems={estimationConfigItems}
						templates={templates}
						templateTopics={templateTopics}
						useCases={useCases}
						pendingData360Config={pendingData360Config}
						onTopicInputChange={handleTopicInputChange}
						onTopicToggle={handleTopicToggle}
						onUseCaseInputChange={handleUseCaseInputChange}
						onAddTemplate={handleConfigureAnotherUseCase}
						onAddToEstimate={handleAddToEstimate}
						onReturnToDashboard={hasReachedEstimation ? handleReturnToDashboard : undefined}
						onEditDataFoundation={() => goToStep(STEP_DATA360_QUESTIONS)}
						onTrackNumericInputChange={({ topicDisplayName, inputPosition, value }) => {
							trackContentClick({
								bladeName: "sf/pricing-calculator/config",
								moduleName: topicDisplayName,
								moduleType: "input field",
								modulePosition: String(inputPosition),
								linkText: value.toLocaleString(),
								linkType: "text",
							});
						}}
						pendingEmployeeTemplateIds={pendingEmployeeTemplateIds}
						employeeTemplateConfigs={employeeTemplateConfigs}
						onEmployeeTemplateConfigChange={handleEmployeeTemplateConfigChange}
						templateGatingSKUs={templateGatingSKUs}
						pendingEmployeeConfigItems={pendingEmployeeConfigItems}
						lastCreditsByTopicId={lastCreditsByTopicId}
						lastPricingByTopicId={lastPricingByTopicId}
						onUpdateLastTopicValues={handleUpdateLastTopicValues}
						newlyConfiguredTemplateId={newlyConfiguredTemplateId}
					/>
				);
			}

			case STEP_ESTIMATION:
				return (
					<FinalEstimationStep
						onReset={resetCalculator}
						estimation={estimation}
						templates={templates}
						templateTopics={templateTopics}
						useCases={useCases}
						reportData={reportData}
						onDownloadReport={() => {
							trackContentClick({
								bladeName: "sf/pricing-calculator/dashboard",
								moduleName: "Pricing estimation summary",
								linkText: "Download full report",
								linkType: "primary cta",
								modulePosition: "1",
								moduleType: "cta",
							});
							goToStep(STEP_DOWNLOAD_FORM);
						}}
						onContactSpecialist={() => {
							trackContentClick({
								bladeName: "sf/pricing-calculator/dashboard",
								moduleName: "Pricing estimation summary",
								linkText: "Contact specialist",
								linkType: "secondary cta",
								modulePosition: "2",
								moduleType: "cta",
							});
							handleShareEstimation();
						}}
						onAddTemplate={() => goToStep(STEP_ADD_USE_CASE)}
						onAddToDashboard={() => {
							trackContentClick({
								bladeName: "sf/pricing-calculator/dashboard",
								bladePosition: "2",
								moduleName: "Pricing estimation per product",
								linkText: "Add Product +",
								linkType: "secondary cta",
								modulePosition: "1",
								moduleType: "cta",
							});
							handleAddProductFromDashboard();
						}}
						onTrackAddAgentforceTemplate={() => {
							trackContentClick({
								bladeName: "sf/pricing-calculator/dashboard",
								bladePosition: "3",
								moduleName: "Agentforce Pricing Summary",
								linkText: "Add Agentforce Template +",
								linkType: "secondary cta",
								modulePosition: "1",
								moduleType: "cta",
							});
						}}
						onTrackViewDetailsAgentforce={() => {
							trackContentClick({
								bladeName: "sf/pricing-calculator/dashboard",
								moduleName: "Agentforce Overview",
								linkText: "View details",
								linkType: "text link",
								modulePosition: "3",
								moduleType: "ux control",
							});
						}}
						onSaveEstimation={() => {
							trackContentClick({
								bladeName: "sf/pricing-calculator/dashboard",
								moduleName: "Pricing estimation summary",
								linkText: "Save estimation",
								linkType: "primary cta",
								modulePosition: "0",
								moduleType: "cta",
							});
							setSaveEstimationModalOpen(true);
						}}
						onHideTemplate={handleHideTemplate}
						onDeleteTemplate={handleDeleteTemplate}
						excludedFromCalculationsTemplateIds={hiddenTemplateIds}
						templateGatingSKUs={templateGatingSKUs}
						onEmployeeTemplateConfigChange={handleEmployeeTemplateConfigChangeInEstimation}
						onTopicInputChange={handleTopicInputChangeInEstimation}
						onTopicToggle={handleTopicToggleInEstimation}
						onUseCaseInputChange={handleData360UseCaseInputChangeInEstimation}
					/>
				);

			case STEP_DOWNLOAD_FORM:
				return (
					<DownloadReportFormStep
						onBack={() => goToStep(STEP_ESTIMATION)}
						onSubmit={() => {
							goToStep(STEP_ESTIMATION);
							setExportReportModalOpen(true);
						}}
						variant={isMobile ? "mobile" : "desktop"}
					/>
				);

			case STEP_SAVE_ESTIMATION_FORM:
				return (
					<SaveEstimationFormStep
						onBack={() => goToStep(STEP_ESTIMATION)}
						onSubmit={handleSaveEstimationFormSubmit}
						variant={isMobile ? 'mobile' : 'desktop'}
					/>
				);

			default:
				return null;
		}
	};

	const renderSubHeaderContent = () => {
		switch (currentStep) {
			case STEP_INDUSTRY_SIZE:
				return (
					<>
						<div className="flex flex-col items-center gap-4 w-[343px] md:w-[600px]" >
							<SubHeader isMobile={isMobile} subHeaderText={getText("calc_home_subtitle")} />
							<Description isMobile={isMobile} descriptionText={getText("calc_home_description")} />
						</div>
						<HeroFloatingIcon isMobile={isMobile} />
					</>
				);

			case STEP_SELECT_PRODUCT:
			case STEP_ADD_USE_CASE:
			case STEP_CONFIGURE:
				return (
					<>
						<SubHeader isMobile={isMobile} subHeaderText={getText("calc_estimation_subtitle")} />
						<Description isMobile={isMobile} descriptionText={getText("calc_estimation_description")} />
						<StepIndicator
							steps={steps}
							activeStep={currentStep.toString()}
							maxReachableStepKey={maxStepReachedAmongThree.toString()}
							onStepClick={handleStepIndicatorClick}
							isMobile={isMobile}
						/>
					</>
				);
			default:
				return null;
		}
	};

	// Render the botoom page footer (if applicable)
	const renderFooter = () => {
		if (isMobile || currentStep === STEP_INDUSTRY_SIZE) {
			return null;
		}

		return (
			<div className="w-full overflow-hidden bg-white leading-[0]">
				<svg
					className="block h-28 w-full"
					viewBox="0 0 1440 100"
					preserveAspectRatio="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M0,0 L1440,0 L1440,100 C960,0 480,0 0,100 Z" fill="#CFE9FE" />
				</svg>
			</div>
		);
	};

	const isBeforeStartPage = currentStep === STEP_INDUSTRY_SIZE;

	return (
		<div className={"flex min-h-screen w-full flex-col " + (isMobile ? "overflow-x-hidden" : "")}>
			{/* <NavBar /> */}

			<main
				className={`flex w-full flex-grow flex-col pb-24 ${isMobile ? "items-center" : ""}`}
				style={{
					background: isBeforeStartPage
						? "linear-gradient(180deg, #FFF 0%, #BDE3FE 26.7%, #90D0FE 47.01%, #00B3FF 92.85%, #066AFE 120.71%)"
						: "#CFE9FE",
				}}
			>
				<div className="pricing-calculator relative w-full overflow-x-clip overflow-y-visible">
					{/* Header - Hero Section */}
					{(isMobile && currentStep === STEP_DATA360_QUESTIONS) ||
					currentStep === STEP_DOWNLOAD_FORM ||
					currentStep === STEP_DOWNLOAD_REPORT ? null : (
						<div className="pricing-calculator__hero flex flex-col items-center gap-[24px] px-4 pb-0 pt-12 text-center">
							<div className={"relative " + (isMobile ? "mt-6 w-full" : "")}>
								{isBeforeStartPage &&
									(isMobile ? (
										<div className="absolute left-[17px] top-0">
											<HeroStars isMobile={isMobile} />
										</div>
									) : (
										<HeroStars isMobile={isMobile} />
									))}
								<h1
									className={
										isMobile
											? "m-0 p-0 px-[40px] text-center font-display text-[32px] font-normal leading-[40px] tracking-[-0.1px] text-[#022AC0]"
											: "pricing-calculator__title mb-0 text-center font-display text-[56px] font-normal leading-[64px] tracking-[-0.19px] text-[#022AC0]"
									}
									style={{
										fontVariantNumeric: "lining-nums proportional-nums",
										fontFeatureSettings: "'liga' off, 'clig' off",
									}}
								>
									{getText("calc_title")}
								</h1>
							</div>

							<div
								className={`w-full mx-auto flex flex-col items-center ${isMobile ? "gap-4" : "py-8 gap-7"}`}
							>
								{renderSubHeaderContent()}
							</div>
						</div>
					)}

					{renderStepContent()}
				</div>
			</main>

			{/* Bottom footer */}
			{renderFooter()}

			<SaveEstimationModal
				open={saveEstimationModalOpen}
				onClose={() => setSaveEstimationModalOpen(false)}
				onContinue={handleSaveEstimationContinue}
			/>
			<CopyPublicLinkModal
				open={copyLinkModalOpen}
				onClose={() => setCopyLinkModalOpen(false)}
				publicLink={savedPublicLink || undefined}
				lastUpdated={savedLastUpdated || undefined}
			/>
			<ExportReportModal
				open={exportReportModalOpen}
				onClose={() => setExportReportModalOpen(false)}
				onExport={() => generateReportPreviewFromData(reportData)}
			/>
		</div>
	);
};

export default UniversalPricingCalculator;
