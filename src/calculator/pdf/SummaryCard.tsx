import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { formatCreditsValue, formatPriceValue } from './reportStyles';
import type { EstimationReportData } from './estimationReportData';
import rocketPng from '../components/home/ui/assets/Rocket.png';
import agentforcePng from '../components/common/ui/Agentforce.png';
import data360Png from '../components/common/ui/Data360.png';
import rectanglePng from '../components/common/ui/Rectangle.png';

interface SummaryCardProps {
  data: EstimationReportData;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  bannerContainer: {
    width: 551,
    height: 63,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  bannerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 551,
    height: 63,
    objectFit: 'cover',
  },
  // Sistema de 4 columnas (25% cada una)
  column: {
    width: '25%',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  // Columna 1: Cohete y Título
  col1: {
    paddingLeft: 45, // Espacio para que el cohete no tape el texto
  },
  rocketImage: {
    position: 'absolute',
    left: -30,
    top: 2,
    width:67, // Proporcional a los 63px de alto
    height: 67,
  },
  titleText: {
    color: '#00D1FF',
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 1.1,
  },
  // Columnas 2 y 3: Métricas
  colMetric: {
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
  },
  currency: {
    color: '#FFFFFF',
    fontSize: 10,
    marginRight: 1,
    fontWeight: 'bold',
  },
  valueMain: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'black',
  },
  valueUnit: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 2,
    fontWeight: 700,
  },
  subLabel: {
    color: '#FFFFFF',
    fontSize: 7,
    opacity: 0.9,
    marginTop: -2,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  // Columna 4: Productos
  colProducts: {
    paddingLeft: 20,
    gap: 4,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productIcon: {
    width: 10,
    height: 10,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'medium',
  }
});

export const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  return (
    <View style={styles.wrapper}>
    <View style={styles.bannerContainer}>
      <Image src={rectanglePng} style={styles.bannerBackground} />
      {/* Columna 1: Branding & Title */}
      <View style={[styles.column, styles.col1]}>
        <Image src={rocketPng} style={styles.rocketImage} />
        <Text style={styles.titleText}>Total 1 Year Estimate</Text>
      </View>

      {/* Columna 2: Credits */}
      <View style={[styles.column, styles.colMetric]}>
        <View style={styles.valueContainer}>
          <Text style={styles.valueMain}>
            {formatCreditsValue(data.totalCredits)}
            <Text style={styles.valueUnit}> Credits</Text>
          </Text>
        </View>
        <Text style={styles.subLabel}>Rounded up credits</Text>
      </View>

      {/* Columna 3: Price */}
      <View style={[styles.column, styles.colMetric]}>
        <View style={styles.valueContainer}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.valueMain}>{formatPriceValue(data.totalPrice)}</Text>
        </View>
        <Text style={styles.subLabel}>Estimated List Price</Text>
      </View>

      {/* Columna 4: Active Products */}
      <View style={[styles.column, styles.colProducts]}>
        {(data.product === 'agentforce' || data.product === 'both') && (
          <View style={styles.productRow}>
            <Image src={agentforcePng} style={styles.productIcon} />
            <Text style={styles.productName}>Agentforce</Text>
          </View>
        )}
        {(data.product === 'data360' || data.product === 'both') && (
          <View style={styles.productRow}>
            <Image src={data360Png} style={styles.productIcon} />
            <Text style={styles.productName}>Data 360</Text>
          </View>
        )}
      </View>
    </View>
    </View>
  );
};