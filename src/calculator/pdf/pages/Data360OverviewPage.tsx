import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PageTopBackground } from '../PageTopBackground';
import { ProductIconPdf } from '../ProductIconPdf';
import { ReportHeader } from '../ReportHeader';
import { SummaryCard } from '../SummaryCard';
import { formatPrice } from '../reportStyles';
import { getText } from '../../../utils/textUtils';
import type { EstimationReportData } from '../estimationReportData';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#032D60' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#032D60', marginTop: 0, marginBottom: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 16 },
  titleBorder: { borderBottomWidth: 1, borderBottomColor: '#D8E6F1', marginBottom: 12 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#D8E6F1',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
    backgroundColor: '#FAFAFA',
  },
  tableRowIndent: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 0,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  colLabel: { width: '50%' },
  colFlexOnly: { width: '25%', textAlign: 'right' },
  colProfilesFlex: { width: '25%', textAlign: 'right' },
  rowLabel: { color: '#032D60' },
  rowLabelMuted: { color: '#6B7280', fontSize: 10 },
  rowValue: { color: '#032D60', fontWeight: 'bold' },
  rowValueNormal: { color: '#032D60' },
});

interface Data360OverviewPageProps {
  data: EstimationReportData;
}

export const Data360OverviewPage: React.FC<Data360OverviewPageProps> = ({ data }) => {
  const breakdown = data.data360Breakdown;
  const visibleMeters =
    breakdown?.meters?.filter((m) => Math.round(m.flexOnlyPrice) > 0 || Math.round(m.profilesFlexPrice) > 0) ?? [];

  return (
    <Page size="A4" style={styles.page}>
      <PageTopBackground />
      <ReportHeader subtitle="Data 360 Overview" />
      <SummaryCard data={data} />

      <View style={styles.titleRow}>
        <ProductIconPdf type="data360" size={20} />
        <Text style={styles.sectionTitle}>{getText('calc_product_data360_name')} Overview</Text>
      </View>
      <View style={styles.titleBorder} />

      {breakdown ? (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.colLabel, styles.rowLabel]} />
            <Text style={[styles.colFlexOnly, styles.rowLabel]}>{getText('calc_flex_only')}</Text>
            <Text style={[styles.colProfilesFlex, styles.rowLabel]}>{getText('calc_profiles_and_flex')}</Text>
          </View>

          <View style={[styles.tableRow, { backgroundColor: '#eaf5fe' }]}>
            <Text style={[styles.colLabel, styles.rowLabel]}>{getText('calc_total_cost')}</Text>
            <Text style={[styles.colFlexOnly, styles.rowValue]}>{formatPrice(breakdown.flexOnlyCost)}</Text>
            <Text style={[styles.colProfilesFlex, styles.rowValue]}>{formatPrice(breakdown.totalCost)}</Text>
          </View>

          <View style={styles.tableRowAlt}>
            <Text style={[styles.colLabel, styles.rowLabel]}>{getText('calc_savings_from_volume')}</Text>
            <Text style={[styles.colFlexOnly, styles.rowValueNormal]}>—</Text>
            <Text style={[styles.colProfilesFlex, styles.rowValueNormal]}>—</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.colLabel, styles.rowLabel]}>{getText('calc_profiles')}</Text>
            <Text style={[styles.colFlexOnly, styles.rowValueNormal]}>{formatPrice(0)}</Text>
            <Text style={[styles.colProfilesFlex, styles.rowValueNormal]}>{formatPrice(breakdown.profilesCost)}</Text>
          </View>

          <View style={styles.tableRowAlt}>
            <Text style={[styles.colLabel, styles.rowLabel]}>{getText('calc_flex_credits_label')}</Text>
            <Text style={[styles.colFlexOnly, styles.rowValue]}>{formatPrice(breakdown.flexOnlyCost)}</Text>
            <Text style={[styles.colProfilesFlex, styles.rowValue]}>{formatPrice(breakdown.flexOnlyCost)}</Text>
          </View>

          {visibleMeters.length > 0 && (
            <>
              {visibleMeters.map((m, idx) => (
                <View key={m.meterId} style={idx % 2 === 0 ? styles.tableRowIndent : [styles.tableRowIndent, { backgroundColor: '#FAFAFA' }]}>
                  <Text style={[styles.colLabel, styles.rowLabelMuted]}>{m.meterName}</Text>
                  <Text style={[styles.colFlexOnly, styles.rowValueNormal]}>{formatPrice(m.flexOnlyPrice)}</Text>
                  <Text style={[styles.colProfilesFlex, styles.rowValueNormal]}>{formatPrice(m.profilesFlexPrice)}</Text>
                </View>
              ))}
            </>
          )}
        </>
      ) : (
        <View style={{ paddingVertical: 24 }}>
          <Text style={styles.rowLabel}>{getText('calc_no_data360_items_configured')}</Text>
        </View>
      )}
    </Page>
  );
};
