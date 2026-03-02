import type { Agentforce } from '@sfdc/eaas/sdk';

export interface TemplateConfigSummary {
  template: Agentforce.Template;
  topics: Agentforce.Topic[];
  topicCredits: Record<string, number>;
  topicPrices: Record<string, number>;
  /** Template-level credits from BE (respects selected topics). */
  templateCredits: number;
  /** Template-level price from BE (respects selected topics). */
  templatePrice: number;
  /** Topic id -> true when toggled off in Configure. Restored when re-entering STEP_CONFIGURE. */
  disabledTopics?: Record<string, boolean>;
  /** Input values per topic (topicId -> inputKey -> value) from STEP_CONFIGURE, for FinalEstimationStep. */
  topicInputValues?: Record<string, Record<string, number>>;
  /** Seat-based (employee) template: seats from BE. */
  templateSeats?: number;
  /** Seat-based (employee) template: gating SKU id from BE. */
  gatingSkuId?: string | null;
}

export interface EstimationSummary {
  templateConfigs: TemplateConfigSummary[];
  totalCredits: number;
  totalPrice?: number;
}
