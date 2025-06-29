'use client';
import React from 'react';
import style from './AchievementModal.module.scss';
import Image from 'next/image';
import userStore, { IUserAchData } from '@/shared/stores/user-store';
import { QrcodeOutlined } from '@ant-design/icons';
import { QRCode } from 'antd';

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

const BASE_URL = 'https://letovo.ru';

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
  const [qrUrl, setQrUrl] = React.useState<string | null>(null);
  const {
    store: {
      userData: { username },
    },
  } = userStore(state => state);

  const qrData = `${process.env.NEXT_PUBLIC_BASE_URL_CLEAR}/open-a/${username}/${currentItem?.achivement_id}`;

  if (!open) return null;
  const onClose = () => {
    setOpen(false);
    setCurrentItem(null);
    setQrUrl(null);
  };

  const showNextItem = () => {
    const currentIndex = currentItem
      ? (allPossibleUserAchievements?.findIndex(
          item => item.achivement_id === currentItem.achivement_id,
        ) ?? -1)
      : -1;

    const nextIndex = ((currentIndex ?? -1) + 1) % (allPossibleUserAchievements?.length || 1);
    if (allPossibleUserAchievements) {
      const doneItem =
        allPossibleUserAchievements[nextIndex].stages ===
        allPossibleUserAchievements[nextIndex].level;

      setCurrentItem({ ...allPossibleUserAchievements[nextIndex], done: doneItem });
      setQrUrl(null);
    }
  };

  const showPrevItem = () => {
    const currentIndex = currentItem
      ? (allPossibleUserAchievements?.findIndex(
          item => item.achivement_id === currentItem.achivement_id,
        ) ?? -1)
      : -1;

    const prevIndex =
      ((currentIndex ?? -1) - 1 + (allPossibleUserAchievements?.length || 1)) %
      (allPossibleUserAchievements?.length || 1);
    if (allPossibleUserAchievements) {
      const doneItem =
        allPossibleUserAchievements[prevIndex].stages ===
        allPossibleUserAchievements[prevIndex].level;

      setCurrentItem({ ...allPossibleUserAchievements[prevIndex], done: doneItem });
      setQrUrl(null);
    }
  };

  const stage = currentItem?.stages === '' ? '0' : currentItem?.stages;
  const level = currentItem?.level === '' ? '0' : currentItem?.level;

  const handleOpenQr = () => {
    setQrUrl(qrData);
    setTimeout(() => {
      setQrUrl(null);
    }, 10000);
  };

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div
        className={currentItem?.done ? style.modalContainerDone : style.modalContainerClosed}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className={style.closeButton} type="button" />
        <h5 className={style.modalContainerHeader}>{title}</h5>
        {qrUrl && <QRCode type="svg" value={qrUrl ?? BASE_URL} className={style.qrCode} />}
        <QrcodeOutlined
          className={style.qrStyle}
          onClick={e => {
            e.stopPropagation();
            handleOpenQr();
          }}
        />
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
              {currentItem?.done ? (
                <p className={style.resultBlockText}>Получена</p>
              ) : (
                <p className={style.resultBlockRes}>Частей собрано:</p>
              )}
              <p className={style.textConditionRes}>{`${level}/${stage}`}</p>
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
          <div className={style.textDescriptionContainer}>
            <p className={style.textDescription}>{currentItem?.achivement_decsription}</p>
          </div>
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
