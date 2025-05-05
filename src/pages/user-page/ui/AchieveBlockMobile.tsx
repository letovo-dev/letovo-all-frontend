import { IUserAchData } from '@/shared/stores/user-store';
import React, { useEffect, useState } from 'react';
import style from './AchieveBlockMobile.module.scss';
import { v4 as uuidv4 } from 'uuid';
import { calculateOpacity } from '@/shared/utils';
import AchievementItem from './AchievementItem';

const AchieveBlockMobile = ({
  achievements,
  openModal,
}: {
  achievements: IUserAchData[];
  openModal: (item: IUserAchData, opacity: number, activeIcon: boolean) => void;
}) => {
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
    <div className={style.achContainer}>
      {/* Первая колонка */}
      <div className={style.column}>
        {data[0]?.map(item => {
          const opacity = calculateOpacity(item.level, item.stages);
          const activeIcon = Boolean(item.stages);
          return (
            <AchievementItem
              key={uuidv4()}
              item={item}
              onClick={() => openModal(item, opacity, activeIcon)}
              className={style.item}
            />
          );
        })}
      </div>

      {/* Вторая колонка с дополнительным div, занимающим свободное место сверху */}
      <div className={style.extraColumn}>
        <div className={style.spacer} />
        {data[1]?.map(item => {
          const opacity = calculateOpacity(item.level, item.stages);
          const activeIcon = Boolean(item.stages);
          return (
            <AchievementItem
              key={uuidv4()}
              item={item}
              onClick={() => openModal(item, opacity, activeIcon)}
              className={style.item}
            />
          );
        })}
      </div>

      {/* Третья колонка */}
      <div className={style.column}>
        {data[2]?.map(item => {
          const opacity = calculateOpacity(item.level, item.stages);
          const activeIcon = Boolean(item.stages);
          return (
            <AchievementItem
              key={uuidv4()}
              item={item}
              onClick={() => openModal(item, opacity, activeIcon)}
              className={style.item}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AchieveBlockMobile;
