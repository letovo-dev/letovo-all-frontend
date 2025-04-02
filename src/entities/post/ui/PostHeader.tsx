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
  return (
    <>
      <div key={index} className={index === 0 ? style.infoContainerFirst : style.infoContainer}>
        <div className={style.avatarTemplate}>
          <Avatar src={'/img/pic1.png'} size={50} className={style.avatar} />
        </div>
        <p>{author.username}</p>
        <Image src="/Checkmark 3.png" alt="like" height={18} width={18} />
      </div>
      <p className={style.newsText}>{text}</p>
    </>
  );
};

export default PostHeader;
