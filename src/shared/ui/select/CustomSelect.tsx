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

  return visible ? (
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
  ) : null;
};

export default CustomSelect;
