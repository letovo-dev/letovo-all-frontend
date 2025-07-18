'use client';
import React from 'react';
import style from './AchievementModal.module.scss';
import Image from 'next/image';
import userStore, { IUserAchData } from '@/shared/stores/user-store';
import { QrcodeOutlined } from '@ant-design/icons';
import { QRCode } from 'antd';
import { generateKey } from '@/shared/api/utils';
import { ImgWithBackground } from '@/shared/ui/image-background';
import { calculateOpacity } from '@/shared/utils';

interface ModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title: string;
  children?: React.ReactNode;
  currentItem: IUserAchData | null;
  allPossibleUserAchievements: IUserAchData[] | undefined;
  setCurrentItem: (value: IUserAchData | null) => void;
  currentImageElement: JSX.Element | null;
  setCurrentImageElement: any;
}

const BASE_URL = 'https://letovo.ru';
const DONE_ACH = '/images/aceehimnstv/loched.png';

const AchievementModal: React.FC<ModalProps> = ({
  currentItem,
  setCurrentItem,
  open,
  setOpen,
  title = 'Ачивка',
  allPossibleUserAchievements = [],
  currentImageElement,
  children,
  setCurrentImageElement,
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
      const currentAch = { ...allPossibleUserAchievements[nextIndex], done: doneItem };
      setCurrentItem({ ...allPossibleUserAchievements[nextIndex], done: doneItem });
      const opacity = calculateOpacity(currentAch.level, currentAch.stages);

      setQrUrl(null);
      const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${allPossibleUserAchievements[nextIndex].achivement_pic}`;
      setCurrentImageElement(
        <div key={generateKey()} className={style.item}>
          {currentAch.done ? (
            <>
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${DONE_ACH}`}
                alt=""
                height={75}
                width={75}
              />
            </>
          ) : (
            <>
              <ImgWithBackground imgPath={imgPath} size={60} imgType={'avatar'} opacity={opacity} />
            </>
          )}
        </div>,
      );
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

      const currentAch = { ...allPossibleUserAchievements[prevIndex], done: doneItem };
      setCurrentItem({ ...allPossibleUserAchievements[prevIndex], done: doneItem });
      const opacity = calculateOpacity(currentAch.level, currentAch.stages);
      setQrUrl(null);
      const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${currentAch.achivement_pic}`;
      setCurrentImageElement(
        <div key={generateKey()} className={style.item}>
          {currentAch.done ? (
            <>
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${DONE_ACH}`}
                alt=""
                height={75}
                width={75}
              />
            </>
          ) : (
            <>
              <ImgWithBackground imgPath={imgPath} size={60} imgType={'avatar'} opacity={opacity} />
            </>
          )}
        </div>,
      );
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
                src="/images/Vector_left.webp"
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
                src="/images/Vector_right.webp"
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
          src="/images/Logo_Mini.webp"
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
