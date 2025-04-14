import { IUserAchData } from '@/shared/stores/user-store';
import React, { useEffect, useState } from 'react';
import style from './AchieveBlockMobile.module.scss';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

const AchieveBlockMobile = ({
  achievements,
  openModal,
}: {
  achievements: IUserAchData[];
  openModal: (item: IUserAchData, done?: boolean) => void;
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
        {data[0]?.map(item => (
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

      {/* Вторая колонка с дополнительным div, занимающим свободное место сверху */}
      <div className={style.extraColumn}>
        <div className={style.spacer} />
        {/* <QRScanner /> */}
        {/* <div className={style.column}> */}
        {data[1]?.map(item => (
          <div
            key={uuidv4()}
            className={style.item}
            onClick={() => openModal({ ...item, done: true }, true)}
          >
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
        {/* </div> */}
      </div>

      {/* Третья колонка */}
      <div className={style.column}>
        {data[2]?.map(item => (
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
    </div>
  );
};

export default AchieveBlockMobile;
