import React, { useMemo } from 'react';
import { View, Svg, Path, Text, StyleSheet } from '@react-pdf/renderer';
import { computePieSlices, getLabelColorForSlice, type Slice } from '../utils/pieChartUtils';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface PieChartPdfProps {
  data: Slice[];
  size?: number;
}

export const PieChartPdf: React.FC<PieChartPdfProps> = ({ data, size = 120 }) => {
  const { slices, canvasSize } = useMemo(() => computePieSlices(data, size), [data, size]);

  return (
    <View style={styles.container}>
      <Svg width={canvasSize} height={canvasSize} viewBox={`0 0 ${canvasSize} ${canvasSize}`}>
        {slices.map(({ d, pathData, labelPos, fontSize }, i) => (
          <React.Fragment key={`${d.label}-${i}`}>
            <Path d={pathData} fill={d.color} />
            <Text
              x={labelPos.x}
              y={labelPos.y}
              fill={getLabelColorForSlice(d.color)}
              fontSize={fontSize}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {`${Math.round(d.percentage)}%`}
            </Text>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};
