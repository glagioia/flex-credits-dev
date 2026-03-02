import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PageTopBackground } from '../PageTopBackground';
import { ReportHeader } from '../ReportHeader';
import { SummaryCard } from '../SummaryCard';
import { formatCredits, formatPrice } from '../reportStyles';
import { getText } from '../../../utils/textUtils';
import type { EstimationReportData } from '../estimationReportData';
import type { TemplateConfigSummary } from '../../types/EstimationSummary';
import agentforcePng from '../../components/common/ui/Agentforce.png';
import data360Png from '../../components/common/ui/Data360.png';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#032D60' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#032D60', marginTop: 0, marginBottom: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 16 },
  titleBorder: { borderBottomWidth: 1, borderBottomColor: '#D8E6F1', marginBottom: 12 },
  headerIcon: { width: 20, height: 20 },
  totalCostRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#eaf5fe',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 0,
    paddingLeft: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#D8E6F1',
  },
  col1: { width: '50%' },
  col2: { width: '25%', textAlign: 'right' },
  col3: { width: '25%', textAlign: 'right' },
  rowLabel: { color: '#032D60' },
  rowValue: { color: '#032D60', fontWeight: 'bold' },
  rowValueNormal: { color: '#032D60' },
  totalCostLabel: { color: '#0A2636', fontWeight: 700 },
  totalCostValue: { color: '#0A2636', fontWeight: 700 },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#032D60',
    marginTop: 16,
    marginBottom: 8,
  },
});

interface AgentforceOverviewPageProps {
  data: EstimationReportData;
}

function TemplateTableSection({
  configs,
  isEmployee,
}: {
  configs: TemplateConfigSummary[];
  isEmployee: boolean;
}) {
  if (configs.length === 0) return null;
  return (
    <>
      <Text style={styles.subsectionTitle}>
        {isEmployee
          ? 'Employee-facing Agents (Seat based)'
          : 'Customer-facing Agents (Consumption based)'}
      </Text>
      {isEmployee && (
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, styles.rowLabel]} />
          <Text style={[styles.col2, styles.rowLabel]}>{getText('calc_seats')}</Text>
          <Text style={[styles.col3, styles.rowLabel]}>{getText('calc_cost')}</Text>
        </View>
      )}
      {configs.map((cfg) => (
        <View key={cfg.template.id} style={styles.tableRow}>
          <Text style={styles.col1}>{cfg.template.displayName}</Text>
          <Text style={[styles.col2, styles.rowValueNormal]}>
            {isEmployee ? `${cfg.templateCredits} seats` : formatCredits(cfg.templateCredits)}
          </Text>
          <Text style={[styles.col3, styles.rowValueNormal]}>{formatPrice(cfg.templatePrice)}</Text>
        </View>
      ))}
    </>
  );
}

export const AgentforceOverviewPage: React.FC<AgentforceOverviewPageProps> = ({ data }) => {
  const headerIcon = data.product === 'data360' ? data360Png : agentforcePng;
  const customerConfigs = data.templateConfigs.filter(
    (c) => c.template.targetAudience === 'CUSTOMER'
  );
  const employeeConfigs = data.templateConfigs.filter(
    (c) => c.template.targetAudience === 'EMPLOYEE'
  );

  return (
    <Page size="A4" style={styles.page}>
      <PageTopBackground />
      <ReportHeader subtitle="Agentforce Overview" />
      <SummaryCard data={data} />
      <View style={styles.titleRow}>
        <Image src={headerIcon} style={styles.headerIcon} />
        <Text style={styles.sectionTitle}>Agentforce Overview</Text>
      </View>
      <View style={styles.titleBorder} />

      <View style={styles.tableHeader}>
        <Text style={[styles.col1, styles.rowLabel]} />
        <Text style={[styles.col2, styles.rowLabel]}>{getText('calc_flex_credits_label')}</Text>
        <Text style={[styles.col3, styles.rowLabel]}>{getText('calc_cost')}</Text>
      </View>

      <View style={styles.totalCostRow}>
        <Text style={[styles.col1, styles.totalCostLabel]}>{getText('calc_total_cost')}</Text>
        <Text style={[styles.col2, styles.totalCostValue]} />
        <Text style={[styles.col3, styles.totalCostValue]}>{formatPrice(data.productTotals.agentforcePrice)}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={[styles.col1, styles.rowLabel]}>{getText('calc_included_credits_agentforce')}</Text>
        <Text style={[styles.col2, styles.rowValueNormal]}>-</Text>
        <Text style={[styles.col3, styles.rowValueNormal]}>-</Text>
      </View>

      <TemplateTableSection configs={customerConfigs} isEmployee={false} />
      <TemplateTableSection configs={employeeConfigs} isEmployee={true} />
    </Page>
  );
};
