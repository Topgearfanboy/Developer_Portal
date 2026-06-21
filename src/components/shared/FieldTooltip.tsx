"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface FieldTooltipProps {
  text: string;
  position?: "top" | "bottom";
}

const TOOLTIP_WIDTH = 208; // w-52 = 13rem = 208px

export function FieldTooltip({ text, position = "top" }: FieldTooltipProps) {
  const [show, setShow] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!show || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.left;
    setAlignRight(spaceOnRight < TOOLTIP_WIDTH + 16);
  }, [show]);

  const verticalClass = position === "top" ? "bottom-6" : "top-6";
  const horizontalClass = alignRight ? "right-0" : "left-0";

  const arrowClass =
    position === "top"
      ? "absolute -bottom-1 w-2 h-2 bg-white border-r border-b border-border transform rotate-45"
      : "absolute -top-1 w-2 h-2 bg-white border-l border-t border-border transform rotate-45";
  const arrowAlignClass = alignRight ? "right-2" : "left-2";

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-text-muted hover:text-primary transition-colors"
        aria-label="Help"
      >
        <HelpCircle size={13} />
      </button>
      {show && (
        <div
          className={`absolute ${verticalClass} ${horizontalClass} w-52 bg-white text-text text-xs rounded-lg p-3 shadow-lg z-50 border border-border`}
        >
          {text}
          <div className={`${arrowClass} ${arrowAlignClass}`} />
        </div>
      )}
    </div>
  );
}
