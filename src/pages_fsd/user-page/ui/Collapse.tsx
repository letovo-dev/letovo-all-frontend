'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import style from './Collapse.module.scss';

interface CollapseProps {
  leftText: string;
  rightText: string;
  children: React.ReactNode;
  headerColor?: string;
  dotColor?: string;
  borderColor?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Collapse = ({
  leftText,
  rightText,
  children,
  headerColor,
  dotColor,
  borderColor,
  isOpen: controlledOpen,
  onToggle,
}: CollapseProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const toggle = isControlled ? onToggle! : () => setInternalOpen(prev => !prev);

  return (
    <div
      className={style.collapse}
      style={
        {
          '--collapse-header-bg': isOpen ? headerColor : undefined,
          '--collapse-dot-color': dotColor,
          '--collapse-header-border': isOpen
            ? `1px solid ${borderColor}`
            : '1px solid var(--border-grey)',
        } as React.CSSProperties
      }
    >
      <div className={style.collapseHeader}>
        <div className={style.collapseRight}>
          <span className={`${style.collapseDot} ${isOpen ? style.collapseDotActive : ''}`} />
          <p className={style.collapseRightText}>{rightText}</p>
        </div>
        <div className={style.collapseRight}>
          <p className={style.collapseLeftText}>{leftText}</p>
          <button
            type="button"
            className={style.collapseToggle}
            onClick={toggle}
            aria-label={isOpen ? 'Свернуть' : 'Развернуть'}
          >
            <Image
              src={isOpen ? '/26_collapse_open.svg' : '/26_collapse.svg'}
              alt=""
              height={15}
              width={15}
            />
          </button>
        </div>
      </div>
      {isOpen && <div className={style.collapseBody}>{children}</div>}
    </div>
  );
};

export default Collapse;
