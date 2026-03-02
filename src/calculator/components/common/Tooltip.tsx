import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  content: React.ReactNode;
  /** @default 'top' */
  position?: 'top' | 'bottom';
  /** Max width in px @default 300 */
  maxWidth?: number;
}

const ARROW_SIZE = 8;
const GAP = 6;
const BG_COLOR = '#16325C';
const ICON_BG_DEFAULT = '#9CA3AF';
const ICON_BG_HOVER = '#032D60';

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  maxWidth = 300,
}) => {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState(position);
  const [hovered, setHovered] = useState(false);

  const iconBg = hovered ? ICON_BG_HOVER : ICON_BG_DEFAULT;
  const portalContainer = useMemo(
    () => document.getElementById('react-external') ?? document.body,
    [],
  );

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const rect = trigger.getBoundingClientRect();
    const ttRect = tooltip.getBoundingClientRect();

    let top: number;
    let resolvedPos = position;

    if (position === 'top') {
      top = rect.top - ttRect.height - ARROW_SIZE - GAP;
      if (top < 4) {
        resolvedPos = 'bottom';
        top = rect.bottom + ARROW_SIZE + GAP;
      }
    } else {
      top = rect.bottom + ARROW_SIZE + GAP;
      if (top + ttRect.height > window.innerHeight - 4) {
        resolvedPos = 'top';
        top = rect.top - ttRect.height - ARROW_SIZE - GAP;
      }
    }

    let left = rect.left + rect.width / 2 - ttRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - ttRect.width - 8));

    setActualPosition(resolvedPos);
    setCoords({ top, left });
  }, [position]);

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [visible, updatePosition]);

  const arrowStyle: React.CSSProperties =
    actualPosition === 'top'
      ? {
          left: '50%',
          bottom: -ARROW_SIZE,
          transform: 'translateX(-50%)',
          borderLeft: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid transparent`,
          borderTop: `${ARROW_SIZE}px solid ${BG_COLOR}`,
        }
      : {
          left: '50%',
          top: -ARROW_SIZE,
          transform: 'translateX(-50%)',
          borderLeft: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid ${BG_COLOR}`,
        };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex cursor-pointer"
        onMouseEnter={() => { setVisible(true); setHovered(true); }}
        onMouseLeave={() => { setVisible(false); setHovered(false); }}
        onFocus={() => { setVisible(true); setHovered(true); }}
        onBlur={() => { setVisible(false); setHovered(false); }}
        tabIndex={0}
        role="button"
        aria-label="More info"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="flex-shrink-0 transition-colors duration-150"
        >
          <circle cx="9" cy="9" r="8" fill={iconBg} stroke="none" />
          <path
            d="M9 8V13M9 5.5V6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {visible &&
        content &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="pointer-events-none fixed z-[9999] rounded-lg px-4 py-3 text-sm leading-relaxed text-white font-sans shadow-lg"
            style={{
              backgroundColor: BG_COLOR,
              maxWidth,
              top: coords.top,
              left: coords.left,
            }}
          >
            {content}
            <span className="absolute" style={{ ...arrowStyle, width: 0, height: 0 }} />
          </div>,
          portalContainer,
        )}
    </>
  );
};

export default Tooltip;
