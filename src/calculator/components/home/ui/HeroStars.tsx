import React from "react";
import starIcon from "./assets/star.svg";

export function HeroStars({isMobile = false} : {isMobile?: boolean}) {
  return (
    <div className="absolute top-[-40px] right-[-10px] pointer-events-none">
      {/* Large Star */}
      <div 
        className="absolute"
        style={{
          width: "39.688px",
          height: "42.333px",
          aspectRatio: "15/16",
          backgroundImage: `url(${starIcon})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
          scale: isMobile ? "0.7" : "1",
          right: isMobile ? "-25px" : "0", 
          top: isMobile ? "25px" : "0" 
        }}
      />
      {/* Small Star */}
      <div 
        className="absolute"
        style={{
          width: "20.813px",
          height: "22.2px",
          aspectRatio: "15/16",
          backgroundImage: `url(${starIcon})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
          scale: isMobile ? "0.7" : "1",
          right: isMobile ? "6px" : "40px",
          top: isMobile ? "60px" : "24px"
        }}
      />
    </div>
  );
}
