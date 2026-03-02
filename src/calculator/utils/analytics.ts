const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export function initGA(): void {
  if (!MEASUREMENT_ID || import.meta.env.DEV) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  window.gtag = function gtag() {
    dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);
}

export interface TrackContentClickParams {
  bladeName: string;
  moduleName: string;
  linkText: string;
  linkType?: string;
  modulePosition?: string;
  moduleType?: string;
  bladePosition?: string;
}

export function trackContentClick(params: TrackContentClickParams): void {
  if (typeof window.gtag !== "function") return;
  const { bladeName, moduleName, linkText, linkType = "button", modulePosition = "1", moduleType = "ux control", bladePosition = "1" } = params;
  window.gtag("event", "custEv_contentClick", {
    blade: {
      id: "",
      name: bladeName,
      position: bladePosition,
      source: "www",
      variant: "",
      type: "blade",
      module: {
        id: "",
        name: moduleName,
        type: moduleType,
        position: modulePosition,
        link: {
          text: linkText,
          url: "",
          type: linkType,
          internalDriver: "",
        },
      },
    },
  });
}
