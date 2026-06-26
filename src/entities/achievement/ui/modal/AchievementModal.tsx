'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import style from './AchievementModal.module.scss';
import Image from 'next/image';
import userStore, { IUserAchData } from '@/shared/stores/user-store';
import { QrcodeOutlined } from '@ant-design/icons';
import { QRCode } from 'antd';
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

const AchievementModal: React.FC<ModalProps> = ({
  currentItem,
  setCurrentItem,
  open,
  setOpen,
  allPossibleUserAchievements = [],
  setCurrentImageElement,
}) => {
  const [qrUrl, setQrUrl] = React.useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const username = userStore(state => state.store.userData.username);

  const qrData = `${process.env.NEXT_PUBLIC_BASE_URL_CLEAR}/open-a/${username}/${currentItem?.achivement_id}`;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const onClose = () => {
    setOpen(false);
    setCurrentItem(null);
    setQrUrl(null);
  };

  const navigateTo = (index: number) => {
    if (!allPossibleUserAchievements?.length) return;
    const item = allPossibleUserAchievements[index];
    const doneItem = item.stages === item.level;
    const opacity = calculateOpacity(item.level, item.stages);
    const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${item.achivement_pic}`;

    setCurrentItem({ ...item, done: doneItem });
    setQrUrl(null);

    setCurrentImageElement(
      doneItem ? (
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/images/aceehimnstv/loched.png`}
          alt=""
          height={80}
          width={80}
        />
      ) : (
        <ImgWithBackground imgPath={imgPath} size={80} imgType="avatar" opacity={opacity} />
      ),
    );
  };

  const showNextItem = () => {
    const len = allPossibleUserAchievements?.length || 1;
    const idx =
      allPossibleUserAchievements?.findIndex(i => i.achivement_id === currentItem?.achivement_id) ??
      -1;
    navigateTo((((idx + 1) % len) + len) % len);
  };

  const showPrevItem = () => {
    const len = allPossibleUserAchievements?.length || 1;
    const idx =
      allPossibleUserAchievements?.findIndex(i => i.achivement_id === currentItem?.achivement_id) ??
      -1;
    navigateTo((((idx - 1) % len) + len) % len);
  };

  const stage = currentItem?.stages || '0';
  const level = currentItem?.level || '0';

  const handleOpenQr = () => {
    setQrUrl(qrData);
    setTimeout(() => setQrUrl(null), 10000);
  };

  const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${currentItem?.achivement_pic}`;
  const opacity = calculateOpacity(currentItem?.level ?? '0', currentItem?.stages ?? '0');

  const modalNode = (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContainer} onClick={e => e.stopPropagation()}>
        <div className={style.headerRow}>
          <h5 className={style.modalTitle}>{currentItem?.achivement_name}</h5>
          <button
            onClick={onClose}
            className={style.closeButton}
            type="button"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className={style.imageRow}>
          <button
            className={style.arrowBtn}
            onClick={showPrevItem}
            type="button"
            aria-label="Предыдущая"
          >
            <Image src="/images/Vector_left.webp" alt="" height={14} width={9} />
          </button>

          <div className={style.imageWrap}>
            {currentItem?.done ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/images/aceehimnstv/loched.png`}
                alt=""
                height={100}
                width={100}
              />
            ) : (
              <ImgWithBackground imgPath={imgPath} size={100} imgType="avatar" opacity={opacity} />
            )}
            {qrUrl && (
              <div className={style.qrOverlay}>
                <QRCode type="svg" value={qrUrl ?? BASE_URL} className={style.qrCode} />
              </div>
            )}
          </div>

          <button
            className={style.arrowBtn}
            onClick={showNextItem}
            type="button"
            aria-label="Следующая"
          >
            <Image src="/images/Vector_right.webp" alt="" height={14} width={9} />
          </button>
        </div>

        <div className={style.progressRow}>
          {currentItem?.done ? (
            <p className={style.progressDone}>Получена</p>
          ) : (
            <p className={style.progressText}>Частей собрано:</p>
          )}
          <p className={style.progressValue}>{`${level} / ${stage}`}</p>
        </div>

        <div className={style.divider} />

        <p className={style.conditionLabel}>Условия получения</p>
        <div className={style.descriptionBox}>
          <p className={style.descriptionText}>{currentItem?.achivement_decsription}</p>
        </div>

        <div className={style.footerRow}>
          <Image
            src="/images/Logo_Mini.webp"
            alt="Letovo.corp"
            height={12}
            width={140}
            className={style.logo}
          />
          <QrcodeOutlined
            className={style.qrIcon}
            onClick={e => {
              e.stopPropagation();
              handleOpenQr();
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};

export default AchievementModal;
