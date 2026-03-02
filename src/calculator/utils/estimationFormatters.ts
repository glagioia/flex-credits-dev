const DECIMALS_TO_SHOW = 1;

export function formatCredits(n: number, showSuffix: boolean = true): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}B ${showSuffix ? 'Credits' : ''}`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}M ${showSuffix ? 'Credits' : ''}`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}k ${showSuffix ? 'Credits' : ''}`;
  return `${n.toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')} ${showSuffix ? 'Credits' : ''}`;
}

export function formatPrice(n: number | undefined | null, showSuffix: boolean = true, showCurrency: boolean = true): string {
  if (n === undefined || n === null) return '—';
  if (n >= 1e9) return `${showCurrency ? '$' : ''}${(n / 1e9).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}B`;
  if (n >= 1e6) return `${showCurrency ? '$' : ''}${(n / 1e6).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}M`;
  if (n >= 1e3) return `${showCurrency ? '$' : ''}${(n / 1e3).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}k`;
  return `${showCurrency ? '$' : ''}${n.toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}`;
}

/** Format credits as abbreviated number only (e.g., "3.25M", "5.5k", "500"). Shows up to 2 decimals, removing trailing zeros. */
export function formatCreditsShort(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}k`;
  return `${n.toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}`;
}

/** Format price as abbreviated number only without $ (e.g., "2.5M", "12.25k", "500") */
export function formatPriceShort(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}k`;
  return `${n.toFixed(DECIMALS_TO_SHOW).replace(/\.?0+$/, '')}`;
}

/** Parts for credits KPI: main number, suffix (M/k), and unit label. For Figma-style two-tone display. */
export function getCreditsDisplayParts(n: number | null | undefined): { main: string; suffix: string; unit: string } {
  if (n === undefined || n === null) return { main: '—', suffix: '', unit: '' };
  const short = formatCreditsShort(n);
  const match = short.match(/^(.+?)([Mk])$/);
  if (match) return { main: match[1], suffix: match[2], unit: 'Credits' };
  return { main: short, suffix: '', unit: 'Credits' };
}

/** Parts for price KPI: currency symbol ("$"), main number without $, suffix ("k" or "M"). For Figma: $ small top-left, number+suffix with gradient. */
export function getPriceDisplayParts(n: number | null | undefined): { currencySymbol: string; main: string; suffix: string } {
  const s = formatPrice(n, false);
  if (s === '—') return { currencySymbol: '', main: '—', suffix: '' };
  const match = s.match(/^\$(.*?)([Mk])$/);
  if (match) return { currencySymbol: '$', main: match[1], suffix: match[2] };
  const noDollar = s.replace(/^\$/, '');
  return { currencySymbol: '$', main: noDollar, suffix: '' };
}
