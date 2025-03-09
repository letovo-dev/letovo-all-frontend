'use client';
import React from 'react';
import style from './TransferModal.module.scss';
import Image from 'next/image';

interface ModalProps {
  openTransferModal: boolean;
  setOpenTransferModal: (value: boolean) => void;
  title: string;
  selfMoney: number | string;
}

const TransferModal: React.FC<ModalProps> = ({
  title: string,
  openTransferModal,
  setOpenTransferModal,
  selfMoney,
  title,
}) => {
  const [receiver, setReceiver] = React.useState(false);

  if (!openTransferModal) return null;
  const onClose = () => {
    setOpenTransferModal(false);
  };

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div
        className={receiver ? style.modalContainerTransfer : style.modalContainer}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className={style.closeButton} type="button" />
        <h5 className={style.modalContainerHeader}>Перевод</h5>
        <div className={style.modalContainerItem}>
          <h5 className={style.text}>Text</h5>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
