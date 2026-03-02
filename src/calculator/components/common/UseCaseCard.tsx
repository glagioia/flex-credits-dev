import React, { useState } from "react";
import { Button, BUTTON_TYPES, RecommendedBadge } from "./index";
import { Agentforce, Data360 } from "@sfdc/eaas/sdk";
import deleteIcon from "./ui/delete.svg";
import editIcon from "./ui/edit.svg";
import closeIcon from "./ui/close.svg";
import { getText } from "../../../utils/textUtils";
import TargetAudienceBadge from "./TargetAudienceBadge";

interface ItemCardProps {
	item: Agentforce.Template | Data360.UseCase;
	mode: "agent-templates" | "use-cases";
	onConfigure: (item: Agentforce.Template | Data360.UseCase) => void;
	isMobile?: boolean;
	isSelected?: boolean;
	onRemove: (item: Agentforce.Template | Data360.UseCase) => void;
	onEdit: (item: Agentforce.Template | Data360.UseCase) => void;
	startExpanded?: boolean;
}

const UseCaseCard: React.FC<ItemCardProps> = ({ item, mode, onConfigure, isMobile = false, isSelected = false, onRemove, onEdit, startExpanded = false }) => {
	const [isExpanded, setIsExpanded] = useState(startExpanded);
  	const isAgentTemplates = mode === "agent-templates";
	const isEmployeeTemplate = isAgentTemplates && (item as Agentforce.Template)?.targetAudience === "EMPLOYEE";
	const hasTopics = isAgentTemplates && (item as Agentforce.Template)?.topics?.length > 0;

	const toggleAction = () => {
		// En mobile siempre togglea (para el modal), en desktop solo si es acordeón
		// Only toggle if there are topics to show
		if ((isMobile || isAgentTemplates) && hasTopics) {
			setIsExpanded(!isExpanded);
		}
	};

	const actionIcons = [
		<button
			type="button"
			key="delete-button"
			onClick={() => onRemove(item)}
			className="rounded p-1.5 transition-colors hover:bg-gray-200"
			aria-label="Delete"
		>
			<img src={deleteIcon} alt="" className="h-5 w-5" />
		</button>,
		<button
			type="button"
			key="edit-button"
			onClick={() => onEdit(item)}
			className="rounded p-1.5 transition-colors hover:bg-gray-200"
			aria-label="Edit"
		>
			<img src={editIcon} alt="" className="h-5 w-5" />
		</button>,
	];

	const gradientBorder =
		"linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.00) 49.04%, rgba(255, 255, 255, 0.25) 100%)";

	return (
		<div
			className={`p-[2px] shadow-[0_10px_10px_0_rgba(6,106,254,0.20)] ${isMobile ? "rounded-2xl" : "rounded-xl"}`}
			style={{ background: gradientBorder }}
		>
			<div className={`overflow-hidden bg-[#E7F4FF] ${isMobile ? "rounded-[14px] p-5" : "rounded-[10px]"}`}>
				<div className={isMobile ? "" : isAgentTemplates && !isEmployeeTemplate ? "p-5" : "py-5 pl-10 pr-5"}>
					{/* Mobile: Badge at top, right */}

					{isMobile && (
						<div className="mb-3 flex justify-end gap-2 items-center">
							<RecommendedBadge />
							{isAgentTemplates && (
								
									<TargetAudienceBadge audience={isEmployeeTemplate ? "EMPLOYEE" : "CUSTOMER"} />
							
							)}
						</div>
					)}
					<div className={`flex ${isMobile ? "flex-col" : "items-start justify-between"} gap-4`}>
						<div className={isMobile ? "" : "flex-1"}>
							<div className={`mb-2 flex ${isMobile ? "items-start" : "items-center gap-3"}`}>
								{/* Flecha: Solo en Desktop y si tiene topics */}
								{!isMobile && hasTopics && (
									<button
										onClick={toggleAction}
										className="text-[#032D60] transition-colors hover:text-gray-700"
										style={{ scale: 1.5 }}
									>
										<svg
											className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</button>
								)}

								<h4
									className={`font-semibold text-[#023248] ${isMobile ? "text-lg" : "text-lg text-blue-700"} ${hasTopics || isMobile ? "cursor-pointer" : ""}`}
									onClick={toggleAction}
								>
									{isAgentTemplates ? (item as Agentforce.Template).displayName : (item as Data360.UseCase).title}
								</h4>
								{/* Desktop: Badge inline with title */}
								{!isMobile && (
									<div className="flex items-center gap-2">
										<RecommendedBadge />
										{isAgentTemplates && (
											<TargetAudienceBadge audience={isEmployeeTemplate ? "EMPLOYEE" : "CUSTOMER"} />
										)}
									</div>
								)}
							</div>

							<p
								className={`text-sm text-[#023248] ${!isMobile && hasTopics ? "ml-8" : ""} ${isMobile ? "mt-2 leading-5" : ""}`}
							>
								{item.description}
							</p>

							{/* Mobile: View Topics (izq) y Configure o iconos (der) en la misma fila abajo */}
							{isMobile && (
								<div className="mt-4 flex items-center justify-between">
									{isAgentTemplates && (item as Agentforce.Template)?.topics.length > 0 ? (
										<Button
											className="font-sans text-[14px] font-bold text-[#0176D3] underline"
											onClick={toggleAction}
											buttonType={BUTTON_TYPES.LINK}
										>
											{getText("calc_use_case_view_topics")}
										</Button>
									) : (
										<div />
									)}
									{isSelected ? (
										<div className="flex items-center gap-2">{actionIcons}</div>
									) : (
										<Button size="small" onClick={() => onConfigure(item)}>
											{getText("calc_add_use_case_button_configure")}
										</Button>
									)}
								</div>
							)}
						</div>

						{!isMobile && (
							<div className="flex-shrink-0">
								{isSelected ? (
									<div className="flex items-center gap-2">{actionIcons}</div>
								) : (
									<Button onClick={() => onConfigure(item)}>{getText("calc_add_use_case_button_configure")}</Button>
								)}
							</div>
						)}
					</div>
				</div>

				{/* --- VISTA DESKTOP: ACORDEÓN (Tabla Grid) --- */}
				{!isMobile && isAgentTemplates && isExpanded && isAgentTemplates && (item as Agentforce.Template)?.topics && (
					<div className="px-5 pb-5">
						<div className="ml-8 overflow-hidden rounded-lg border border-blue-200">
							<div className="bg-[#90D0FE] px-4 py-2 text-sm font-medium text-black">
								{getText("calc_use_case_topics_table")}
							</div>
							<div className="bg-white">
								<div className="grid grid-cols-3">
									{(isAgentTemplates && (item as Agentforce.Template))?.topics.map((topic, index) => {
										const colIndex = index % 3;
										const rowIndex = Math.floor(index / 3);
										const totalRows = Math.ceil((isAgentTemplates && (item as Agentforce.Template)).topics!.length / 3);
										const isLastRow = rowIndex === totalRows - 1;
										const isLastCol = colIndex === 2;

										return (
											<span
												key={topic.id}
												className={`px-4 py-3 text-sm text-black ${
													!isLastCol ? "border-r border-[#E5E5E5]" : ""
												} ${!isLastRow ? "border-b border-[#E5E5E5]" : ""}`}
											>
												{topic.displayName}
											</span>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* --- VISTA MOBILE: MODAL (Overlay) --- */}
				{isMobile && isExpanded && (
					<div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
						<div className="absolute inset-0 bg-black/20" onClick={toggleAction} />
						<div className="relative flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
							<div className="flex items-center justify-between rounded-t-2xl bg-[#E5E5E5] px-6 py-4">
								<span className="text-md font-display font-bold text-[#032D60]">
									{getText("calc_use_case_topics_table")}
								</span>
								<button onClick={toggleAction} className="p-1 text-gray-800 hover:text-gray-600" aria-label="Close">
									<img src={closeIcon} alt="" className="h-6 w-6" />
								</button>
							</div>
							<div className="overflow-y-auto">
								{isAgentTemplates &&
									(item as Agentforce.Template)?.topics.map((topic) => (
										<div key={topic.id} className={"text-md border-t border-gray-200 px-6 py-5 text-[#181818]"}>
											{topic.displayName}
										</div>
									))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default UseCaseCard;
