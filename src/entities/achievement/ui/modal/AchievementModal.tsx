'use client';
import React from 'react';
import style from './AchievementModal.module.scss';
import Image from 'next/image';
import { IUserAchData } from '@/shared/stores/user-store';

interface ModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title: string;
  children?: React.ReactNode;
  currentItem: IUserAchData | null;
  allPossibleUserAchievements: IUserAchData[] | undefined;
  setCurrentItem: (value: IUserAchData | null) => void;
  currentImageElement: JSX.Element | null;
}

const AchievementModal: React.FC<ModalProps> = ({
  currentItem,
  setCurrentItem,
  open,
  setOpen,
  title = 'Ачивка',
  allPossibleUserAchievements = [],
  currentImageElement,
  children,
}) => {
  if (!open) return null;
  const onClose = () => {
    setOpen(false);
    setCurrentItem(null);
  };

  const showNextItem = () => {
    const currentIndex = currentItem ? allPossibleUserAchievements?.indexOf(currentItem) : -1;
    const nextIndex = ((currentIndex ?? -1) + 1) % (allPossibleUserAchievements?.length || 1);
    if (allPossibleUserAchievements) {
      setCurrentItem(allPossibleUserAchievements[nextIndex]);
    }
  };

  const showPrevItem = () => {
    const currentIndex = currentItem ? allPossibleUserAchievements?.indexOf(currentItem) : -1;
    const prevIndex =
      ((currentIndex ?? -1) - 1 + (allPossibleUserAchievements?.length || 1)) %
      (allPossibleUserAchievements?.length || 1);
    if (allPossibleUserAchievements) {
      setCurrentItem(allPossibleUserAchievements[prevIndex]);
    }
  };

  const stage = currentItem?.stage === '' ? '0' : currentItem?.stage;

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div
        className={currentItem?.done ? style.modalContainerDone : style.modalContainerClosed}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className={style.closeButton} type="button" />
        <h5 className={style.modalContainerHeader}>{title}</h5>
        <div className={style.modalContainerItem}>
          <h5 className={style.text}>{currentItem?.achivement_name}</h5>
          <div className={style.slider}>
            <div className={style.directionDiv} onClick={showPrevItem}>
              <Image
                src="/Vector_left.png"
                alt="achievement"
                height={12}
                width={8}
                className={style.direction}
              />
            </div>
            <div className={style.achivDiv}>
              {currentItem?.datetime !== '' ? (
                <p className={style.resultBlockText}>Получена</p>
              ) : (
                <p className={style.resultBlockRes}>Частей собрано:</p>
              )}
              <p className={style.textConditionRes}>{`${stage}/${currentItem?.stages}`}</p>
            </div>
            <div className={style.directionDiv} onClick={showNextItem}>
              <Image
                src="/Vector_right.png"
                alt="achievement"
                height={12}
                width={8}
                className={style.direction}
              />
            </div>
          </div>
          <p className={style.textCondition}>Условия получения</p>
          <p className={style.textDescription}>{currentItem?.achivement_decsription}</p>
        </div>
        <Image
          className={style.letovoCorp}
          src="/Logo_Mini.png"
          alt="Letovo.corp"
          height={14}
          width={163}
        />
        <div className={style.imageWrapper}>{currentImageElement}</div>
      </div>
    </div>
  );
};

export default AchievementModal;
