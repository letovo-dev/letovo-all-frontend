import React from 'react';
import { Menu, MenuProps } from 'antd';
import style from './CustomSelect.module.scss';
import './CustomSelect.module.scss';
import Image from 'next/image';

type MenuItem = Required<MenuProps>['items'][number];

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
  const avatarsToSelect = avatars.map((avatar: string) => ({
    key: avatar,
    icon: (
      <div className={style.avatarTemplate}>
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${avatar}`}
          width={40}
          height={40}
          alt="avatar"
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
      {/* // <div className={style.customSelect}> */}
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
