import React from 'react';
import style from './CustomModal.module.scss';
import { Button, ConfigProvider } from 'antd';
import Image from 'next/image';

interface CustomModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title: string;
}

const CustomModal: React.FC<CustomModalProps> = ({ open, setOpen, title }) => {
  if (!open) return null;
  const onClose = () => setOpen(false);

  const forgetText =
    'Для получения своего пароля обратитесь к сотруднику службы контроля качества вашего департамента.';

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContainer} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className={style.closeButton} type="button" />
        <h5 className={style.modalContainerHeader}>{title}</h5>
        <div className={style.modalContainerText}>
          <div className={style.logo}>
            <Image src="/transfer_element_forget.png" alt="logo" width={172} height={48} />
          </div>
          <h5 className={style.textBox}>{forgetText}</h5>
        </div>
        <ConfigProvider
          theme={{
            components: {
              Button: {
                defaultHoverBorderColor: '#ffffff',
                defaultHoverColor: '#ffffff',
                defaultHoverBg: '#FB4724',
              },
            },
          }}
        >
          <Button className={style.button} onClick={onClose}>
            Хорошо!
          </Button>
        </ConfigProvider>
      </div>
    </div>
  );
};

export default CustomModal;
