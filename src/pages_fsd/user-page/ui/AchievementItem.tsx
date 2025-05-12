'use client';
import { IUserAchData } from '@/shared/stores/user-store';
import React from 'react';
import styles from './AchieveBlockMobile.module.scss';
import Image from 'next/image';
import { calculateOpacity } from '@/shared/utils';
import { ImgWithBackground } from '@/shared/ui/image-background';
import { generateKey } from '@/shared/api/utils';

interface AchievementItemProps {
  item: IUserAchData;
  onClick: () => void;
  className: string;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ item, onClick, className }) => {
  if (!item) {
    return null;
  }
  const opacity = calculateOpacity(item.level, item.stages);
  const isActiveIcon = Boolean(item.stages);
  const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${item.achivement_pic}`;

  return (
    <div key={generateKey()} className={className} onClick={onClick}>
      {isActiveIcon ? (
        <>
          <ImgWithBackground imgPath={imgPath} size={60} imgType="avatar" opacity={opacity} />
          <p className={styles.achTextActive}>{item?.achivement_name}</p>
        </>
      ) : (
        <>
          <Image src="/Achievement_Closed.png" alt="" height={106} width={106} />
          <p className={styles.achTextInactive}>{item.achivement_name}</p>
        </>
      )}
    </div>
  );
};

export default AchievementItem;
