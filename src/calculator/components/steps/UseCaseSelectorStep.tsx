import React, { useState, useMemo } from 'react';
import { SearchInput, FilterSidebar, UseCaseCard, BUTTON_TYPES, Button } from '../common';
import type { FilterSectionType } from '../common/FilterSidebar';
import { DeleteConfirmationModal } from '../estimation/DeleteConfirmationModal';
import closeIcon from '../common/ui/close.svg';
import filterIcon from '../home/ui/assets/filterIcon.png';
import { Agentforce, Data360, Taxonomy } from '@sfdc/eaas/sdk';
import { getText } from '../../../utils/textUtils';

export type LineOfBusiness = {
  id: string;
  systemName: string;
  displayName: string;
  description?: string;
};

type ItemWithFilterIds = {
  industryIds?: (string | number)[];
  lineOfBusinessIds?: (string | number)[];
};

const matchesSearch = (item: Agentforce.Template | Data360.UseCase, mode: 'agent-templates' | 'use-cases', query: string) => {
  if (!query) return true;
  const q = query.toLowerCase();

  if (mode === 'agent-templates') {
    const t = item as Agentforce.Template;
    return (t.displayName || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
  }

  const uc = item as Data360.UseCase;
  return (uc.title || "").toLowerCase().includes(q) || (uc.description || "").toLowerCase().includes(q);
};

const matchesFilters = (
  item: Agentforce.Template | Data360.UseCase,
  selectedFilters: Record<string, string[]>,
) => {
  const withIds = item as unknown as ItemWithFilterIds;

  const activeIndustryIds = selectedFilters['industry'];
  const activeLobIds = selectedFilters['lineOfBusiness'];

  const hasIndustryFilter = activeIndustryIds && activeIndustryIds.length > 0;
  const hasLobFilter = activeLobIds && activeLobIds.length > 0;

  if (!hasIndustryFilter && !hasLobFilter) return true;

  const itemIndustryIds = withIds.industryIds;
  const itemLobIds = withIds.lineOfBusinessIds;

  const matchesIndustry = !hasIndustryFilter ||
    !itemIndustryIds ||
    itemIndustryIds.some(id => activeIndustryIds.includes(String(id)));

  const matchesLob = !hasLobFilter ||
    !itemLobIds ||
    itemLobIds.some(id => activeLobIds.includes(String(id)));

  return matchesIndustry && matchesLob;
};

function buildFilterSections(
  industries: Taxonomy.Industry[],
  lineOfBusinesses: LineOfBusiness[],
): FilterSectionType[] {
  const sections: FilterSectionType[] = [];

  if (industries.length > 0) {
    sections.push({
      id: 'industry',
      label: getText("calc_filter_industry"),
      options: industries.map((i) => ({ id: String(i.id), label: i.displayName })),
    });
  }

  if (lineOfBusinesses.length > 0) {
    sections.push({
      id: 'lineOfBusiness',
      label: getText("calc_filter_line_of_business"),
      options: lineOfBusinesses.map((l) => ({ id: String(l.id), label: l.displayName })),
    });
  }

  return sections;
}

// --- Sub-componente para el Modal de Filtros en Mobile ---
const FilterModal = ({ isOpen, onClose, sections, selectedFilters, onFilterChange }: any) => {
  if (!isOpen) return null;
  return (
		<div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-white pt-[112px]">
		
	
			<div className="flex-1 p-6">
				<FilterSidebar sections={sections} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
			</div>
			<div className="border-t p-6">
				<button
					onClick={onClose}
					className="h-[52px] w-full rounded bg-[#0176D3] font-bold text-white shadow-lg transition-transform active:scale-95"
				>
					{getText("calc_filters_apply_filter")}
				</button>
			</div>
		</div>
	);
};

// --- Componente Principal Unificado ---
interface ItemSelectorProps {
  mode: 'agent-templates' | 'use-cases';
  onConfigure: (item: Agentforce.Template | Data360.UseCase) => void;
  onReturnToDashboard?: () => void;
  items: Agentforce.Template[] | Data360.UseCase[];
  /** Available industries from taxonomy (used to build Agentforce industry filter) */
  industries?: Taxonomy.Industry[];
  /** Available lines of business (used to build Agentforce LOB filter) */
  lineOfBusinesses?: LineOfBusiness[];
  isMobile?: boolean;
  selectedTemplateIds?: string[];
  onRemoveTemplate: (item: Agentforce.Template | Data360.UseCase) => void;
  onEditTemplate: (item: Agentforce.Template | Data360.UseCase) => void;
  /** Called when user clicks "Edit Data Foundation" (Data360 only) */
  onEditDataFoundation?: () => void;
}

const UseCaseSelectorStep: React.FC<ItemSelectorProps> = ({
  mode,
  onConfigure,
  onReturnToDashboard,
  items,
  industries = [],
  lineOfBusinesses = [],
  isMobile,
  selectedTemplateIds = [],
  onRemoveTemplate,
  onEditTemplate,
  onEditDataFoundation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Agentforce.Template | Data360.UseCase | null>(null);

  const isAgentforce = mode === 'agent-templates';
  const filterSections = useMemo(
    () => buildFilterSections(industries, lineOfBusinesses),
    [industries, lineOfBusinesses],
  );
  const hasFilters = filterSections.length > 0;
  const title = isAgentforce ? getText("calc_use_case_title_agentforce") : getText("calc_use_case_title_data360");

  const handleFilterChange = (sectionId: string, optionId: string, selected: boolean) => {
    setSelectedFilters((prev) => {
      const current = prev[sectionId] || [];
      return {
        ...prev,
        [sectionId]: selected ? [...current, optionId] : current.filter(id => id !== optionId)
      };
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) => matchesSearch(item, mode, searchQuery) && matchesFilters(item, selectedFilters),
    );
  }, [items, searchQuery, selectedFilters, mode]);

  return (
		<div className={`w-full ${isMobile ? "flex flex-col" : "flex flex-wrap gap-8 pt-8 "}`}>
			{/* Sidebar for Desktop / Toolbar for Mobile */}
			{!isMobile ? (
				<aside className={`w-64 flex-shrink-0 space-y-6 ${isAgentforce ? "pt-16" : "pt-[135px]"}`}>
					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder={getText(isAgentforce ? "calc_filters_search_input_placeholder_agentforce" : "calc_filters_search_input_placeholder_data360")}
					/>
					{hasFilters && (
						<FilterSidebar
							sections={filterSections}
							selectedFilters={selectedFilters}
							onFilterChange={handleFilterChange}
						/>
					)}
				</aside>
			) : (
				<div className="flex flex-col mt-8 gap-6">
					<span className="visible md:invisible text-[20px] md:text-[32px] text-center font-semibold text-[#032D60] md:text-left">
					{title} ({filteredItems.length})
				</span>

				<div className="space-y-4">
					<div className="flex gap-2">
						<div className="flex-1">
							<SearchInput
								value={searchQuery}
								onChange={setSearchQuery}
								placeholder={getText(isAgentforce ? "calc_filters_search_input_placeholder_agentforce" : "calc_filters_search_input_placeholder_data360")}
							/>
						</div>
						{hasFilters && (
							<button
								onClick={() => setIsFilterModalOpen(true)}
								className="flex h-[44px] items-center gap-2 rounded-lg border border-gray-200 bg-transparent px-4 text-[12px] text-[#023248] font-sans cursor-pointer"
							>
							<span>{getText("calc_filters_search_icon_text")}</span>
							<img src={filterIcon} alt="" className="h-[26px] w-[26px]" />
							</button>
						)}
					</div>
				</div>
				</div>
			)}

			{/* Contenido: Título y Lista de Cards */}
			<div className={`flex-1`}>
				{/* Edit Data Foundation link (Data360 only) */}
				{!isAgentforce && onEditDataFoundation && (
					<div className={isMobile ? "mb-4 flex justify-center" : "mb-4 flex justify-end"}>
						<Button buttonType={BUTTON_TYPES.LINK} onClick={onEditDataFoundation}>
							{getText("calc_edit_data_foundation")}
						</Button>
					</div>
				)}

				<h2 className="invisible md:visible text-[20px] md:text-[32px] mb-0 md:mb-6 text-center font-semibold text-[#032D60] md:text-left">
					{title} ({filteredItems.length})
				</h2>

				<div className="space-y-4">
					{filteredItems.map((item, idx) => (
						<UseCaseCard
							key={item.id}
							item={item}
							mode={mode}
							onConfigure={() => onConfigure(item)}
							isMobile={isMobile}
							isSelected={selectedTemplateIds.includes(item.id)}
							onRemove={(item) => setItemToDelete(item)}
							onEdit={onEditTemplate}
							startExpanded={idx === 0 && !isMobile}
						/>
					))}
				</div>
				{/* Return to Dashboard for Mobile - centered */}
				{isMobile && onReturnToDashboard && (
					<div className="flex justify-center py-8">
						<Button onClick={onReturnToDashboard} buttonType={BUTTON_TYPES.LINK}>
							{getText("calc_return_to_dashboard")}
						</Button>
					</div>
				)}
			</div>

			{/* Return to Dashboard for Desktop - bottom left aligned with sidebar */}
			{!isMobile && onReturnToDashboard && (
				<div className="w-full flex justify-start py-8">
					<Button onClick={onReturnToDashboard} buttonType={BUTTON_TYPES.LINK}>
						{getText("calc_return_to_dashboard")}
					</Button>
				</div>
			)}

			{/* Modal de Filtros (Solo se activa en Mobile) */}
			<FilterModal
				isOpen={isFilterModalOpen}
				onClose={() => setIsFilterModalOpen(false)}
				sections={filterSections}
				selectedFilters={selectedFilters}
				onFilterChange={handleFilterChange}
			/>

			<DeleteConfirmationModal
				open={itemToDelete != null}
				onClose={() => setItemToDelete(null)}
				onConfirm={() => {
					if (itemToDelete) {
						onRemoveTemplate(itemToDelete);
						setItemToDelete(null);
					}
				}}
			/>
		</div>
	);
};

export default UseCaseSelectorStep;