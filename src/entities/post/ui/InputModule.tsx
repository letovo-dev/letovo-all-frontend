import { Avatar, Divider } from 'antd';
import React from 'react';
import style from './InputModule.module.scss';
import TextareaAutoHeight from './TextareaAutoHeight';
import Image from 'next/image';

type InputModuleProps = {
  isLastNews: boolean;
  text: string;
  avatarSrc: string;
  handleSendComment: () => void;
  setText: React.Dispatch<React.SetStateAction<string>>;
};

const InputModule: React.FC<InputModuleProps> = ({
  isLastNews = false,
  text,
  setText,
  handleSendComment,
  avatarSrc,
}) => {
  return (
    <>
      <Divider className={style.inputDivider} />
      <div className={style.commentInputContainer}>
        <div className={style.avatarTemplate}>
          <Avatar src={avatarSrc ?? '/img/pic3.png'} size={30} className={style.avatar} />
        </div>
        <TextareaAutoHeight
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введите текст..."
        />
        <Image
          src={
            text.length > 0 ? '/Button_SendComment_Active.png' : '/Button_SendComment_Unactive.png'
          }
          alt="send"
          width={24}
          height={24}
          className={style.sendButton}
          onClick={handleSendComment}
        />
      </div>
      <Divider className={isLastNews ? style.inputLastDivider : style.inputDividerBottom} />
    </>
  );
};

export default InputModule;
