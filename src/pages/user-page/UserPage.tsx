'use client';
import React, { useEffect, useRef, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import style from './UserPage.module.scss';
import userStore, { IUserAchData } from '@/shared/stores/user-store';
import { ConfigProvider, Form, Spin } from 'antd';
import CustomSelect from '@/shared/ui/select/CustomSelect';
import QRScanner from '@/features/qr-scanner/QrScanner';
import TableElement from '@/features/qr-scanner/Table';
import { QrReader } from '@/features/qr-scanner/QrReader';
import Registration from '@/features/registration';
import authStore from '@/shared/stores/auth-store';
import { setDataToLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import dataStore from '@/shared/stores/data-store';
import GetAvatars from '@/features/getAvatars';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { AchievementModal } from '@/entities/achievement/ui/modal';
import { TransferModal } from '@/features/moneyTranfer/ui';

const UserPage = () => {
  const [error, setError] = useState(null);
  const [dataScanner, setDataScanner] = useState(null);
  const { userAchievements } = userStore.getState().store;
  const { allPossibleUserAchievements } = userStore.getState().store;
  const getAllUserAchievements = userStore(state => state.getAllUserAchievements);
  const [form] = Form.useForm();
  const changeAvatar = userStore(state => state.setAvatar);
  const getAvatars = dataStore(state => state.getAvatars);
  const userStatus = authStore(state => state.userStatus);
  const avatars = dataStore(state => state.data?.avatars);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<IUserAchData | null>(null);

  const [currentImageElement, setCurrentImageElement] = useState<JSX.Element | null>(null);
  const [userData, setUserData] = useState(userStore.getState().store.userData);
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [data, setData] = useState<IUserAchData[][]>([]);
  const { setFooterHidden } = dataStore(state => state);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    if (userData?.username) {
      getAllUserAchievements(userData.username);
      if (!avatars || avatars.length === 0) {
        getAvatars();
      }
    }
  }, [userData?.username, avatars]);

  useEffect(() => {
    const loadData = async () => {
      const initialData = userStore.getState().store.userData;
      if (!userStatus?.logged || !userStatus?.token || !userStatus?.registered) {
        redirect('/login');
      }

      setUserData(initialData);
      setAvatar(initialData.avatar_pic);

      if (initialData?.username) {
        setIsLoading(true);
        await getAllUserAchievements(initialData.username);
        if (!avatars || avatars.length === 0) {
          await getAvatars();
        }

        const achievements = userStore.getState().store.allPossibleUserAchievements;
        if (achievements && achievements.length > 0) {
          setData([
            achievements.filter((_, i) => i % 3 === 0),
            achievements.filter((_, i) => i % 3 === 1),
            achievements.filter((_, i) => i % 3 === 2),
          ]);
        }
        setIsLoading(false);
      }
    };

    loadData();

    const unsubscribe = userStore.subscribe(state => {
      setUserData(state.store.userData);
      setAvatar(state.store.userData?.avatar_pic);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userStatus, avatars]);

  const logout = () => {
    authStore.getState().logout();
    setDataToLocaleStorage('token', '');
    redirect('/login');
  };

  const onValuesChange = async (changedValues: any, allValues: any) => {
    if (changedValues.avatar) {
      await changeAvatar(changedValues.avatar);
    }
  };

  const toggleVisible = () => {
    setVisible(!visible);
  };

  console.log('data', data);
  console.log('data allPossibleUserAchievements', allPossibleUserAchievements);

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
  const args = {
    ViewFinder,
    videoId: 'video',
    scanDelay: 500,
    constraints: {
      facingMode: 'user',
    },
  };

  const userOnBoard = userData?.active === 't' ? 'Работает' : 'В отпуске';

  const colorClasses: { [key: string]: { color: string; name: string } } = {
    '0': { color: style.science, name: 'Наука' },
    '1': { color: style.enginery, name: 'Энергетика' },
    '2': { color: style.it, name: 'IT' },
    '3': { color: style.management, name: 'Менеджмент' },
    '4': { color: style.proj, name: 'Проекты' },
    '5': { color: style.art, name: 'Искусство' },
  };

  const getColorClass = (depId: string | undefined) => {
    return depId ? colorClasses[depId]?.color || style.defaultColor : style.defaultColor;
  };

  const openModal = (item: IUserAchData, done = false) => {
    setCurrentItem(item);
    setCurrentImageElement(
      <Image
        className={style.itemImg}
        src={done ? '/изображение 5.png' : '/Achievement_Closed.png'}
        alt="sign"
        height={88}
        width={86}
      />,
    );
    setOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (wrapRef.current) {
        const currentScrollTop = wrapRef.current.scrollTop;
        const scrollHeight = wrapRef.current.scrollHeight;
        const clientHeight = wrapRef.current.clientHeight;
        const isAtBottom = currentScrollTop + clientHeight >= scrollHeight - 1; // -1 для учета погрешности
        console.log(
          'currentScrollTop',
          currentScrollTop,
          'lastScrollTop.current',
          lastScrollTop.current,
        );
        console.log('scrollHeight:', wrapRef.current.scrollHeight);
        console.log('clientHeight:', wrapRef.current.clientHeight);
        console.log('scrollTop:', wrapRef.current.scrollTop);

        if (currentScrollTop > lastScrollTop.current) {
          // setScrollDirection('down');
          if (currentScrollTop > 50) {
            setFooterHidden(true);
          }
        } else if (currentScrollTop < lastScrollTop.current && !isAtBottom) {
          // setScrollDirection('up');
          setFooterHidden(false);
        }

        lastScrollTop.current = currentScrollTop;
      }
    };
    const wrapElement = wrapRef.current;
    if (wrapElement) {
      wrapElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (wrapElement) {
        wrapElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [setFooterHidden, wrapRef.current]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible]);

  const uploadPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        // await changeAvatar(file);
        console.log('file', file);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className={style.wrap}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#FB4724',
            },
          }}
        >
          <Spin size={'large'} />
        </ConfigProvider>
      </div>
    );
  }

  return (
    <div className={style.wrap} ref={wrapRef}>
      <button onClick={logout} className={style.logOutButton} type="button" />
      <div className={style.accountDiv}>
        <section className={style.onBoardContainer}>
          <div className={`${style.department} ${getColorClass(userData!.departmentid)}`}>
            {colorClasses[userData?.departmentid]?.name}
          </div>
          <div className={style.timeOnBoard}>
            <Image src="/Element_New_Achiv.png" alt="*" height={20} width={20} />
            <p className={style.time}>{userData.times_visited}</p>
          </div>
        </section>
        <section className={style.userData}>
          <h4 className={style.userName}>{userData?.username}</h4>
          <p className={userData?.active === 't' ? style.userOnBoard : style.userRest}>
            {userOnBoard}
          </p>
          <p className={style.userPosition}>{userData?.role}</p>
        </section>
        <section className={style.money} onClick={() => setOpenTransferModal(true)}>
          <Image src="/Icon_Wallet.png" alt="wallet" height={26} width={24} />
          <p className={style.count}>{`${userData?.balance ?? 100} мон.`}</p>
          <Image src="/Icon_Time.png" alt="clock" height={24} width={24} />
          <p className={style.text}>
            {`|`} &nbsp;{`2000 мон. / д`}
          </p>
        </section>
        {userData?.userrights === 'admin' && (
          <Image
            src="/UploadPhoto_1.png"
            alt="upload"
            height={30}
            width={30}
            className={style.upload}
            onClick={uploadPhoto}
          />
        )}
        <Form form={form} onValuesChange={onValuesChange} className={style.form}>
          <div
            ref={avatarRef}
            className={style.avatarTemplate}
            onClick={() => {
              toggleVisible();
            }}
          >
            <GetAvatars
              form={form}
              setVisible={setVisible}
              visible={visible}
              avatar={avatar}
              avatars={avatars}
              setAvatar={setAvatar}
              avatarSize={{ width: 50, height: 50 }}
              userPageSelectPosition={true}
            />
          </div>
        </Form>
        <section className={style.achieveHeader}>
          <Image src="/Achievement_AllBased_Active.png" alt="achievement" height={50} width={50} />
          <Image src="/Achievement_Element.png" alt="line" height={2} width={40} />
          <p className={style.time}>Достижения</p>
          <Image src="/Achievement_Element.png" alt="line" height={2} width={40} />
          <Image src="/Achievement_Управление_Active.png" alt="sign" height={50} width={50} />
        </section>
      </div>

      {data.length > 0 && (
        <div className={style.achContainer}>
          {/* Первая колонка */}
          <div className={style.column}>
            {data[0]?.map(item => (
              <div key={uuidv4()} className={style.item} onClick={() => openModal(item)}>
                <Image
                  className={style.itemImg}
                  src="/Achievement_Closed.png"
                  alt="sign"
                  height={106}
                  width={106}
                />
                <p className={style.achTextInactive}>{item.achivement_name}</p>
              </div>
            ))}
          </div>

          {/* Вторая колонка с дополнительным div, занимающим свободное место сверху */}
          <div className={style.extraColumn}>
            <div className={style.spacer} />
            {/* <QRScanner /> */}
            {/* <div className={style.column}> */}
            {data[1]?.map(item => (
              <div
                key={uuidv4()}
                className={style.item}
                onClick={() => openModal({ ...item, done: true }, true)}
              >
                <Image
                  className={style.itemImg}
                  src="/Achievement_Closed.png"
                  alt="sign"
                  height={106}
                  width={106}
                />
                <p className={style.achTextInactive}>{item.achivement_name}</p>
              </div>
            ))}
            {/* </div> */}
          </div>

          {/* Третья колонка */}
          <div className={style.column}>
            {data[2]?.map(item => (
              <div key={uuidv4()} className={style.item} onClick={() => openModal(item)}>
                <Image
                  className={style.itemImg}
                  src="/Achievement_Closed.png"
                  alt="sign"
                  height={106}
                  width={106}
                />
                <p className={style.achTextInactive}>{item.achivement_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {open && (
        <AchievementModal
          open={open}
          setOpen={setOpen}
          title="Ачивка"
          currentItem={currentItem}
          setCurrentItem={setCurrentItem}
          allPossibleUserAchievements={allPossibleUserAchievements}
          currentImageElement={currentImageElement}
        />
      )}
      {openTransferModal && (
        <TransferModal
          openTransferModal={openTransferModal}
          setOpenTransferModal={setOpenTransferModal}
          title="Перевод"
          selfMoney={Number(userData.balance) ?? 0}
        />
      )}
      {/* <Button onClick={changeLogin}> Change login </Button>
      <Button onClick={changePass}> Change pass </Button> */}

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
    </div>
  );
};

export default UserPage;
