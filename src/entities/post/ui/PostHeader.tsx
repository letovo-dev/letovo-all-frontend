import React from 'react';
import style from './PostHeader.module.scss';
import { App, Avatar, Tooltip } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const RU_MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const formatPostDate = (raw: string): string => {
  const match = raw?.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!match) return raw ?? '';
  const [, year, month, day, hh, mm] = match;
  const monthName = RU_MONTHS[parseInt(month, 10) - 1] ?? month;
  return `${hh}:${mm} ${day} ${monthName} ${year}`;
};

const PostHeader = ({
  index,
  author,
  text,
  title,
  date,
  isLetovo,
  userStatus,
  handleOpen,
  handleDelete,
  currentNewsStateSaved,
}: {
  index: number;
  author: { username: string; avatar: string; id: string };
  text: string;
  title?: string;
  date?: string;
  isLetovo?: boolean;
  userStatus: string;
  handleOpen: () => void;
  handleDelete: (id: string) => void;
  currentNewsStateSaved: boolean;
}) => {
  const avatarSrc = author.avatar && `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${author.avatar}`;
  const permittedUser = userStatus === 'admin' || userStatus === 'moder';
  const formattedDate = date ? formatPostDate(date) : '';

  if (isLetovo) {
    return (
      <App>
        <div className={style.letovoInfoContainer}>
          <Image
            src="/26_letovo_round.svg"
            alt="LETOVO"
            width={54}
            height={54}
            className={style.letovoEmblem}
          />
          <div className={style.letovoHeaderRight}>
            <Image
              src="/Logo_Mini.svg"
              alt="LETOVO"
              width={120}
              height={10}
              className={style.letovoWordmark}
            />
            {formattedDate && <p className={style.letovoDate}>{formattedDate}</p>}
          </div>
          {permittedUser && !currentNewsStateSaved && (
            <div className={style.iconsContainer} style={{ marginLeft: 'auto' }}>
              <Tooltip title="Редактировать">
                <EditOutlined className={style.editPost} onClick={() => handleOpen()} />
              </Tooltip>
              <DeleteOutlined className={style.editPost} onClick={() => handleDelete(author.id)} />
            </div>
          )}
        </div>
        {title && <p className={style.letovoTitle}>{title}</p>}
        <p className={style.letovoText}>{text}</p>
      </App>
    );
  }

  return (
    <App>
      <div
        key={`header-${author.id}-${index}`}
        className={index === 0 ? style.infoContainerFirst : style.infoContainer}
      >
        <div className={style.contentContainer}>
          <Link
            href={`/profile/${author.username}`}
            style={{ display: 'contents', color: 'inherit', textDecoration: 'none' }}
          >
            <div className={style.avatarTemplate}>
              <Avatar src={avatarSrc} size={70} className={style.avatar} />
            </div>
            <div className={style.authorBlock}>
              <p className={style.authorName}>{author.username || 'Unknown'}</p>
              {formattedDate && <p className={style.postDate}>{formattedDate}</p>}
            </div>
          </Link>
          <Image src="/images/Checkmark 3.webp" alt="like" height={18} width={18} />
        </div>

        {permittedUser && !currentNewsStateSaved && (
          <div className={style.iconsContainer}>
            <Tooltip title="Редактировать">
              <EditOutlined className={style.editPost} onClick={() => handleOpen()} />
            </Tooltip>
            <DeleteOutlined className={style.editPost} onClick={() => handleDelete(author.id)} />
          </div>
        )}
      </div>
      <>
        <p className={style.newsText}>{text}</p>
      </>
    </App>
  );
};

export default PostHeader;
