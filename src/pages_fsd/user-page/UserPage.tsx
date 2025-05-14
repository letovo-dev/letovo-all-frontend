'use client';

import React, { useEffect, useRef, useState } from 'react';
import style from './UserPage.module.scss';
import userStore, { IUserAchData, IUserStore } from '@/shared/stores/user-store';
import { ConfigProvider, Form, Spin } from 'antd';
import { useRouter } from 'next/navigation';

// import CustomSelect from '@/shared/ui/select/CustomSelect';
// import QRScanner from '@/features/qr-scanner/QrScanner';
// import TableElement from '@/features/qr-scanner/Table';
// import { QrReader } from '@/features/qr-scanner/QrReader';
// import Registration from '@/features/registration';
import authStore from '@/shared/stores/auth-store';
import { setDataToLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import dataStore from '@/shared/stores/data-store';
import GetAvatars from '@/features/getAvatars';
import Image from 'next/image';
import { AchievementModal } from '@/entities/achievement/ui/modal';
import { TransferModal } from '@/features/moneyTranfer/ui';
import OnBoard from './ui/OnBoard';
import Money from './ui/Money';
import UserData from './ui/UserData';
const AchieveBlock = dynamic(() => import('./ui/AchieveBlock'), { ssr: false });

import AchieveBlockMobile from './ui/AchieveBlockMobile';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import { ImgWithBackground } from '@/shared/ui/image-background';
import { generateKey } from '@/shared/api/utils';
import dynamic from 'next/dynamic';

const UserPage = () => {
  const router = useRouter();
  const { allPossibleUserAchievements } = userStore.getState().store;
  const getAllUserAchievements = userStore((state: IUserStore) => state.getAllUserAchievements);
  const [form] = Form.useForm();
  const changeAvatar = userStore((state: IUserStore) => state.setAvatar);
  const getAvatars = dataStore(state => state.getAvatars);
  const userStatus = authStore(state => state.userStatus);
  const avatars = dataStore(state => state.data?.avatars);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<IUserAchData | null>(null);
  const achievements = userStore.getState().store.allPossibleUserAchievements;

  const [currentImageElement, setCurrentImageElement] = useState<JSX.Element | null>(null);
  const [userData, setUserData] = useState(userStore.getState().store.userData);
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const { setFooterHidden } = useFooterContext();

  const wrapRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    userStore.setState({ store: { ...userStore.getState().store } });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const initialData = userStore.getState().store.userData;
      if (!userStatus?.logged || !userStatus?.token || !userStatus?.registered) {
        router.push(`/login`);
      }

      setUserData(initialData);
      setAvatar(initialData.avatar_pic);

      if (initialData?.username) {
        setIsLoading(true);
        await getAllUserAchievements(initialData.username);
        if (!avatars || avatars.length === 0) {
          await getAvatars();
        }

        setIsLoading(false);
      }
    };

    loadData();

    const unsubscribe = userStore.subscribe((state: IUserStore) => {
      setUserData(state.store.userData);
      setAvatar(state.store.userData?.avatar_pic);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userStatus, avatars]);

  const logout = () => {
    authStore.getState().logout();
    setDataToLocaleStorage('token', '');
    router.push(`/login`);
  };

  const onValuesChange = async (changedValues: any, allValues: any) => {
    if (changedValues.avatar) {
      await changeAvatar(changedValues.avatar);
    }
  };

  const toggleVisible = () => {
    setVisible(!visible);
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
  const args = {
    ViewFinder,
    videoId: 'video',
    scanDelay: 500,
    constraints: {
      facingMode: 'user',
    },
  };

  const userOnBoard = userData?.active === 't' ? 'Работает' : 'В отпуске';

  const openModal = (item: IUserAchData, opacity: number, activeIcon: boolean) => {
    const doneItem = item.stages === item.level;
    const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${item.achivement_pic}`;

    setCurrentItem({ ...item, done: doneItem });
    setCurrentImageElement(
      <div key={generateKey()} className={style.item}>
        {activeIcon ? (
          <>
            <ImgWithBackground imgPath={imgPath} size={60} imgType={'avatar'} opacity={opacity} />
            <p className={style.achTextActive}>{item.achivement_name}</p>
          </>
        ) : (
          <>
            <Image src="/Achievement_Closed.png" alt="" height={106} width={106} />
            <p className={style.achTextActive}>{item.achivement_name}</p>
          </>
        )}
      </div>,
    );
    setOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (wrapRef.current) {
        const currentScrollTop = wrapRef.current.scrollTop;
        const scrollHeight = wrapRef.current.scrollHeight;
        const clientHeight = wrapRef.current.clientHeight;
        const isAtBottom = currentScrollTop + clientHeight >= scrollHeight - 1;
        if (currentScrollTop > lastScrollTop.current && currentScrollTop > 50) {
          setFooterHidden(true);
        } else if (currentScrollTop < lastScrollTop.current || isAtBottom) {
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
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className={style.spinner}>
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
      <div className={style.desktopContent}>
        <div className={style.accountDivPC}>
          <div className={style.topContainer}>
            {windowWidth > 960 && (
              <Form form={form} onValuesChange={onValuesChange} className={style.formDesktop}>
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
                    avatarSize={75}
                    userPageSelectPosition={true}
                  />
                </div>
              </Form>
            )}
            <UserData userData={userData} userOnBoard={userOnBoard} />
            <button onClick={logout} className={style.logOutButtonDesktop} type="button" />
          </div>
          <div className={style.moneyContainer}>
            <OnBoard userData={userData} />
            <Money
              userData={userData}
              setOpenTransferModal={setOpenTransferModal}
              uploadPhoto={uploadPhoto}
            />
          </div>
          <section className={style.achieveHeaderDesktop}>
            <Image
              src="/Achievement_AllBased_Active.png"
              alt="achievement"
              height={50}
              width={50}
            />
            <Image src="/Achievement_Element.png" alt="line" height={2} width={40} />
            <p className={style.textAchieveHeaderDesktop}>Достижения</p>
            <Image src="/Achievement_Element.png" alt="line" height={2} width={40} />
            <Image src="/Achievement_Управление_Active.png" alt="sign" height={50} width={50} />
          </section>
        </div>
      </div>

      <button onClick={logout} className={style.logOutButton} type="button" />
      <div className={style.accountDiv}>
        <OnBoard userData={userData} />
        <section className={style.userData}>
          <h4 className={style.userName}>{userData?.username}</h4>
          <p className={userData?.active === 't' ? style.userOnBoard : style.userRest}>
            {userOnBoard}
          </p>
          <p className={style.userPosition}>{userData?.role}</p>
        </section>
        <Money
          userData={userData}
          setOpenTransferModal={setOpenTransferModal}
          uploadPhoto={uploadPhoto}
        />

        {windowWidth <= 960 && (
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
                avatarSize={60}
                userPageSelectPosition={true}
              />
            </div>
          </Form>
        )}

        <section className={style.achieveHeader}>
          <Image src="/Achievement_AllBased_Active.png" alt="achievement" height={50} width={50} />
          <Image src="/Achievement_Element.png" alt="line" height={2} width={40} />
          <p className={style.time}>Достижения</p>
          <Image src="/Achievement_Element.png" alt="line" height={2} width={40} />
          <Image src="/Achievement_Управление_Active.png" alt="sign" height={50} width={50} />
        </section>
      </div>

      {achievements &&
        achievements.length > 0 &&
        (windowWidth <= 960 ? (
          <AchieveBlockMobile achievements={achievements ?? []} openModal={openModal} />
        ) : (
          <div className={style.achieveBlockContainer}>
            <AchieveBlock achievements={achievements ?? []} openModal={openModal} />
          </div>
        ))}
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
          selfMoney={Number(userData.balance) || 0}
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

export const getServerSideProps = () => ({ props: {} });

export default UserPage;
