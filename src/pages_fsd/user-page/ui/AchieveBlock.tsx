'use client';
import { IUserAchData } from '@/shared/stores/user-store';
import React, { memo } from 'react';
import styles from './AchieveBlock.module.scss';
import Image from 'next/image';
import { calculateOpacity } from '@/shared/utils';
import { ImgWithBackground } from '@/shared/ui/image-background';
import { generateKey } from '@/shared/api/utils';

interface AchieveBlockProps {
  achievements?: IUserAchData[];
  openModal: (item: IUserAchData, opacity: number, activeIcon: boolean) => void;
}

const AchieveBlock: React.FC<AchieveBlockProps> = ({ achievements, openModal }) => {
  if (!achievements || achievements.length === 0) {
    return <div>Нет достижений</div>;
  }
  return (
    <div className={styles.achieveWrap}>
      {achievements.map(item => {
        const opacity = calculateOpacity(item.level, item.stages);
        const activeIcon = Boolean(item.stages);
        const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA || 'https://localhost/api/media/get'}${item.achivement_pic}`;

        return (
          <div
            key={generateKey()}
            className={styles.item}
            onClick={() => openModal(item, opacity, activeIcon)}
          >
            {activeIcon ? (
              <>
                <ImgWithBackground imgPath={imgPath} size={60} imgType="avatar" opacity={opacity} />
                <p className={styles.achTextActive}>{item.achivement_name}</p>
              </>
            ) : (
              <>
                <Image src="/Achievement_Closed.png" alt="" height={106} width={106} />
                <p className={styles.achTextInactive}>{item.achivement_name}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default memo(AchieveBlock);
