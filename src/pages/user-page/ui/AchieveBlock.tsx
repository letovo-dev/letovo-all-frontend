import { IUserAchData } from '@/shared/stores/user-store';
import React from 'react';
import style from './AchieveBlock.module.scss';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { calculateOpacity } from '@/shared/utils';
import { ImgWithBackground } from '@/shared/ui/image-background';

const AchieveBlock = ({
  achievements,
  openModal,
}: {
  achievements: IUserAchData[];
  openModal: (item: IUserAchData, opacity: number, activeIcon: boolean) => void;
}) => {
  return (
    <div className={style.achieveWrap}>
      {achievements.map(item => {
        const opacity = calculateOpacity(item.level, item.stages);
        console.log(item);

        console.log('opacity', opacity);

        const activeIcon = Boolean(item.stages);
        const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${item.achivement_pic}`;

        return (
          <div
            key={uuidv4()}
            className={style.item}
            onClick={() => openModal(item, opacity, activeIcon)}
          >
            {activeIcon ? (
              <>
                <ImgWithBackground
                  imgPath={imgPath}
                  size={60}
                  imgType={'avatar'}
                  opacity={opacity}
                />
                <p className={style.achTextActive}>{item.achivement_name}</p>
              </>
            ) : (
              <>
                <Image src="/Achievement_Closed.png" alt="" height={106} width={106} />
                <p className={style.achTextInactive}>{item.achivement_name}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AchieveBlock;
