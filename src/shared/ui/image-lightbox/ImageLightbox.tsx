'use client';
import React, { type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import style from './ImageLightbox.module.scss';
type ImageLightboxProps = { src: string; alt: string; children: ReactNode };
const ImageLightbox = ({ src, alt, children }: ImageLightboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = () => { setIsOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()); };
  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [isOpen]);
  return <>
    <button ref={triggerRef} type="button" className={style.trigger} onClick={() => setIsOpen(true)} aria-label={`Открыть изображение: ${alt}`}>{children}</button>
    {isOpen && createPortal(<div className={style.overlay} onMouseDown={close}><div ref={dialogRef} className={style.dialog} role="dialog" aria-modal="true" aria-label={`Просмотр изображения: ${alt}`} tabIndex={-1} onKeyDown={trapFocus} onMouseDown={event => event.stopPropagation()}><div className={style.actions}><a href={src} download className={style.download} aria-label="Скачать оригинал изображения">Скачать</a><button type="button" className={style.close} onClick={close} aria-label="Закрыть просмотр изображения">×</button></div>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt={alt} className={style.image} /></div></div>, document.body)}
  </>;
};
export default ImageLightbox;
