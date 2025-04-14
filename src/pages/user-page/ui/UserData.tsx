import React from 'react';
import style from './UserData.module.scss';

const UserData = ({ userData, userOnBoard }: { userData: any; userOnBoard: string }) => {
  return (
    <section className={style.userDataDesktop}>
      <h4 className={style.userName}>{userData?.username}</h4>
      <p className={userData?.active === 't' ? style.userOnBoard : style.userRest}>{userOnBoard}</p>
      <p className={style.userPosition}>{userData?.role}</p>
    </section>
  );
};

export default UserData;
