import React from 'react';
import { Page, Text, StyleSheet } from '@react-pdf/renderer';
import { getText } from '../../../utils/textUtils';
import { AgentforceFooter } from '../AgentforceFooter';
import { PageTopBackground } from '../PageTopBackground';
import { ReportHeader } from '../ReportHeader';
import { SummaryCard } from '../SummaryCard';
import type { EstimationReportData } from '../estimationReportData';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#032D60' },
  disclaimer: { fontSize: 12, color: '#001E5B', fontWeight: 400, lineHeight: 1.5, marginTop: 50, textAlign: 'justify' },
});

interface LegalPageProps {
  data: EstimationReportData;
}

export const LegalPage: React.FC<LegalPageProps> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <PageTopBackground />
    <ReportHeader subtitle="Legal" />
    <SummaryCard data={data} />
    <Text style={styles.disclaimer}>{getText("calc_legal_disclaimer")}</Text>
    <AgentforceFooter style={{ marginTop: 32 }} />
  </Page>
);
