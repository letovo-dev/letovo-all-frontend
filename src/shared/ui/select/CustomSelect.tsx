import React from 'react';
import { Avatar, Menu } from 'antd';
import style from './CustomSelect.module.scss';
import './CustomSelect.module.scss';

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
  console.log('avatars', avatars);

  const avatarsToSelect = avatars
    .filter(avatar => avatar !== value)
    .map((avatar: string) => ({
      key: avatar,
      icon: (
        <div className={style.avatarTemplate}>
          <Avatar
            src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${avatar}`}
            size={45}
            // className={style.selectedAvatar}
          />
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
      {
        <Menu
          title={undefined}
          mode="inline"
          items={avatarsToSelect}
          inlineCollapsed={true}
          onSelect={e => handleMenuClick(e)}
          className={style.customSelectDropdown}
        />
      }
    </div>
  ) : null;
};

export default CustomSelect;
