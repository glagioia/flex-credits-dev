import type { Agentforce } from '@sfdc/eaas/sdk';
import type { EstimationReportData } from './estimationReportData';
import type { TemplateConfigSummary } from '../types/EstimationSummary';

const mockTopic: Agentforce.Topic = {
  id: 'topic-1',
  displayName: 'Topic Title',
  formula: '{profiles} × {pct} × {actions}',
  inputs: [
    { key: 'profiles', label: 'Profiles', dataType: 'NUMBER', config: { default: 200000 } },
    { key: 'pct', label: '% handled by Agentforce', dataType: 'PERCENT', config: { default: 70 } },
    { key: 'actions', label: '# of actions', dataType: 'NUMBER', config: { default: 200000 } },
  ],
  mostLikelyCredits: 20,
  minimumCredits: 10,
  maximumCredits: 50,
};

const mockTemplate: Agentforce.Template = {
  id: 'template-service-agent',
  displayName: 'Service Agent',
  description: 'Customer-facing agent',
  targetAudience: 'CUSTOMER',
  topics: [mockTopic],
};

const mockEmployeeTemplate: Agentforce.Template = {
  id: 'template-employee',
  displayName: 'Banking Employee Service Agent',
  description: 'Employee-facing agent',
  targetAudience: 'EMPLOYEE',
  topics: [],
};

export const mockReportData: EstimationReportData = {
  totalCredits: 75000,
  totalPrice: 195000,
  product: 'both',
  productTotals: {
    agentforcePrice: 120000,
    agentforceCredits: 50000,
    data360Price: 75000,
  },
  templateConfigs: [
    {
      template: mockTemplate,
      topics: [mockTopic],
      topicCredits: { 'topic-1': 180 },
      topicPrices: { 'topic-1': 2700 },
      templateCredits: 180,
      templatePrice: 2700,
      disabledTopics: {},
      topicInputValues: { 'topic-1': { profiles: 200000, pct: 70, actions: 200000 } },
    } as TemplateConfigSummary,
    {
      template: mockEmployeeTemplate,
      topics: [],
      topicCredits: {},
      topicPrices: {},
      templateCredits: 180,
      templatePrice: 2700,
      disabledTopics: {},
    } as TemplateConfigSummary,
  ],
  data360UseCaseConfigs: [
    {
      useCaseId: 'uc-1',
      title: 'Segment & Target Audiences',
      price: 2700,
      description: '200,000 segments, 70% handled by Agentforce, 4 key metrics to track.',
    },
  ],
  data360Breakdown: {
    totalCost: 75000,
    flexOnlyCost: 52500,
    profilesCost: 22500,
    savingsFromVolume: 0,
    flexCreditsTotal: 75000,
    meters: [
      { meterId: '1', meterName: 'Unstructured Processing', flexOnlyPrice: 84, profilesFlexPrice: 120 },
      { meterId: '2', meterName: 'Unification', flexOnlyPrice: 133822, profilesFlexPrice: 191175 },
    ],
  },
};
