import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { getText } from '../../../utils/textUtils';
import agentforcePng from '../../components/common/ui/Agentforce.png';
import data360Png from '../../components/common/ui/Data360.png';
import { PageTopBackground } from '../PageTopBackground';
import { PieChartPdf } from '../PieChartPdf';
import { ProductCardPdf } from '../ProductCardPdf';
import { ReportHeader } from '../ReportHeader';
import { SummaryCard } from '../SummaryCard';
import { formatCredits, formatCreditsValue, formatPrice } from '../reportStyles';
import type { EstimationReportData } from '../estimationReportData';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#032D60' },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#0B5CAB', marginBottom: 12, marginTop: 16 },
  sectionSubtitle: { fontSize: 10, color: '#706E6B', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  first_row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, fontWeight: 'bold'  },
  rowLabel: { color: '#032D60' },
  rowValue: { color: '#032D60' },
  cardsRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  bullet: { marginBottom: 6, fontSize: 10, color: '#032D60' },
  subtitle: { fontSize: 18, color: '#023248', fontWeight: 600 },
  detailColumns: { flexDirection: 'row', gap: 24, marginTop: 24, marginBottom: 0 },
  detailColumn: { width: 258 },
  detailTitle: { fontSize: 14, fontWeight: 600, color: '#022AC0', marginBottom: 4 },
  detailSubtitle: { fontSize: 10, fontWeight: 600, color: '#0A2636', marginBottom: 4 },
  detailBulletRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  detailBulletDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#000', marginRight: 8, marginTop: 5, flexShrink: 0 },
  detailBulletText: { flex: 1, fontSize: 10, color: '#0A2636', lineHeight: 1.5 },
});

interface OverviewPageProps {
  data: EstimationReportData;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ data }) => {
  const costPerCredit =
    data.totalCredits > 0 && data.totalPrice != null
      ? data.totalPrice / data.totalCredits
      : undefined;
  const totalForPie = data.productTotals.agentforcePrice + data.productTotals.data360Price;
  const agentforcePct = totalForPie > 0 ? Math.round((data.productTotals.agentforcePrice / totalForPie) * 100) : 50;
  const data360Pct = totalForPie > 0 ? Math.round((data.productTotals.data360Price / totalForPie) * 100) : 50;

  const data360Credits = Math.max(0, data.totalCredits - data.productTotals.agentforceCredits);
  const flexCreditsCost = Math.round(data.productTotals.data360Price * 0.7);
  const profilesCost = data.productTotals.data360Price - flexCreditsCost;
  const flexCreditsCredits = Math.round(data360Credits * 0.7);
  const profilesCredits = data360Credits - flexCreditsCredits;

  const showBothCards = data.product === 'both';

  return (
    <Page size="A4" style={styles.page}>
      <PageTopBackground />
      <ReportHeader subtitle="View your combined product pricing estimation for one year." />
      <SummaryCard data={data} />

      <View style={{ flexDirection: 'row', marginBottom: 16, gap: 24 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{getText('calc_overview')}</Text>
          <View style={[styles.first_row, { marginBottom: 2 }]}>
            <Text style={styles.rowLabel}>{getText('calc_total_price')}</Text>
            <Text style={styles.rowValue}>{formatPrice(data.totalPrice)}</Text>
          </View>
          <View style={[styles.row, { marginBottom: 2 }]}>
            <Text style={styles.rowLabel}>{getText('calc_total_credits')}</Text>
            <Text style={styles.rowValue}>{formatCredits(data.totalCredits)}</Text>
          </View>
          <View style={[styles.row, { marginBottom: 0 }]}>
            <Text style={styles.rowLabel}>{getText('calc_cost_per_credit')}</Text>
            <Text style={styles.rowValue}>{formatPrice(costPerCredit)}</Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', position: 'relative', width: 130, minHeight: 130, paddingTop: 16 }}>
          {data.product === 'both' && (
            <>
              <PieChartPdf
                data={[
                  { label: getText('calc_product_data360_name'), color: '#022ac0', percentage: data360Pct },
                  { label: getText('calc_product_agentforce_name'), color: '#00B3FF', percentage: agentforcePct },
                ]}
                size={100}
              />
              <View style={{ position: 'absolute', top: 16, left: 0, flexDirection: 'column', gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#022ac0' }} />
                  <Text style={[styles.sectionSubtitle, { marginBottom: 0 }]}>{getText('calc_product_data360_name')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00B3FF' }} />
                  <Text style={[styles.sectionSubtitle, { marginBottom: 0 }]}>Agentforce</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={showBothCards ? [styles.cardsRow, { marginTop: 12 }] : { marginTop: 12 }}>
        {(data.product === 'agentforce' || data.product === 'both') && (
          <ProductCardPdf
            icon={agentforcePng}
            title={getText('calc_product_agentforce_name')}
            headerLabels={[]}
            rows={[
              { label: 'Total Cost', values: [formatPrice(data.productTotals.agentforcePrice)], isTotalCost: true },
              { label: 'Included Credits with Agentforce 1 Edition', values: ['-'] },
            ]}
            fullWidth={!showBothCards}
          />
        )}
        {(data.product === 'data360' || data.product === 'both') && (
          <ProductCardPdf
            icon={data360Png}
            title={getText('calc_product_data360_name')}
            headerLabels={[getText('calc_flex_credits'), getText('calc_profiles')]}
            rows={[
              { label: getText('calc_total_cost'), values: [formatPrice(flexCreditsCost), formatPrice(profilesCost)], isTotalCost: true },
              { label: getText('calc_credits'), values: [formatCreditsValue(flexCreditsCredits), formatCreditsValue(profilesCredits)] },
            ]}
            fullWidth={!showBothCards}
          />
        )}
      </View>

      <View style={styles.detailColumns}>
        {(data.product === 'agentforce' || data.product === 'both') && (
          <View style={styles.detailColumn}>
            <Text style={styles.detailTitle}>{getText('calc_pdf_your_agentforce_cost')} {formatPrice(data.productTotals.agentforcePrice)}</Text>
            <Text style={styles.detailSubtitle}>{getText('calc_product_agentforce_description')}</Text>
            <View style={styles.detailBulletRow}>
              <View style={styles.detailBulletDot} />
              <Text style={styles.detailBulletText}>{getText('calc_pdf_agentforce_bullet1')}</Text>
            </View>
            <View style={styles.detailBulletRow}>
              <View style={styles.detailBulletDot} />
              <Text style={styles.detailBulletText}>{getText('calc_pdf_agentforce_bullet2')}</Text>
            </View>
            <View style={styles.detailBulletRow}>
              <View style={styles.detailBulletDot} />
              <Text style={styles.detailBulletText}>{getText('calc_pdf_agentforce_bullet3')}</Text>
            </View>
          </View>
        )}
        {(data.product === 'data360' || data.product === 'both') && (
          <View style={styles.detailColumn}>
            <Text style={styles.detailTitle}>{getText('calc_pdf_your_data360_cost')} {formatPrice(data.productTotals.data360Price)}</Text>
            <Text style={styles.detailSubtitle}>{getText('calc_product_data360_description')}</Text>
            <View style={styles.detailBulletRow}>
              <View style={styles.detailBulletDot} />
              <Text style={styles.detailBulletText}>{getText('calc_pdf_data360_bullet1')}</Text>
            </View>
            <View style={styles.detailBulletRow}>
              <View style={styles.detailBulletDot} />
              <Text style={styles.detailBulletText}>{getText('calc_pdf_data360_bullet2')}</Text>
            </View>
          </View>
        )}
      </View>

    </Page>
  );
};
