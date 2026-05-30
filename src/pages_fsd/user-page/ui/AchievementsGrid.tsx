'use client';

import React, { useEffect, useRef, useState } from 'react';
import style from '../UserPage26.module.scss';
import { IUserAchData } from '@/shared/stores/user-store';
import AchieveBlock from './AchieveBlock';
import AchieveBlockMobile26 from './AchieveBlockMobile26';

const ACHIEVEMENTS_THUMB_SIZE = 22;

interface AchievementsGridProps {
  achievements: IUserAchData[];
}

const AchievementsGrid: React.FC<AchievementsGridProps> = ({ achievements }) => {
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const achievementsBlockRef = useRef<HTMLElement>(null);
  const achievementsScrollRef = useRef<HTMLDivElement>(null);
  const achievementsThumbRef = useRef<HTMLDivElement>(null);
  const [achievementsScrollbar, setAchievementsScrollbar] = useState<{
    top: number;
    height: number;
    thumbY: number;
    active: boolean;
  }>({ top: 0, height: 0, thumbY: 0, active: false });

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const list = achievementsScrollRef.current;
    const wrapper = achievementsBlockRef.current;
    if (!list || !wrapper) return;

    const update = () => {
      const listRect = list.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const top = listRect.top - wrapperRect.top + 10;
      const height = Math.max(0, wrapperRect.height - top - 10);
      const maxScroll = list.scrollHeight - list.clientHeight;
      const isActive = maxScroll > 1 && listRect.height > ACHIEVEMENTS_THUMB_SIZE;
      const maxThumbY = Math.max(0, height - ACHIEVEMENTS_THUMB_SIZE);
      const ratio = maxScroll > 0 ? list.scrollTop / maxScroll : 0;
      const thumbY = ratio * maxThumbY;
      setAchievementsScrollbar({ top, height, thumbY, active: isActive });
    };

    update();
    list.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(list);
    ro.observe(wrapper);
    window.addEventListener('resize', update);
    return () => {
      list.removeEventListener('scroll', update);
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [achievements, windowWidth]);

  const startAchievementsThumbDrag = (clientY: number) => {
    const list = achievementsScrollRef.current;
    const thumb = achievementsThumbRef.current;
    if (!list || !thumb) return;
    const maxScroll = list.scrollHeight - list.clientHeight;
    const maxThumbY = Math.max(0, achievementsScrollbar.height - ACHIEVEMENTS_THUMB_SIZE);
    if (maxScroll <= 0 || maxThumbY <= 0) return;
    const startY = clientY;
    const startThumbY = achievementsScrollbar.thumbY;
    const onMove = (y: number) => {
      const nextThumbY = Math.max(0, Math.min(maxThumbY, startThumbY + (y - startY)));
      list.scrollTop = (nextThumbY / maxThumbY) * maxScroll;
    };
    const onMouseMove = (ev: MouseEvent) => onMove(ev.clientY);
    const onTouchMove = (ev: TouchEvent) => onMove(ev.touches[0].clientY);
    const cleanup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', cleanup);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', cleanup);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', cleanup);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', cleanup);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openModal = (_item: IUserAchData, _opacity: number, _activeIcon: boolean) => {};

  return (
    <div className={style.achievementsBlockContainer}>
      <div className={style.titleInfo}>
        <h5 className={style.title}>Корпоративные достижения</h5>
        <div className={style.info}>
          <span className={style.a}>30</span>
          <span className={style.b}>/50</span>
        </div>
      </div>

      <section
        ref={achievementsBlockRef}
        aria-label="Достижения"
        className={style.achievementsBlock}
      >
        <div
          ref={achievementsScrollRef}
          className={`${style.achievementsScroll} ${
            achievementsScrollbar.active ? style.achievementsScrollFaded : ''
          }`}
        >
          {achievements &&
            achievements.length > 0 &&
            (windowWidth <= 960 ? (
              <AchieveBlockMobile26 achievements={achievements} openModal={openModal} />
            ) : (
              <div className={style.achieveBlockContainer}>
                <AchieveBlock achievements={achievements} openModal={openModal} />
              </div>
            ))}
        </div>
        <div
          className={`${style.achievementsScrollContainer} ${
            !achievementsScrollbar.active ? style.achievementsScrollContainerInactive : ''
          }`}
          style={{ top: achievementsScrollbar.top, height: achievementsScrollbar.height }}
          onClick={e => e.stopPropagation()}
        >
          <div className={style.achievementsScrollTrack} />
          <div
            ref={achievementsThumbRef}
            className={style.achievementsScrollThumb}
            style={{ transform: `translateY(${achievementsScrollbar.thumbY}px)` }}
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
              startAchievementsThumbDrag(e.clientY);
            }}
            onTouchStart={e => {
              e.stopPropagation();
              startAchievementsThumbDrag(e.touches[0].clientY);
            }}
          >
            <div className={style.achievementsScrollThumbDot} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AchievementsGrid;
