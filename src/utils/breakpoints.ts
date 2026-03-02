/**
 * Breakpoints Configuration
 * These values can be adjusted based on design requirements.
 * 
 * Usage with Tailwind CSS prefixes:
 * - Mobile first approach (default styles are for mobile)
 * - md: applies from 768px and up (Tablet)
 * - lg: applies from 1024px and up (Desktop)
 */

export const BREAKPOINTS = {
  md: 768,   // Mobile to Tablet transition
  lg: 1024,  // Tablet to Desktop transition
} as const;

/**
 * Media query strings for use in JavaScript/CSS-in-JS
 */
export const MEDIA_QUERIES = {
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
} as const;

/**
 * Responsive values helper type
 * Use this to define values that change at different breakpoints
 */
export interface ResponsiveValue<T> {
  base: T;      // Mobile (default)
  md?: T;       // 768px+ (Tablet)
  lg?: T;       // 1024px+ (Desktop)
}

/**
 * Typography sizes for different screen sizes
 * Format: [mobile, tablet (md), desktop (lg)]
 */
export const TYPOGRAPHY = {
  hero: {
    title: {
      fontSize: ['32px', '44px', '56px'],      // mobile, md, lg
      lineHeight: ['40px', '52px', '64px'],
    },
    subtitle: {
      fontSize: ['24px', '32px', '40px'],
      lineHeight: ['32px', '40px', '48px'],
    },
    description: {
      fontSize: ['16px', '18px', '20px'],
      lineHeight: ['24px', '28px', '30px'],
    },
  },
  section: {
    title: {
      fontSize: ['20px', '22px', '24px'],
      lineHeight: ['28px', '30px', '32px'],
    },
  },
  card: {
    label: {
      fontSize: ['14px', '15px', '16px'],
      lineHeight: ['18px', '19px', '20px'],
    },
  },
} as const;

/**
 * Spacing values for different screen sizes
 * Format: [mobile, tablet (md), desktop (lg)]
 */
export const SPACING = {
  container: {
    paddingX: ['16px', '24px', '40px'],
    paddingY: ['24px', '32px', '48px'],
  },
  section: {
    gap: ['32px', '40px', '48px'],
  },
  cards: {
    gap: ['16px', '24px', '36px'],
    rowGap: ['16px', '24px', '32px'],
  },
} as const;

/**
 * Card dimensions for different screen sizes
 */
export const CARD_SIZES = {
  industry: {
    width: ['calc(50% - 8px)', '160px', '200px'],   // 2 columns on mobile
    height: ['100px', '110px', '120px'],
  },
  companySize: {
    width: ['calc(50% - 8px)', '180px', '200px'],
    height: ['100px', '110px', '120px'],
  },
} as const;

/**
 * Number of visible items before "Show more"
 */
export const VISIBLE_ITEMS = {
  industries: {
    mobile: 6,    // 3 rows of 2
    tablet: 8,    // 2 rows of 4
    desktop: 10,  // 2 rows of 5
  },
} as const;
