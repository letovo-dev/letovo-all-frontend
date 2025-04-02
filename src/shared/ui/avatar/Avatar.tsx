import React from 'react';
import style from './Avatar.module.scss';
import { Avatar } from 'antd';

const AvatarElement = (avatar: string | undefined): JSX.Element => {
  return avatar ? (
    <Avatar
      src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${avatar}`}
      size={60}
      className={style.selectedAvatar}
    />
  ) : (
    <span>Выбрать фото</span>
  );
};

export default AvatarElement;
