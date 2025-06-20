import React from 'react';
import style from './PostHeader.module.scss';
import { App, Avatar, Tooltip } from 'antd';
import Image from 'next/image';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const PostHeader = ({
  index,
  author,
  text,
  userStatus,
  handleOpen,
  handleDelete,
  currentNewsStateSaved,
}: {
  index: number;
  author: { username: string; avatar: string; id: string };
  text: string;
  userStatus: string;
  handleOpen: () => void;
  handleDelete: (id: string) => void;
  currentNewsStateSaved: boolean;
}) => {
  const avatarSrc =
    author.avatar && process.env.NEXT_PUBLIC_BASE_URL_MEDIA
      ? `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${author.avatar}`
      : '/img/pic1.png';

  return (
    <App>
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

        {userStatus === 'admin' && !currentNewsStateSaved && (
          <div className={style.iconsContainer}>
            <Tooltip title="Редактировать">
              <EditOutlined className={style.editPost} onClick={() => handleOpen()} />
            </Tooltip>
            <DeleteOutlined className={style.editPost} onClick={() => handleDelete(author.id)} />
          </div>
        )}
      </div>
      <p className={style.newsText}>{text || ''}</p>
    </App>
  );
};

export default PostHeader;
