import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageTopBackground } from '../PageTopBackground';
import { ProductIconPdf } from '../ProductIconPdf';
import { ReportHeader } from '../ReportHeader';
import { FormulaKeysCard } from '../FormulaKeysCard';
import { formatPrice } from '../reportStyles';
import { getText } from '../../../utils/textUtils';
import type { EstimationReportData } from '../estimationReportData';
import type { Data360 } from '@sfdc/eaas/sdk';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#032D60' },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#0B5CAB', marginBottom: 12, marginTop: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 16 },
  useCaseSection: { marginBottom: 16 },
  useCaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  useCaseName: { fontSize: 14, fontWeight: 600, color: '#022AC0' },
  useCasePrice: { fontSize: 12, fontWeight: 'bold', color: '#032D60' },
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
});

function getFormulaParts(useCase?: Data360.UseCase): string[] {
  if (!useCase?.inputs?.length) return [];
  return useCase.inputs.map((i) => (i.label && i.label !== '' ? i.label : (i.key ?? (i as { inputKey?: string }).inputKey ?? '')));
}

interface Data360UseCasePageProps {
  data: EstimationReportData;
}

export const Data360UseCasePage: React.FC<Data360UseCasePageProps> = ({ data }) => {
  const configs = data.data360UseCaseConfigs ?? [];

  return (
    <Page size="A4" style={styles.page}>
      <PageTopBackground />
      <ReportHeader subtitle={getText('calc_data360_formulas')} />
      <View style={styles.titleRow}>
        <ProductIconPdf type="data360" size={20} />
        <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>
          {getText('calc_data360_formulas')}
        </Text>
      </View>

      {configs.map((cfg) => {
        const parts = getFormulaParts(cfg.useCase);
        return (
          <View key={cfg.useCaseId} style={styles.useCaseSection}>
            <View style={styles.useCaseHeader}>
              <Text style={styles.useCaseName}>{cfg.title}</Text>
              <Text style={styles.useCasePrice}>
                {cfg.credits != null ? `${(cfg.credits ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} credits` : ''}{' '}
                {formatPrice(cfg.price)}
              </Text>
            </View>
            <View style={styles.formulaBox}>
              <Text style={styles.formulaLabel}>Formulas</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text style={[styles.formulaText, { marginRight: 4 }]}>Total Dataset:</Text>
                {parts.length > 0 ? (
                  parts.map((part, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <Text style={[styles.formulaText, { marginHorizontal: 4 }]}>×</Text>}
                      <View style={styles.formulaBoxItem}>
                        <Text style={styles.formulaBoxItemText}>{part}</Text>
                      </View>
                    </React.Fragment>
                  ))
                ) : (
                  <Text style={styles.formulaText}>—</Text>
                )}
              </View>
            </View>
          </View>
        );
      })}

    </Page>
  );
};
