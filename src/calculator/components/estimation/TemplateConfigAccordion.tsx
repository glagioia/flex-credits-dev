import React, { useState } from "react";
import type { Agentforce } from "@sfdc/eaas/sdk";
import type { TemplateConfigSummary } from "../../types/EstimationSummary";
import { EstimationMetrics } from "./EstimationMetrics";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { EstimationTemplateConfig } from "./EstimationTemplateConfig";
import { ProductIcon } from "../icons/ProductIcon";
import { CustomSelect, NumberInput, InputRow, Button } from "../common";
import { getText } from "../../../utils/textUtils";

export type ProductTheme = "agentforce" | "data360";

/** Agentforce: #90D0FE to match UseCaseCard topics header in STEP_ADD_USE_CASE */
const PRODUCT_THEME_COLORS: Record<ProductTheme, string> = {
	agentforce: "#0176D3",
	data360: "#0176D3",
};

export interface TemplateConfigAccordionProps {
	templateConfigs: TemplateConfigSummary[];
	totalCredits: number;
	totalPrice?: number;
	/** Total seats from estimation; shown in metrics when > 0 */
	totalSeats?: number;
	onAddTemplate?: () => void;
	onHideTemplate?: (templateId: string) => void;
	onDeleteTemplate?: (templateId: string) => void;
	onTopicInputChange?: (templateId: string, topicId: string, values: Record<string, number>) => void;
	onTopicToggle?: (templateId: string, topicId: string, enabled: boolean) => void;
	/** Template IDs excluded from total (templates still shown; menu toggles "Include/Exclude"). */
	excludedFromCalculationsTemplateIds?: Set<string>;
	addTemplateLabel?: string;
	sectionTitle?: string;
	sectionDescription?: string;
	className?: string;
	/** Theme for accordion color: agentforce (#00B3FF) or data360 (#022ac0) */
	productTheme?: ProductTheme;
	/** Called when "Add to dashboard" is clicked (e.g. navigate to STEP_SELECT_PRODUCT) */
	onAddToDashboard?: () => void;
	/** When true (solo con 2 productos), muestra toggle Agentforce | Data 360 debajo de Add to dashboard */
	showToggle?: boolean;
	/** Valor actual del toggle cuando showToggle es true */
	accordionView?: "agentforce" | "data360";
	/** Callback al cambiar el toggle */
	onAccordionViewChange?: (view: "agentforce" | "data360") => void;
	/** Cuando true, solo muestra Add to dashboard + toggle (sin métricas, acordeón ni botón Add) */
	headerOnly?: boolean;
	/** Gating SKU options per template (for employee templates in estimation step). */
	templateGatingSKUs?: Record<string, Agentforce.GatingSku[]>;
	/** Called when user changes seats or SKU for an employee template in estimation step. */
	onEmployeeConfigChange?: (
		templateId: string,
		values: { seats: number; skuId: string | null },
	) => void | Promise<void>;
}

export const TemplateConfigAccordion: React.FC<TemplateConfigAccordionProps> = ({
	templateConfigs,
	totalCredits,
	totalPrice,
	totalSeats,
	onAddTemplate,
	onHideTemplate,
	onDeleteTemplate,
	onTopicInputChange,
	onTopicToggle,
	excludedFromCalculationsTemplateIds,
	addTemplateLabel = getText("calc_add_agentforce_template"),
	sectionTitle: _sectionTitle = getText("calc_estimation_pricing_summary_title"),
	sectionDescription: _sectionDescription = getText("calc_estimation_refine_yearly"),
	className = "",
	productTheme = "agentforce",
	onAddToDashboard,
	showToggle = false,
	accordionView = "agentforce",
	onAccordionViewChange,
	headerOnly = false,
	templateGatingSKUs = {},
	onEmployeeConfigChange,
}) => {
	const accentColor = PRODUCT_THEME_COLORS[productTheme];
	const [openTemplateIds, setOpenTemplateIds] = useState<Record<string, boolean>>({});
	const [menuOpen, setMenuOpen] = useState<string | null>(null);
	const [deleteConfirmTemplateId, setDeleteConfirmTemplateId] = useState<string | null>(null);
	const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
	const excluded = excludedFromCalculationsTemplateIds ?? new Set<string>();
	const creditsFromTemplates = templateConfigs
		.filter((cfg) => !excluded.has(cfg.template.id))
		.reduce((sum, cfg) => sum + (cfg.templateCredits ?? 0), 0);
	const effectiveTotalCredits = totalCredits != null && totalCredits > 0 ? totalCredits : creditsFromTemplates;

	const toggleTemplate = (templateId: string) => {
		setOpenTemplateIds((prev) => ({ ...prev, [templateId]: !prev[templateId] }));
		if (menuOpen === templateId) setMenuOpen(null);
	};

	return (
		<div className={className}>
			{onAddToDashboard && (
				<div className="mb-6 flex justify-center text-[#1d4782]">
					<button
						type="button"
						onClick={onAddToDashboard}
						className="text-s mt-6 font-sans font-bold tracking-tight underline hover:no-underline focus:outline-none md:mt-0"
						style={{ color: "#032D60" }}
					>
						{getText("calc_add_product")}
					</button>
				</div>
			)}
			{showToggle && onAccordionViewChange && (
				<div className="mb-6">
					<div className="flex items-center justify-center gap-8 border-b border-[#c9c9c9]">
						<button
							type="button"
							onClick={() => onAccordionViewChange("agentforce")}
							className="flex flex-col items-center gap-1 focus:outline-none"
						>
							<div className="flex items-center gap-2">
								<span className="inline-block h-8 w-8 shrink-0 [&_svg]:h-full [&_svg]:w-full">
									<ProductIcon type="agentforce" />
								</span>
								<span
									className={`font-sans text-sm ${accordionView === "agentforce" ? "font-bold" : "font-medium"}`}
									style={{
										color: accordionView === "agentforce" ? PRODUCT_THEME_COLORS.agentforce : "#181818",
									}}
								>
									{getText("calc_product_agentforce_name")}
								</span>
							</div>
							 
								<div
									className="h-[5px] w-full min-w-[80px] font-sans"
									style={{ backgroundColor: accordionView === "agentforce" ? PRODUCT_THEME_COLORS.agentforce : "transparent" }}
								/>
							
						</button>
						<button
							type="button"
							onClick={() => onAccordionViewChange("data360")}
							className="flex flex-col items-center gap-1 focus:outline-none"
						>
							<div className="flex items-center gap-2">
								<span className="inline-block h-8 w-8 shrink-0 [&_svg]:h-full [&_svg]:w-full">
									<ProductIcon type="data360" />
								</span>
								<span
									className={`font-sans text-sm ${accordionView === "data360" ? "font-bold" : "font-medium"}`}
									style={{
										color: accordionView === "data360" ? PRODUCT_THEME_COLORS.data360 : "#181818",
									}}
								>
									{getText("calc_product_data360_name")}
								</span>
							</div>
								<div
									className="h-[5px] w-full min-w-[80px] font-sans"
									style={{ backgroundColor: accordionView === "data360" ? PRODUCT_THEME_COLORS.data360 : "transparent" }}
								/>
						</button>
					</div>
					
				</div>
			)}
			{!headerOnly && (
				<>
					<section className="mb-8 rounded-xl p-0 md:p-6">
						<EstimationMetrics
							type={productTheme}
							totalCredits={effectiveTotalCredits}
							totalPrice={totalPrice}
							totalSeats={totalSeats}
							showCreditsInfoIcon
						/>
					</section>

					<div className="mb-4 flex w-full justify-center md:justify-end">
						<Button
							buttonType="secondary"
							onClick={() => onAddTemplate?.()}
							disabled={false}
							className="w-full md:w-auto"
						>
							{addTemplateLabel}
							<span className="text-lg leading-none">+</span>
						</Button>
					</div>

					{templateConfigs.map((cfg, index) => {
						const templateCredits = cfg.templateCredits;
						const templatePrice = cfg.templatePrice;
						const isOpen = openTemplateIds[cfg.template.id] ?? index === 0;
						const isExcluded = excluded.has(cfg.template.id);
						const isEditing = editingTemplateId === cfg.template.id;
						return (
							<section
								key={cfg.template.id}
								className={`mb-4 rounded-xl ${isExcluded ? "opacity-75" : ""}`}
								style={{ background: accentColor }}
							>
								<div
									role="button"
									tabIndex={0}
									className="flex w-full cursor-pointer flex-col p-5 text-left md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4"
									onClick={() => toggleTemplate(cfg.template.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											toggleTemplate(cfg.template.id);
										}
									}}
								>
									{/* Row 1: arrow + title + menu */}
									<div className="flex items-start justify-between gap-3 md:flex-1">
										<div className="flex flex-1 items-start gap-3">
											<span
												className="mt-0.5 flex-shrink-0 transition-transform"
												style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
											>
												<svg className="h-5 w-5 text-[#023248]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
												</svg>
											</span>
											<div>
												<h4 className="text-xl font-semibold text-[#032D60]">{cfg.template.displayName}</h4>
												<p className="mt-0.5 text-sm text-[#032D60]">
													{isExcluded ? getText("calc_excluded_from_total") : getText("calc_configure_use_case_subtitle")}
												</p>
											</div>
										</div>
										{/* 3-dot menu — visible on mobile in this row */}
										<div className="relative block md:hidden h-full">
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setMenuOpen(menuOpen === cfg.template.id ? null : cfg.template.id);
												}}
												className="rounded p-2 text-[#023248] transition-colors hover:bg-white/30 h-full w-full flex items-center justify-center"
												aria-label="Menu"
											>
												<svg className="h-full w-12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
													<circle cx="12" cy="6" r="1.5" />
													<circle cx="12" cy="12" r="1.5" />
													<circle cx="12" cy="18" r="1.5" />
												</svg>
											</button>
											{menuOpen === cfg.template.id && (
												<div className="absolute right-0 top-full z-20 mt-1 min-w-[240px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
													<button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); setEditingTemplateId((prev) => (prev === cfg.template.id ? null : cfg.template.id)); }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">{isEditing ? getText("calc_done_editing") : getText("calc_edit_use_case")}</button>
													<button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); onHideTemplate?.(cfg.template.id); }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">{isExcluded ? getText("calc_include_in_calculations") : getText("calc_exclude_from_calculations")}</button>
													<button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); setDeleteConfirmTemplateId(cfg.template.id); }} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">{getText("calc_delete")}</button>
												</div>
											)}
										</div>
									</div>
									{/* Row 2 (mobile) / inline (desktop): metrics + menu */}
									<div className="mt-4 flex items-center justify-center gap-6 border-t border-[#032D60]/20 pt-4 md:mt-0 md:flex-shrink-0 md:border-0 md:pt-0 md:justify-end">
										{cfg.templateSeats != null && cfg.templateSeats !== 0 && (
											<div className="flex flex-col items-center">
												<span className="whitespace-nowrap font-semibold text-[#032D60]">
													{Number(cfg.templateSeats).toLocaleString("en-US", { maximumFractionDigits: 0 })}
												</span>
												<span className="text-sm text-[#032D60]">{getText("calc_configure_use_case_seats")}</span>
											</div>
										)}
										<div className="flex flex-col items-center">
											<span className="whitespace-nowrap font-semibold text-[#032D60] text-[20px]">
												{Number(templateCredits).toLocaleString("en-US", { maximumFractionDigits: 0 })}
											</span>
											<span className="text-sm text-[#032D60]">{getText("calc_configure_use_case_credits")}</span>
										</div>
										<div className="flex flex-col items-center">
											<span className="whitespace-nowrap font-semibold text-[#032D60] text-[20px]">
												{templatePrice != null
													? `$${Number(templatePrice).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
													: "—"}
											</span>
											<span className="text-sm text-[#032D60]">{getText("calc_configure_use_case_pricing")}</span>
										</div>
										{/* 3-dot menu — desktop only (inline with metrics) */}
										<div className="relative max-md:hidden">
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setMenuOpen(menuOpen === cfg.template.id ? null : cfg.template.id);
												}}
												className="rounded p-2 text-[#023248] transition-colors hover:bg-white/30"
												aria-label="Menu"
											>
												<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
													<circle cx="12" cy="6" r="1.5" />
													<circle cx="12" cy="12" r="1.5" />
													<circle cx="12" cy="18" r="1.5" />
												</svg>
											</button>
											{menuOpen === cfg.template.id && (
												<div className="absolute right-0 top-full z-20 mt-1 min-w-[240px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
													<button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); setEditingTemplateId((prev) => (prev === cfg.template.id ? null : cfg.template.id)); }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">{isEditing ? getText("calc_done_editing") : getText("calc_edit_use_case")}</button>
													<button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); onHideTemplate?.(cfg.template.id); }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">{isExcluded ? getText("calc_include_in_calculations") : getText("calc_exclude_from_calculations")}</button>
													<button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(null); setDeleteConfirmTemplateId(cfg.template.id); }} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">{getText("calc_delete")}</button>
												</div>
											)}
										</div>
									</div>
								</div>
								{isOpen && (
									<div className="overflow-hidden rounded-b-xl border-t border-gray-100 bg-[#e7f4ff] p-6 md:p-0 	md:px-6">
										{cfg.templateSeats != null && cfg.topics.length === 0 ? (
											<div className="space-y-4">
												<InputRow
													label={getText("calc_employee_template_license_label")}
													tooltip={getText("calc_employee_template_license_label")}
													isMobile={false}
													disabled={!isEditing}
												>
													{isEditing && (templateGatingSKUs[cfg.template.id]?.length ?? 0) > 0 ? (
														<CustomSelect
															options={(templateGatingSKUs[cfg.template.id] || []).map((sku) => ({
																id: sku.id,
																label: sku.displayName,
															}))}
															value={cfg.gatingSkuId}
															onChange={(skuId) =>
																onEmployeeConfigChange?.(cfg.template.id, { seats: cfg.templateSeats ?? 0, skuId })
															}
															placeholder={getText("calc_employee_template_license_placeholder")}
														/>
													) : (
														<span className="text-base font-medium text-[#032D60]">
															{cfg.gatingSkuId
																? (templateGatingSKUs[cfg.template.id]?.find((s) => s.id === cfg.gatingSkuId)
																		?.displayName ?? `SKU ${cfg.gatingSkuId}`)
																: "—"}
														</span>
													)}
												</InputRow>
												<InputRow
													label={getText("calc_employee_template_seats_label")}
													tooltip={getText("calc_employee_template_seats_label")}
													isMobile={false}
													disabled={!isEditing}
												>
													<NumberInput
														value={cfg.templateSeats ?? 0}
														onChange={(seats) =>
															onEmployeeConfigChange?.(cfg.template.id, { seats, skuId: cfg.gatingSkuId ?? null })
														}
														disabled={!isEditing}
													/>
												</InputRow>
											</div>
										) : (
											<EstimationTemplateConfig
												template={cfg.template}
												topics={cfg.topics}
												topicCredits={cfg.topicCredits}
												topicPrices={cfg.topicPrices}
												disabledTopics={cfg.disabledTopics}
												initialTopicInputValues={cfg.topicInputValues}
												inputLayout="inline"
												contentMaxWidth={1800}
												readOnly={!isEditing}
												onTopicInputChange={(topicId: string, values: Record<string, number>) =>
													onTopicInputChange?.(cfg.template.id, topicId, values)
												}
												onTopicToggle={(topicId: string, enabled: boolean) =>
													onTopicToggle?.(cfg.template.id, topicId, enabled)
												}
											/>
										)}
									</div>
								)}
							</section>
						);
					})}

					<DeleteConfirmationModal
						open={deleteConfirmTemplateId !== null}
						onClose={() => setDeleteConfirmTemplateId(null)}
						onConfirm={() => {
							if (deleteConfirmTemplateId) {
								onDeleteTemplate?.(deleteConfirmTemplateId);
								setDeleteConfirmTemplateId(null);
							}
						}}
					/>
				</>
			)}
		</div>
	);
};
