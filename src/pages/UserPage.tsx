'use client';
import React, { useEffect, useState } from 'react';
import style from './UserPage.module.scss';
import userStore, { IUserAchData } from '@/shared/stores/user-store';
import { Button } from 'antd';
import CustomSelect from '@/shared/ui/select/CustomSelect';
import QRScanner from '@/features/qr-scanner/QrScanner';
import TableElement from '@/features/qr-scanner/Table';
import { QrReader } from '@/features/qr-scanner/QrReader';
import Registration from '@/features/registration';
import authStore from '@/shared/stores/auth-store';

const UserPage = () => {
  const { userData } = userStore.getState().store;
  const getAllUserAchievements = userStore(state => state.getAllUserAchievements);
  const allPossibleUserAchievements = userStore(state => state.store.allPossibleUserAchievements);
  const [data, setData] = useState<IUserAchData[][]>([]);
  const [error, setError] = useState(null);
  const [dataScanner, setDataScanner] = useState(null);

  // useEffect(() => {
  //   if (userData?.username) {
  //     getAllUserAchievements(userData.username);
  //   }
  // }, [userData?.username]);

  const changeLogin = () => {
    userStore.getState().setAvatar('/img/logo2.jpg');
  };

  const changePass = () => {
    authStore.getState().changePass('new_pass');
  };

  const ViewFinder = () => (
    <>
      <svg
        width="50px"
        viewBox="0 0 100 100"
        style={{
          top: 0,
          left: 0,
          zIndex: 1,
          boxSizing: 'border-box',
          border: '50px solid rgba(0, 0, 0, 0.3)',
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        <path fill="none" d="M13,0 L0,0 L0,13" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="5" />
        <path fill="none" d="M0,87 L0,100 L13,100" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="5" />
        <path
          fill="none"
          d="M87,100 L100,100 L100,87"
          stroke="rgba(255, 0, 0, 0.5)"
          strokeWidth="5"
        />
        <path fill="none" d="M100,13 L100,0 87,0" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="5" />
      </svg>
    </>
  );
  useEffect(() => {
    if (allPossibleUserAchievements) {
      const col1 = allPossibleUserAchievements?.filter(
        (item: IUserAchData, index: number) => index % 3 === 0,
      );

      const col2 = allPossibleUserAchievements?.filter(
        (item: IUserAchData, index: number) => index % 3 === 1,
      );
      const col3 = allPossibleUserAchievements?.filter(
        (item: IUserAchData, index: number) => index % 3 === 2,
      );
      setData([[...col1], [...col2], [...col3]]);
    }
  }, [allPossibleUserAchievements]);

  const args = {
    ViewFinder,
    videoId: 'video',
    scanDelay: 500,
    constraints: {
      facingMode: 'user',
    },
  };
  return (
    <div className={style.wrap}>
      {/* <div style={{ width: '400px', margin: 'auto' }}>
        <QrReader
          {...args}
          onResult={(result, error) => {
            if (result) {
              setData(result);
            }

            if (error) {
              setError(error.message);
            }
          }}
        />
        <p>The value is: {JSON.stringify(dataScanner, null, 2)}</p>
        <p>The error is: {error}</p>
      </div> */}
      <Button onClick={changeLogin}> Change login </Button>
      <Button onClick={changePass}> Change pass </Button>
      <Registration />
      {/* <div className={style.skewedInputContainer}> */}
      <input className={style.inputWrapper} type="text" placeholder="Введите текст" />
      {/* </div> */}
      {data.length > 0 && (
        <div className={style.container}>
          {/* Первая колонка */}
          <div className={style.column}>
            {data[0]?.map(item => (
              <div key={item.id} className={style.item}>
                {item.achivement_name}
              </div>
            ))}
          </div>

          {/* Вторая колонка с дополнительным div, занимающим свободное место сверху */}
          <div className={style.column}>
            <div className={style.spacer}>TEXT</div>
            {/* <QRScanner /> */}
            {data[1]?.map(item => (
              <div key={item.id} className={style.item}>
                {item.achivement_name}
              </div>
            ))}
          </div>

          {/* Третья колонка */}
          <div className={style.column}>
            {data[2]?.map(item => (
              <div key={item.id} className={style.item}>
                {item.achivement_name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
