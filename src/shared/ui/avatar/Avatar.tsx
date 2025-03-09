import React from 'react';
import Image from 'next/image';
import style from './Avatar.module.scss';

const Avatar = (
  avatar: string | undefined,
  size: { width: number; height: number },
): JSX.Element => {
  return avatar ? (
    <Image
      src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${avatar}`}
      width={size.width}
      height={size.height}
      alt="avatar"
      className={style.selectedAvatar}
    />
  ) : (
    <span>Выбрать фото</span>
  );
};

export default Avatar;
