import React from 'react';
import style from './PostHeader.module.scss';
import { Avatar } from 'antd';
import Image from 'next/image';

const PostHeader = ({
  index,
  author,
  text,
}: {
  index: number;
  author: { username: string; avatar: string; id: string };
  text: string;
}) => {
  const avatarSrc =
    author.avatar && process.env.NEXT_PUBLIC_BASE_URL_MEDIA
      ? `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${author.avatar}`
      : '/img/pic1.png';

  return (
    <>
      <div
        key={`header-${author.id}-${index}`}
        className={index === 0 ? style.infoContainerFirst : style.infoContainer}
      >
        <div className={style.avatarTemplate}>
          <Avatar src={avatarSrc} size={50} className={style.avatar} />
        </div>
        <p>{author.username || 'Unknown'}</p>
        <Image src="/Checkmark 3.png" alt="like" height={18} width={18} />
      </div>
      <p className={style.newsText}>{text || ''}</p>
    </>
  );
};

export default PostHeader;
