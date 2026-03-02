import React from "react";
import bomb from "./assets/bomb.svg";
import pinkStar from "./assets/pink_star.svg";

interface FormDetailsProps {
  isExpanded: boolean;
}

export function FormDetails({ isExpanded }: FormDetailsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      {/* Blue Glow - behind bomb */}
      <div
        className="absolute"
        style={{
          width: "237.318px",
          height: "236.586px",
          right: "-40px",
          bottom: "60px",
          opacity: 0.9,
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="100%" 
          height="100%" 
          viewBox="0 0 238 237" 
          fill="none"
        >
          <g filter="url(#filter0_f_glow)">
            <ellipse cx="118.659" cy="118.293" rx="78.6588" ry="78.2929" fill="#00B3FF"/>
          </g>
          <defs>
            <filter id="filter0_f_glow" x="0" y="0" width="237.318" height="236.586" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="20" result="effect1_foregroundBlur"/>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Bomb (Blue Character) - bottom right corner */}
      <div 
        className="absolute"
        style={{
          width: "180.412px",
          height: "192.44px",
          backgroundImage: `url(${bomb})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
          borderRadius: "8.278px",
          right: "-15px",
          bottom: "85px",
        }}
      />

      {/* Pink Star 1 (Large) - next to bomb */}
      <div 
        className="absolute"
        style={{
          width: "76px",
          height: "81.067px",
          backgroundImage: `url(${pinkStar})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
          right: "-50px",
          bottom: "20px",
        }}
      />

      {/* Pink Star 2 (Small) - on the cloud */}
      <div 
        className="absolute"
        style={{
          width: "23.903px",
          height: "25.497px",
          transform: "rotate(5.241deg)",
          backgroundImage: `url(${pinkStar})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
          right: "25px",
          bottom: "10px",
        }}
      />
    </div>
  );
}
