import React from 'react';
import { Document } from '@react-pdf/renderer';
import {
  OverviewPage,
  AgentforceOverviewPage,
  AgentforceTemplatePage,
  Data360OverviewPage,
  Data360UseCasePage,
  LegalPage,
} from './pages';
import type { EstimationReportData } from './estimationReportData';

interface EstimationReportDocumentProps {
  data: EstimationReportData;
}

export const EstimationReportDocument: React.FC<EstimationReportDocumentProps> = ({ data }) => (
  <Document>
    <OverviewPage data={data} />

    {data.templateConfigs.length > 0 && <AgentforceOverviewPage data={data} />}

    {data.templateConfigs.map((config) => (
      <AgentforceTemplatePage
        key={config.template.id}
        config={config}
        totalAgentsCount={data.templateConfigs.length}
      />
    ))}

    {(data.product === 'data360' || data.product === 'both') && (
      <>
        <Data360OverviewPage data={data} />
        {(data.data360UseCaseConfigs?.length ?? 0) > 0 && <Data360UseCasePage data={data} />}
      </>
    )}

    <LegalPage data={data} />
  </Document>
);
