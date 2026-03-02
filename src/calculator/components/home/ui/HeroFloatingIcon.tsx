import { useState, useEffect } from "react";
import iconPng from "./assets/icon.png";

function getRightPosition(width: number): string {
  if (width > 1480) return "400px";
  if (width > 1280) return "200px";
  if (width > 1024) return "100px";
  if (width > 768) return "50px";
  return "20px";
}

export function HeroFloatingIcon({ isMobile = false }: { isMobile?: boolean }) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="absolute pointer-events-none"
      style={{
        width: isMobile ? "70px" : "101.698px",
        height: isMobile ? "68px" : "99.723px",
        right: getRightPosition(windowWidth),
        top: isMobile ? "130px" : "100px",
        transform: "rotate(9.396deg)",
        backgroundImage: `url(${iconPng})`,
        backgroundSize: "cover",
        backgroundPosition: "50%",
        backgroundRepeat: "no-repeat",
        filter: "brightness(120%) contrast(120%)",
      }}
    />
  );
}
