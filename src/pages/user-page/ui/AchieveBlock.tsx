import { IUserAchData } from '@/shared/stores/user-store';
import React from 'react';
import style from './AchieveBlock.module.scss';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

const AchieveBlock = ({
  achievements,
  openModal,
}: {
  achievements: IUserAchData[];
  openModal: (item: IUserAchData) => void;
}) => {
  return (
    <div className={style.achieveWrap}>
      {achievements.map(item => (
        <div key={uuidv4()} className={style.item} onClick={() => openModal(item)}>
          <Image
            className={style.itemImg}
            src="/Achievement_Closed.png"
            alt="sign"
            height={106}
            width={106}
          />
          <p className={style.achTextInactive}>{item.achivement_name}</p>
        </div>
      ))}
    </div>
  );
};

export default AchieveBlock;
