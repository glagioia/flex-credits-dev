import React from "react";

interface CalculatorBackgroundProps {
  isExpanded?: boolean;
}

export function CalculatorBackground({ isExpanded = false }: CalculatorBackgroundProps) {
  // Collapsed: 1360 x 1073 content -> 1448 x 1143 viewBox (+50px total)
  // Expanded: 1360 x 1410 content -> 1448 x 1480 viewBox (+10px)
  const viewBoxHeight = isExpanded ? 1480 : 1143;
  const filterHeight = isExpanded ? 1479.46 : 1142.46;
  const gradientY2 = isExpanded ? 1420.89 : 1083.89;
  
  // Path coordinates for bottom curve
  const bottomY1 = isExpanded ? 1371.175 : 1034.175;
  const bottomY2 = isExpanded ? 1415.71 : 1078.71;
  const bottomY3 = isExpanded ? 1410.63 : 1073.63;
  const bottomY4 = isExpanded ? 1347.564 : 1010.564;
  
  // Stroke path coordinates
  const strokeBottomY1 = isExpanded ? 1371.175 : 1034.175;
  const strokeBottomY2 = isExpanded ? 1414.6 : 1077.6;
  const strokeBottomY3 = isExpanded ? 1409.65 : 1072.65;
  const strokeBottomY4 = isExpanded ? 1346.564 : 1009.564;

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none overflow-visible">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 1448 ${viewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ filter: 'drop-shadow(0px 24px 48px rgba(24, 24, 24, 0.20))' }}
      >
        <g filter="url(#filter0_d_2009_29498)">
          <path
            d={`M1404 ${bottomY1}C1404 ${bottomY2 - 19.01} 1380.39 ${bottomY2} 1355.36 ${bottomY3}C1151.28 ${bottomY4 + 21.704} 940.154 ${bottomY4} 724.002 ${bottomY4}C507.85 ${bottomY4} 296.724 ${bottomY4 + 21.703} 92.6464 ${bottomY3}C67.6128 ${bottomY2} 44.0019 ${bottomY2 - 19.01} 44.0019 ${bottomY1}L44.0001 60.2814C44 34.7387 67.611 15.7502 92.6447 20.8243C296.722 62.1893 507.848 83.8938 724 83.8938C940.152 83.8938 1151.28 62.1893 1355.36 20.8243C1380.39 15.7502 1404 34.7386 1404 60.2813L1404 ${bottomY1}Z`}
            fill="url(#paint0_linear_2009_29498)"
            fillOpacity="0.8"
          />
          <path
            d={`M1355.55 21.8048C1379.98 16.854 1403 35.3819 1403 60.2814L1403 ${strokeBottomY1}C1403 ${strokeBottomY2 - 18.07} 1379.98 ${strokeBottomY2} 1355.56 ${strokeBottomY3}C1151.41 ${strokeBottomY4 + 21.711} 940.221 ${strokeBottomY4} 724.002 ${strokeBottomY4}C507.783 ${strokeBottomY4} 296.59 ${strokeBottomY4 + 21.71} 92.4482 ${strokeBottomY3}C68.0232 ${strokeBottomY2} 45.002 ${strokeBottomY2 - 18.07} 45.002 ${strokeBottomY1}L45 60.2814C45 35.3819 68.0212 16.854 92.4463 21.8048C296.588 63.1829 507.781 84.8937 724 84.8937C940.219 84.8937 1151.41 63.183 1355.55 21.8048Z`}
            stroke="url(#paint1_linear_2009_29498)"
            strokeWidth="2"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_2009_29498"
            x="0"
            y="0"
            width="1448"
            height={filterHeight}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology
              radius="4"
              operator="erode"
              in="SourceAlpha"
              result="effect1_dropShadow_2009_29498"
            />
            <feOffset dy="24" />
            <feGaussianBlur stdDeviation="24" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.0941176 0 0 0 0 0.0941176 0 0 0 0 0.0941176 0 0 0 0.2 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_2009_29498"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2009_29498"
              result="shape"
            />
          </filter>
          <linearGradient
            id="paint0_linear_2009_29498"
            x1="724.001"
            y1="10.5636"
            x2="724.001"
            y2={gradientY2}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#90D0FE" />
            <stop offset="1" stopColor="#EAF5FE" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2009_29498"
            x1="724.001"
            y1="10.5636"
            x2="724.001"
            y2={gradientY2}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0.25" />
            <stop offset="0.490385" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="white" stopOpacity="0.25" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
