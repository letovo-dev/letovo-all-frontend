'use client';
import Footer from '@/shared/ui/footer/Footer';
import style from './page.module.scss';
import { useEffect, useRef } from 'react';
import dataStore from '@/shared/stores/data-store';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const layoutRef = useRef<HTMLDivElement>(null);
  const { isFooterHidden, setFooterHidden, toggleFooter } = dataStore();
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const updateVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const handleScroll = () => {
      if (layoutRef.current) {
        const currentScrollTop = layoutRef.current.scrollTop;

        if (currentScrollTop > lastScrollTop.current && currentScrollTop > 50) {
          setFooterHidden(true);
        } else if (currentScrollTop < lastScrollTop.current) {
          setFooterHidden(false);
        }

        lastScrollTop.current = currentScrollTop;
      }
    };

    updateVh();
    window.addEventListener('resize', updateVh);

    const layoutElement = layoutRef.current;
    if (layoutElement) {
      layoutElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('resize', updateVh);
      if (layoutElement) {
        layoutElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [setFooterHidden]);

  return (
    <>
      <div ref={layoutRef} className={style.layoutContainer}>
        <main className={style.content}>{children}</main>
        <footer
          className={`${style.footer} ${isFooterHidden ? style.footerHidden : ''}`}
          onClick={isFooterHidden ? toggleFooter : undefined}
        >
          <Footer />
        </footer>
      </div>
    </>
  );
}
