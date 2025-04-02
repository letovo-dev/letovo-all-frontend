import React from 'react';
import style from './Comments.module.scss';

const Comments = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={style.commentsLisBackground}>
      <div className={style.wrap}></div>
      {children}
    </div>
  );
};

export default Comments;
