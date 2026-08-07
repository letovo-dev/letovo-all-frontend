'use client';

import React, {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import style from './ImageLightbox.module.scss';

type ImageLightboxProps = { src: string; alt: string; children: ReactNode };
type Transform = { scale: number; x: number; y: number };

const initialTransform: Transform = { scale: 1, x: 0, y: 0 };
const distance = (
  first: { clientX: number; clientY: number },
  second: { clientX: number; clientY: number },
) => Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);

const ImageLightbox = ({ src, alt, children }: ImageLightboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [transform, setTransform] = useState<Transform>(initialTransform);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{ distance: number; transform: Transform }>();
  const panRef = useRef<{ x: number; y: number; transform: Transform }>();

  const close = () => {
    setIsOpen(false);
    setTransform(initialTransform);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === dialogRef.current || document.activeElement === first)
    ) {
      event.preventDefault();
      last.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const onTouchStart = (event: ReactTouchEvent<HTMLImageElement>) => {
    if (event.touches.length === 2) {
      pinchRef.current = { distance: distance(event.touches[0], event.touches[1]), transform };
      panRef.current = undefined;
    } else if (event.touches.length === 1 && transform.scale > 1) {
      panRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, transform };
    }
  };

  const onTouchMove = (event: ReactTouchEvent<HTMLImageElement>) => {
    if (event.touches.length === 2 && pinchRef.current) {
      event.preventDefault();
      const scale = Math.min(
        4,
        Math.max(
          1,
          (pinchRef.current.transform.scale * distance(event.touches[0], event.touches[1])) /
            pinchRef.current.distance,
        ),
      );
      setTransform(current => (scale === 1 ? initialTransform : { ...current, scale }));
    } else if (event.touches.length === 1 && panRef.current) {
      event.preventDefault();
      setTransform({
        scale: panRef.current.transform.scale,
        x: panRef.current.transform.x + event.touches[0].clientX - panRef.current.x,
        y: panRef.current.transform.y + event.touches[0].clientY - panRef.current.y,
      });
    }
  };

  const onTouchEnd = () => {
    pinchRef.current = undefined;
    panRef.current = undefined;
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={style.trigger}
        onClick={() => setIsOpen(true)}
        aria-label={`Открыть изображение: ${alt}`}
      >
        {children}
      </button>
      {isOpen &&
        createPortal(
          <div className={style.overlay} onMouseDown={close}>
            <div
              ref={dialogRef}
              className={style.dialog}
              role="dialog"
              aria-modal="true"
              aria-label={`Просмотр изображения: ${alt}`}
              tabIndex={-1}
              onKeyDown={trapFocus}
              onMouseDown={event => event.stopPropagation()}
            >
              <div className={style.actions}>
                <a
                  href={src}
                  download
                  className={style.download}
                  aria-label="Скачать оригинал изображения"
                >
                  Скачать
                </a>
                <button
                  type="button"
                  className={style.close}
                  onClick={close}
                  aria-label="Закрыть просмотр изображения"
                >
                  ×
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className={style.image}
                style={{
                  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default ImageLightbox;
