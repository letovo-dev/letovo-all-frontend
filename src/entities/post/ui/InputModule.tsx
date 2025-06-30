import { Avatar, Divider } from 'antd';
import React from 'react';
import style from './InputModule.module.scss';
import TextareaAutoHeight from './TextareaAutoHeight';
import Image from 'next/image';
import PostAuthorsDropdown from './PostAuthorsDropdown';
import type { MenuProps } from 'antd';

type InputModuleProps = {
  isLastNews: boolean;
  text: string;
  avatarSrc: string;
  handleSendComment: () => void;
  setText: (text: string) => void;
  isAdmin: boolean;
  handleMenuClick: MenuProps['onClick'];
  items: MenuProps['items'];
};

const InputModule: React.FC<InputModuleProps> = ({
  isLastNews = false,
  text = '',
  setText,
  handleSendComment,
  avatarSrc,
  isAdmin,
  handleMenuClick,
  items,
}) => {
  return (
    <>
      <Divider className={style.inputDivider} />
      <div className={style.commentInputContainer}>
        <div className={style.avatarTemplate}>
          {isAdmin ? (
            <PostAuthorsDropdown
              avatarSrc={avatarSrc}
              handleMenuClick={handleMenuClick}
              items={items}
            />
          ) : (
            <Avatar src={avatarSrc} size={30} className={style.avatar} />
          )}
        </div>
        <TextareaAutoHeight
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введите текст..."
        />
        <Image
          src={
            text.length > 0
              ? '/images/Button_SendComment_Active.webp'
              : '/images/Button_SendComment_Unactive.webp'
          }
          alt="send"
          width={24}
          height={24}
          className={style.sendButton}
          onClick={handleSendComment}
        />
      </div>
      {/* <Divider className={isLastNews ? style.inputLastDivider : style.inputDividerBottom} /> */}
    </>
  );
};

export default InputModule;
