import React, { useMemo } from 'react';
import { computePieSlices, getLabelColorForSlice, type Slice } from '../../utils/pieChartUtils';
import { getText } from '../../../utils/textUtils';

interface PieChartProps {
  data: Slice[];
  size?: number;
  /** Si true, muestra la leyenda (círculo + nombre) en la esquina superior izquierda según Figma */
  showLegend?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ data, size = 240, showLegend = true }) => {
  const { slices, canvasSize } = useMemo(() => computePieSlices(data, size), [data, size]);
  const minAngleToShowLabel = 15;

  return (
    <div className="flex items-start">
      {showLegend && data.length > 0 && (
        <div
          className="flex shrink-0 flex-col gap-2 pt-5 text-xs font-medium text-[#032D60]"
          aria-hidden
        >
          {data.map((d, i) => (
            <div key={`${d.label}-${i}`} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      )}
      <svg
        width={canvasSize}
        height={canvasSize}
        viewBox={`0 0 ${canvasSize} ${canvasSize}`}
        role="img"
        aria-label={getText("calc_pie_chart_aria_label")}
        className="overflow-visible shrink-0"
      >
        {slices.map(({ d, pathData, labelPos, fontSize, angle }, i) => (
          <g key={`${d.label}-${i}`} className="transition-all duration-300 ease-in-out">
            <title>{`${d.label}: ${Math.ceil(d.percentage)}%`}</title>
            <path
              d={pathData}
              fill={d.color}
              className="hover:opacity-80 transition-opacity cursor-default"
            />
            {angle >= minAngleToShowLabel && (
              <text
                x={labelPos.x}
                y={labelPos.y}
                fill={getLabelColorForSlice(d.color)}
                className="pointer-events-none select-none"
                fontSize={fontSize}
                fontWeight={700}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {`${Math.ceil(d.percentage)}%`}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default PieChart;
export type { Slice };
