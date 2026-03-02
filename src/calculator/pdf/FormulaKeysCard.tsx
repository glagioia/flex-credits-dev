import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { getText } from '../../utils/textUtils';

const styles = StyleSheet.create({
  card: {
    width: 558,
    height: 75,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    borderBottomWidth: 3,
    borderBottomColor: '#0176D3',
  },
  title: { fontSize: 14, fontWeight: 'bold', color: '#0176D3', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, paddingRight: 16 },
  colLast: { flex: 1, paddingRight: 0 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#032D60', marginBottom: 4 },
  desc: { fontSize: 10, color: '#032D60' },
});

export interface FormulaKeysItem {
  label: string;
  description: string;
}

interface FormulaKeysCardProps {
  title?: string;
  items?: FormulaKeysItem[];
  style?: object;
}

function getDefaultItems(): FormulaKeysItem[] {
  return [
    { label: getText('calc_formula_keys_unified_profiles'), description: getText('calc_formula_keys_unified_profiles_desc') },
    { label: getText('calc_formula_keys_profiles'), description: getText('calc_formula_keys_profiles_desc') },
    { label: getText('calc_formula_keys_total_dataset'), description: getText('calc_formula_keys_total_dataset_desc') },
  ];
}

export const FormulaKeysCard: React.FC<FormulaKeysCardProps> = ({
  title = getText('calc_formula_keys'),
  items,
  style,
}) => {
  const list = items ?? getDefaultItems();
  return (
  <View style={[styles.card, style]}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.row}>
      {list.map((item, i) => (
        <View key={i} style={i === list.length - 1 ? styles.colLast : styles.col}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
      ))}
    </View>
  </View>
  );
};
