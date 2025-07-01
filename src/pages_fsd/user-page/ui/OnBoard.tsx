import React from 'react';
import style from './OnBoard.module.scss';
import Image from 'next/image';

const colorClasses: { [key: string]: { color: string; name: string } } = {
  '0': { color: style.science, name: 'Наука' },
  '1': { color: style.enginery, name: 'Энергетика' },
  '2': { color: style.it, name: 'IT' },
  '3': { color: style.management, name: 'Менеджмент' },
  '4': { color: style.proj, name: 'Проекты' },
  '5': { color: style.art, name: 'Искусство' },
};

const getColorClass = (depId: string | undefined) => {
  return depId ? colorClasses[depId]?.color || style.defaultColor : style.defaultColor;
};

const OnBoard = ({ userData }: { userData: any }) => {
  return (
    <section className={style.onBoardContainer}>
      <div className={`${style.department} ${getColorClass(userData?.departmentid || '')}`}>
        {userData?.departmentname}
      </div>
      <div className={style.timeOnBoard}>
        <Image src="/images/Element_New_Achiv.webp" alt="*" height={20} width={20} />
        <p className={style.time}>{userData.times_visited}</p>
      </div>
    </section>
  );
};

export default OnBoard;
