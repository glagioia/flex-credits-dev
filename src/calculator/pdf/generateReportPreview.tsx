import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { EstimationReportDocument } from './EstimationReportDocument';
import { parseEstimationReportData } from './estimationReportData';
import type { Estimation, Agentforce, Data360 } from '@sfdc/eaas/sdk';

export interface GenerateReportPreviewParams {
  estimation: Estimation | null | undefined;
  templates: Agentforce.Template[];
  templateTopics: Record<string, Agentforce.Topic[]>;
  useCases: Data360.UseCase[];
  meters?: Data360.Meter[];
  excludedFromCalculationsTemplateIds?: Set<string>;
}

/**
 * Generates the estimation report PDF and opens it in a new tab.
 */
export async function generateReportPreview(params: GenerateReportPreviewParams): Promise<void> {
  const { estimation, templates, templateTopics, useCases, meters, excludedFromCalculationsTemplateIds } = params;

  const data = parseEstimationReportData(
    estimation,
    templates,
    templateTopics,
    useCases,
    excludedFromCalculationsTemplateIds,
    meters
  );

  const blob = await pdf(<EstimationReportDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

/**
 * Generates the PDF from pre-parsed data. Use for dev testing without going through the full flow.
 */
export async function generateReportPreviewFromData(
  data: Parameters<typeof EstimationReportDocument>[0]['data']
): Promise<void> {
  const blob = await pdf(<EstimationReportDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
