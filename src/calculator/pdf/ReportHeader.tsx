import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import salesforceLogo from '../components/common/ui/Logo.png';

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, color: '#022AC0', marginBottom: 4, fontWeight: 600 },
  subtitle: { fontSize: 18, color: '#023248', fontWeight: 600 },
  subtitle2: { fontSize: 12, color: '#023248', marginTop: 20, fontWeight: 400 },
});

interface ReportHeaderProps {
  subtitle?: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ subtitle }) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.title}>Flex Credit Pricing Calculator</Text>
      <Text style={styles.subtitle}>Combined product estimation Dashboard</Text>
      <Text style={styles.subtitle2}>View your combined product pricing estimation for one year</Text>
    </View>
    <Image src={salesforceLogo} style={{ width: 49, height: 45 }} />
  </View>
);
