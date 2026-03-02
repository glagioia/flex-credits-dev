export function formatCredits(n: number): string {
  if (n >= 1e6) return `${Math.round(n / 1e6)}M Credits`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k Credits`;
  return `${Math.round(n)} Credits`;
}

/** Solo el valor numérico formateado (1M, 1k, 100), sin "Credits" ni estilos. */
export function formatCreditsValue(n: number): string {
  if (n >= 1e6) return `${Math.round(n / 1e6)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return `${Math.round(n)}`;
}

export function formatPrice(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  if (n >= 1e6) return `$${Math.round(n / 1e6)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}k`;
  return `$${Math.round(n)}`;
}

/** Solo el valor numérico formateado (1M, 1k, 100), sin "$" ni estilos. */
export function formatPriceValue(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  if (n >= 1e6) return `${Math.round(n / 1e6)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return `${Math.round(n)}`;
}
