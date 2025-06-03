'use client';
import { IUserAchData } from '@/shared/stores/user-store';
import React, { memo, useEffect, useState } from 'react';
import styles from './AchieveBlockMobile.module.scss';
import { calculateOpacity } from '@/shared/utils';
import { generateKey } from '@/shared/api/utils';
import AchievementItem from './AchievementItem';

interface AchieveBlockMobileProps {
  achievements: IUserAchData[];
  openModal: (item: IUserAchData, opacity: number, activeIcon: boolean) => void;
}

const AchieveBlockMobile: React.FC<AchieveBlockMobileProps> = ({ achievements, openModal }) => {
  const [data, setData] = useState<IUserAchData[][]>([]);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setData([
        achievements.filter((_, i) => i % 3 === 0),
        achievements.filter((_, i) => i % 3 === 1),
        achievements.filter((_, i) => i % 3 === 2),
      ]);
    }
  }, [achievements]);

  return (
    <div className={styles.achContainer}>
      {/* Первая колонка */}
      <div className={styles.column}>
        {data[0]?.map(item => {
          const opacity = calculateOpacity(item.level, item.stages);
          const activeIcon = Boolean(item.stages);
          return (
            <AchievementItem
              key={generateKey()}
              item={item}
              onClick={() => openModal(item, opacity, activeIcon)}
              className={styles.item}
            />
          );
        })}
      </div>

      {/* Вторая колонка с дополнительным div */}
      <div className={styles.extraColumn}>
        <div className={styles.spacer} />
        {data[1]?.map(item => {
          const opacity = calculateOpacity(item.level, item.stages);
          const activeIcon = Boolean(item.stages);
          return (
            <AchievementItem
              key={generateKey()}
              item={item}
              onClick={() => openModal(item, opacity, activeIcon)}
              className={styles.item}
            />
          );
        })}
      </div>

      {/* Третья колонка */}
      <div className={styles.column}>
        {data[2]?.map(item => {
          const opacity = calculateOpacity(item.level, item.stages);
          const activeIcon = Boolean(item.stages);
          return (
            <AchievementItem
              key={generateKey()}
              item={item}
              onClick={() => openModal(item, opacity, activeIcon)}
              className={styles.item}
            />
          );
        })}
      </div>
    </div>
  );
};

export default memo(AchieveBlockMobile);
