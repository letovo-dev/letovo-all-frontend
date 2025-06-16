import React from 'react';
import style from './PostHeader.module.scss';
import { Avatar, Tooltip } from 'antd';
import Image from 'next/image';
import { EditOutlined } from '@ant-design/icons';

const PostHeader = ({
  index,
  author,
  text,
  userStatus,
  handleOpen,
}: {
  index: number;
  author: { username: string; avatar: string; id: string };
  text: string;
  userStatus: string;
  handleOpen: () => void;
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
        <div className={style.contentContainer}>
          <div className={style.avatarTemplate}>
            <Avatar src={avatarSrc} size={50} className={style.avatar} />
          </div>
          <p>{author.username || 'Unknown'}</p>
          <Image src="/Checkmark 3.png" alt="like" height={18} width={18} />
        </div>

        {userStatus === 'admin' && (
          <Tooltip title="Редактировать">
            <EditOutlined className={style.editPost} onClick={() => handleOpen()} />
          </Tooltip>
        )}
      </div>
      <p className={style.newsText}>{text || ''}</p>
    </>
  );
};

export default PostHeader;
