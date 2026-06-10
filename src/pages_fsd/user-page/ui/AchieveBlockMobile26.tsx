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
  return (
    <>
      {achievements.map(item => {
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
    </>
  );
};

export default memo(AchieveBlockMobile);
