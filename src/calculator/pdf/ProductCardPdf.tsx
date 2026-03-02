import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  card: { backgroundColor: '#E8F4FC', padding: 10, borderRadius: 8, width: 265, height: 100 },
  cardFullWidth: { backgroundColor: '#E8F4FC', padding: 10, borderRadius: 8, marginBottom: 12, width: 265, height: 100 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  cardIcon: { width: 18, height: 18 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0A2636', marginBottom: 0, marginTop: 2 },
  table: { width: '100%', marginTop: 0 },
  tableHeader: { flexDirection: 'row', fontWeight: 'bold', fontSize: 9, color: '#0A2636', marginBottom: 2, height: 14, justifyContent: 'space-between' },
  tableHeaderLabel: { fontWeight: 'bold', fontSize: 9, color: '#0A2636' },
  tableRow: { flexDirection: 'row', fontSize: 10, color: '#0A2636', paddingVertical: 2, justifyContent: 'space-between' },
  colLabel: { width: '35%' },
  col2: { width: '32%', textAlign: 'right' as const },
  col3: { width: '33%', textAlign: 'right' as const },
  colLabelWide: { width: '65%' },
  colValue: { width: '35%', textAlign: 'right' as const },
  totalCostLabel: { color: '#0A2636', fontSize: 10, fontWeight: 700 },
  totalCostValue: { color: '#0A2636', fontWeight: 700 },
});

export interface ProductCardRow {
  label: string;
  values: string[];
  isTotalCost?: boolean;
}

interface ProductCardPdfProps {
  icon: string;
  title: string;
  headerLabels: string[];
  rows: ProductCardRow[];
  fullWidth?: boolean;
}

export const ProductCardPdf: React.FC<ProductCardPdfProps> = ({
  icon,
  title,
  headerLabels,
  rows,
  fullWidth = false,
}) => {
  const isTwoCols = headerLabels.length < 2;

  return (
    <View style={fullWidth ? styles.cardFullWidth : styles.card}>
      <View style={styles.cardHeader}>
        <Image src={icon} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={isTwoCols ? styles.colLabelWide : styles.colLabel}>{isTwoCols ? '\u00A0' : ''}</Text>
          {isTwoCols ? (
            <Text style={styles.colValue}>{'\u00A0'}</Text>
          ) : (
            <>
              <Text style={[styles.col2, styles.tableHeaderLabel]}>{headerLabels[0]}</Text>
              <Text style={[styles.col3, styles.tableHeaderLabel]}>{headerLabels[1]}</Text>
            </>
          )}
        </View>
        {rows.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[isTwoCols ? styles.colLabelWide : styles.colLabel, row.isTotalCost && styles.totalCostLabel]}>
              {row.label}
            </Text>
            {isTwoCols ? (
              <Text style={[styles.colValue, row.isTotalCost && styles.totalCostValue]}>{row.values[0] ?? ''}</Text>
            ) : (
              <>
                <Text style={[styles.col2, row.isTotalCost && styles.totalCostValue]}>{row.values[0] ?? ''}</Text>
                <Text style={[styles.col3, row.isTotalCost && styles.totalCostValue]}>{row.values[1] ?? ''}</Text>
              </>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};
