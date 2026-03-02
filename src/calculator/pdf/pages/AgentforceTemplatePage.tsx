import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { Agentforce } from '@sfdc/eaas/sdk';
import { PageTopBackground } from '../PageTopBackground';
import { ReportHeader } from '../ReportHeader';
import { formatPrice } from '../reportStyles';
import { getFormulaChipLabels } from '../../components/common/TemplateConfig';
import type { TemplateConfigSummary } from '../../types/EstimationSummary';
import agentforcePng from '../../components/common/ui/Agentforce.png';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#032D60' },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#0B5CAB', marginBottom: 12, marginTop: 16 },
  sectionSubtitle: { fontSize: 12, color: '#023248', fontWeight: 400, marginBottom: 12 },
  topicSection: { marginBottom: 16 },
  topicTitle: { fontSize: 12, fontWeight: 'bold', color: '#032D60', marginTop: 12, marginBottom: 6 },
  bullet: { marginBottom: 6, fontSize: 10, color: '#032D60' },
  formulaBox: { backgroundColor: '#EAF5FE', padding: 12, borderRadius: 6, marginTop: 8, marginBottom: 12 },
  formulaLabel: { fontSize: 10, color: '#0176D3', marginBottom: 6 },
  formulaText: { fontSize: 9, color: '#032D60' },
  formulaBoxItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  formulaBoxItemText: { fontSize: 9, color: '#032D60' },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  templateName: { fontSize: 15, fontWeight: 600, color: '#022AC0' },
  rowValue: { color: '#032D60', fontWeight: 'bold' },
  headerIcon: { width: 20, height: 20 },
});

interface TemplateTopicSectionProps {
  topic: Agentforce.Topic;
  topicCredits: Record<string, number>;
  topicPrices: Record<string, number>;
  topicInputValues?: Record<string, Record<string, number>>;
  disabled?: boolean;
}

/** Returns input labels (from topic.inputs) for the Number of Credits line. Last element is the literal "# of credit per action" (no box). */
function getFormulaPartsForDisplay(topic: Agentforce.Topic): { inBox: string[]; suffix: string } {
  let labels = getFormulaChipLabels(topic);
  if (labels.length === 0 && topic.inputs?.length) {
    labels = topic.inputs.map((i) => (i.label != null && i.label !== '' ? i.label : i.key));
  }
  if (labels.length === 0) return { inBox: [], suffix: '' };
  return { inBox: labels, suffix: '# of credit per action' };
}

function TemplateTopicSection({
  topic,
  topicCredits,
  topicPrices,
  disabled,
}: TemplateTopicSectionProps) {
  const credits = disabled ? 0 : (topicCredits[topic.id] ?? topic.mostLikelyCredits ?? 0);
  const price = disabled ? 0 : (topicPrices[topic.id] ?? 0);
  const { inBox: formulaParts, suffix } = getFormulaPartsForDisplay(topic);

  return (
    <View style={styles.topicSection}>
      <Text style={styles.topicTitle}>{topic.displayName}</Text>
      <Text style={styles.bullet}>• {1} action, {credits} credits and $ {price} pricing</Text>
      <View style={styles.formulaBox}>
        <Text style={styles.formulaLabel}>Formulas</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          <Text style={[styles.formulaText, { marginRight: 4 }]}>Number of Credits:</Text>
          {formulaParts.length > 0 ? (
            <>
              {formulaParts.map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Text style={[styles.formulaText, { marginHorizontal: 4 }]}>X</Text>}
                  <View style={styles.formulaBoxItem}>
                    <Text style={styles.formulaBoxItemText}>{part}</Text>
                  </View>
                </React.Fragment>
              ))}
              {suffix && (
                <>
                  <Text style={[styles.formulaText, { marginHorizontal: 4 }]}>X</Text>
                  <Text style={styles.formulaText}>{suffix}</Text>
                </>
              )}
            </>
          ) : (
            <Text style={styles.formulaText}>—</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function EmployeeTemplateSection({
  template,
  templateCredits,
}: {
  template: Agentforce.Template;
  templateCredits: number;
}) {
  const isSeat = template.targetAudience === 'EMPLOYEE';
  return (
    <View style={styles.topicSection}>
      <Text style={styles.topicTitle}>{template.displayName}</Text>
      <Text style={styles.bullet}>• SKU type, {templateCredits} {isSeat ? 'seats' : 'credits'}</Text>
      <View style={styles.formulaBox}>
        <Text style={styles.formulaLabel}>Formulas</Text>
        <Text style={styles.formulaText}>
          {isSeat ? 'Cost: Number of seats X Cost per seat' : 'Number of Credits: —'}
        </Text>
      </View>
    </View>
  );
}

interface AgentforceTemplatePageProps {
  config: TemplateConfigSummary;
  totalAgentsCount: number;
}

export const AgentforceTemplatePage: React.FC<AgentforceTemplatePageProps> = ({ config, totalAgentsCount }) => (
  <Page size="A4" style={styles.page}>
    <PageTopBackground />
    <ReportHeader subtitle="Agentforce Templates" />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 16 }}>
      <Image src={agentforcePng} style={styles.headerIcon} />
      <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>Agentforce Templates</Text>
    </View>
    <Text style={styles.sectionSubtitle}>You added {totalAgentsCount} Agents:</Text>

    <View style={styles.templateHeader}>
      <Text style={styles.templateName}>{config.template.displayName}</Text>
      <Text style={styles.rowValue}>
        {config.template.targetAudience === 'EMPLOYEE'
          ? `${config.templateCredits} seats`
          : `${config.templateCredits} credits`}{' '}
        {formatPrice(config.templatePrice)}
      </Text>
    </View>

    {config.template.targetAudience === 'EMPLOYEE' ? (
      <EmployeeTemplateSection template={config.template} templateCredits={config.templateCredits} />
    ) : (
      config.topics
        .filter((topic) => config.disabledTopics?.[topic.id] === false)
        .map((topic) => (
          <TemplateTopicSection
            key={topic.id}
            topic={topic}
            topicCredits={config.topicCredits}
            topicPrices={config.topicPrices}
            topicInputValues={config.topicInputValues}
            disabled={false}
          />
        ))
    )}
  </Page>
);
