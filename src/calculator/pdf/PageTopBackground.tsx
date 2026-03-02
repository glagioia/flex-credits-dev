import React from 'react';
import { View, Image, StyleSheet } from '@react-pdf/renderer';
import bgPng from '../components/common/ui/BG.png';

const PAGE_PADDING = 40;
const A4_WIDTH = 595;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: -PAGE_PADDING,
    left: -PAGE_PADDING,
    width: A4_WIDTH + PAGE_PADDING * 2,
    height: 120,
    zIndex: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

export const PageTopBackground: React.FC = () => (
  <View style={styles.wrapper}>
    <Image src={bgPng} style={styles.image} />
  </View>
);
