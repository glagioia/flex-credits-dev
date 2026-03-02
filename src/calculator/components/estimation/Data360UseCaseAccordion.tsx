import React, { useState } from 'react';
import type { Data360 } from '@sfdc/eaas/sdk';
import { EstimationMetrics } from './EstimationMetrics';
import { Button, InputRow, NumberInput, Slider, Toggler } from '../common';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { getText } from '../../../utils/textUtils';

export interface Data360UseCaseConfigSummary {
  useCaseId: string;
  title: string;
  price: number;
  credits?: number;
  description?: string;
  inputValues?: Record<string, number>;
  /** Full use case definition (mirrors Agentforce: template embedded in TemplateConfigSummary) */
  useCase?: Data360.UseCase;
}

const DATA360_ACCENT_COLOR = '#003399';
const DATA360_BODY_BG = '#E8F4FC';

export interface Data360UseCaseAccordionProps {
  useCaseConfigs: Data360UseCaseConfigSummary[];
  totalCredits?: number;
  totalPrice?: number;
  onAddTemplate?: () => void;
  addTemplateLabel?: string;
  onHideUseCase?: (useCaseId: string) => void;
  onDeleteUseCase?: (useCaseId: string) => void;
  onUseCaseInputChange?: (useCaseId: string, values: Record<string, number>) => void;
  excludedFromCalculationsUseCaseIds?: Set<string>;
  className?: string;
  onAddToDashboard?: () => void;
  showAddToDashboard?: boolean;
}

export const Data360UseCaseAccordion: React.FC<Data360UseCaseAccordionProps> = ({
  useCaseConfigs,
  totalCredits,
  totalPrice,
  onAddTemplate,
  onHideUseCase,
  onDeleteUseCase,
  onUseCaseInputChange,
  excludedFromCalculationsUseCaseIds,
  addTemplateLabel = getText("calc_add_data360_use_case"),
  className = '',
  onAddToDashboard,
  showAddToDashboard,
}) => {
  const [openUseCaseIds, setOpenUseCaseIds] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirmUseCaseId, setDeleteConfirmUseCaseId] = useState<string | null>(null);
  const [editingUseCaseId, setEditingUseCaseId] = useState<string | null>(null);
  const excluded = excludedFromCalculationsUseCaseIds ?? new Set<string>();

  const toggleUseCase = (useCaseId: string) => {
    setOpenUseCaseIds((prev) => ({ ...prev, [useCaseId]: !prev[useCaseId] }));
    if (menuOpen === useCaseId) setMenuOpen(null);
  };

  return (
    <div className={className}>
      {onAddToDashboard && showAddToDashboard && (
				<div className="mb-6 flex justify-center text-[#1d4782]">
					<button
						type="button"
						onClick={onAddToDashboard}
						className="text-s font-sans font-bold tracking-tight underline hover:no-underline focus:outline-none mt-6 md:mt-0"
						style={{ color: "#032D60" }}
					>
						{getText("calc_add_product")}
					</button>
				</div>
			)}
					<section className="mb-8 rounded-xl border border-gray-200 p-0 md:p-6">
          <EstimationMetrics
          type="data360"
          totalCredits={totalCredits}
          totalPrice={totalPrice}
        />
      </section>

      <div className="flex justify-end mb-4">
   
        <Button
          buttonType="secondary"
          onClick={() => onAddTemplate?.()}
          className="w-full md:w-auto"
        >
          {addTemplateLabel}
          <span className="text-lg leading-none">+</span>
        </Button>
      </div>

      {useCaseConfigs.map((cfg, index) => {
        const isOpen = openUseCaseIds[cfg.useCaseId] ?? index === 0;
        const useCase = cfg.useCase;
        const isExcluded = excluded.has(cfg.useCaseId);
        return (
          <section
            key={cfg.useCaseId}
            className={`rounded-xl overflow-hidden mb-4 ${isExcluded ? 'opacity-75' : ''}`}
            style={{ background: DATA360_ACCENT_COLOR }}
          >
            <div
              role="button"
              tabIndex={0}
              className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-4 p-5 text-left"
              onClick={() => toggleUseCase(cfg.useCaseId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleUseCase(cfg.useCaseId);
                }
              }}
            >
              <div className="flex flex-1 items-start gap-3">
                <span
                  className="flex-shrink-0 mt-0.5 transition-transform"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xl font-semibold text-white">{cfg.title}</h4>
                  <p className="mt-0.5 text-sm text-white">
                    {isExcluded ? 'Excluded from total' : getText('calc_configure_use_case_subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="whitespace-nowrap font-semibold text-white">
                    {Number(cfg.credits ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-white">Credits</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="whitespace-nowrap font-semibold text-white">
                    {cfg.price != null ? `$${Number(cfg.price).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
                  </span>
                  <span className="text-sm text-white">Pricing</span>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === cfg.useCaseId ? null : cfg.useCaseId);
                    }}
                    className="rounded p-2 text-white transition-colors hover:bg-white/30"
                    aria-label="Menu"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="6" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="18" r="1.5" />
                    </svg>
                  </button>
                  
                  {menuOpen === cfg.useCaseId && (
                    <div className="absolute right-0 top-full z-20 mt-1 min-w-[240px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          setEditingUseCaseId((prev) => (prev === cfg.useCaseId ? null : cfg.useCaseId));
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {editingUseCaseId === cfg.useCaseId ? 'Done editing' : 'Edit use case'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          onHideUseCase?.(cfg.useCaseId);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {isExcluded ? 'Include in calculations' : 'Exclude from calculations'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          setDeleteConfirmUseCaseId(cfg.useCaseId);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isOpen && (
              <div className="overflow-hidden rounded-b-xl border-t border-gray-100" style={{ background: DATA360_BODY_BG }}>
                {useCase && (useCase.inputs?.length ?? 0) > 0 ? (
                  <div className="px-6 py-4 overflow-x-auto">
                    <div
                      className="grid gap-6"
                      style={{ gridTemplateColumns: 'repeat(3, minmax(350px, 1fr))' }}
                    >
                      {useCase.inputs.map((input) => {
                        const key = input.key ?? (input as { inputKey?: string }).inputKey ?? '';
                        const rawValue = cfg.inputValues?.[key] ?? cfg.inputValues?.[input.key ?? ''] ?? (input.config as { default?: number })?.default ?? 0;
                        const numVal = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0;
                        const inputType = (input.type ?? 'NUMBER') as string;
                        const isPercent = inputType === 'PERCENT';
                        const value = isPercent && numVal <= 1 ? Math.round(numVal * 100) : numVal;
                        const isToggle = inputType === 'TOGGLE' || inputType === 'BOOLEAN';
                        const isEditing = editingUseCaseId === cfg.useCaseId;

                        const handleChange = (newVal: number | boolean) => {
                          const numVal = typeof newVal === 'boolean' ? (newVal ? 1 : 0) : newVal;
                          const merged = { ...(cfg.inputValues ?? {}), [key]: numVal };
                          onUseCaseInputChange?.(cfg.useCaseId, merged);
                        };

                        const INPUT_WIDTH = 350;
                        const INPUT_HEIGHT = 82;

                        const renderControl = () => {
                          if (isToggle) {
                            return (
                              <Toggler
                                value={value !== 0}
                                onChange={(v) => handleChange(v)}
                                disabled={!isEditing}
                              />
                            );
                          }
                          const inner = isPercent ? (
                            <Slider
                              value={value}
                              onChange={(v) => handleChange(v)}
                              min={(input.config as { min?: number })?.min ?? 0}
                              max={(input.config as { max?: number })?.max ?? 100}
                              isPercentage
                              disabled={!isEditing}
                              style={{ width: INPUT_WIDTH }}
                            />
                          ) : (
                            <NumberInput
                              value={value}
                              onChange={(v) => handleChange(v)}
                              min={(input.config as { min?: number })?.min}
                              max={(input.config as { max?: number })?.max}
                              disabled={!isEditing}
                            />
                          );
                          return (
                            <div
                              className="flex shrink-0 items-center overflow-visible"
                              style={{ width: INPUT_WIDTH, minWidth: INPUT_WIDTH, height: INPUT_HEIGHT }}
                            >
                              {inner}
                            </div>
                          );
                        };

                        return (
                          <div key={key} className="flex min-h-[220px] min-w-[350px] w-[350px] flex-shrink-0 flex-col">
                            <InputRow
                              label={input.label}
                              tooltip={input.description}
                              description={input.description}
                              hideBorder
                              disabled={!isEditing}
                              value={value}
                              isMobile
                              alignInputToBottom
                              children={renderControl()}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : cfg.description ? (
                  <div className="p-6">
                    <p className="text-[#032D60] text-sm leading-relaxed">{cfg.description}</p>
                  </div>
                ) : null}
                <div
                  className="mt-4 rounded-b-xl"
                  style={{
                    height: 35,
                    background: DATA360_ACCENT_COLOR,
                    boxShadow: '0 4px 12px rgba(0, 51, 153, 0.15)',
                  }}
                />
              </div>
            )}
          </section>
        );
      })}

      <DeleteConfirmationModal
        open={deleteConfirmUseCaseId !== null}
        onClose={() => setDeleteConfirmUseCaseId(null)}
        onConfirm={() => {
          if (deleteConfirmUseCaseId) {
            onDeleteUseCase?.(deleteConfirmUseCaseId);
            setDeleteConfirmUseCaseId(null);
          }
        }}
      />
    </div>
  );
};
