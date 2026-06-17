import React from 'react';
import { Avatar, Menu } from 'antd';
import style from './CustomSelect.module.scss';
import './CustomSelect.module.scss';
import { ImgWithBackground } from '../image-background';

interface CustomSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
  avatars: string[];
  userPageSelectPosition?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  visible,
  setVisible,
  avatars = [],
  userPageSelectPosition,
}) => {
  const avatarsToSelect = avatars
    .filter(avatar => avatar !== value)
    .map((avatar: string) => ({
      key: avatar,
      icon: (
        <div className={style.avatarTemplate}>
          <Avatar src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${avatar}`} size={72} />
          {/* <ImgWithBackground
            imgPath={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${avatar}`}
            size={60}
            imgType={'avatar'}
            opacity={1}
          /> */}
        </div>
      ),
      label: null,
    }));
  const handleMenuClick = (e: any) => {
    const selectedImage = e.key;
    if (onChange) {
      onChange(selectedImage);
    }
    setVisible(false);
  };

  if (!visible) return null;

  if (avatarsToSelect.length === 0) {
    return (
      <div
        style={{
          position: 'absolute',
          left: userPageSelectPosition ? 5 : -15,
          top: userPageSelectPosition ? 110 : '200%',
          zIndex: 10,
          background: 'rgba(36,36,36,0.95)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 10,
          padding: '10px 12px',
          width: 109,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span style={{ fontSize: 20 }}>😔</span>
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.75)',
            textAlign: 'center',
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}
        >
          Нет доступных аватаров
        </span>
      </div>
    );
  }

  return (
    <div className={!userPageSelectPosition ? style.customSelect : style.customSelectUserPage}>
      <div className={style.scrollContainer}>
        <Menu
          title={undefined}
          mode="inline"
          items={avatarsToSelect}
          inlineCollapsed={true}
          onSelect={e => handleMenuClick(e)}
          className={style.customSelectDropdown}
        />
      </div>
    </div>
  );
};

export default CustomSelect;
