'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import style from './UserPage.module.scss';
import userStore, { IUserAchData, IUserStore } from '@/shared/stores/user-store';
import { ConfigProvider, Form, Spin, message } from 'antd';
import { useRouter } from 'next/navigation';
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
import AchieveBlockMobile from './ui/AchieveBlockMobile';
import { useFooterContext } from '@/shared/ui/context/FooterContext';
import { ImgWithBackground } from '@/shared/ui/image-background';
import { generateKey } from '@/shared/api/utils';
import AchieveBlock from './ui/AchieveBlock';

// import QRScanner from '@/features/qr-scanner/QrScanner';
// import TableElement from '@/features/qr-scanner/Table';
// import { QrReader } from '@/features/qr-scanner/QrReader';
const DONE_ACH = '/images/aceehimnstv/loched.png';

const UserPage = () => {
  const router = useRouter();
  const { getAllUserAchievements, getAchievementsDepartment } = userStore(
    (state: IUserStore) => state,
  );
  const [form] = Form.useForm();
  const changeAvatar = userStore((state: IUserStore) => state.setAvatar);
  const getAvatars = dataStore(state => state.getAvatars);
  const userStatus = authStore(state => state.userStatus);
  const avatars = dataStore(state => state.data?.avatars);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<IUserAchData | null>(null);
  const achievements = userStore.getState().store.allPossibleUserAchievements;
  const { departmentAchievements } = userStore.getState().store;
  const [currentImageElement, setCurrentImageElement] = useState<JSX.Element | null>(null);
  const [userData, setUserData] = useState(userStore.getState().store.userData);
  const [isLoading, setIsLoading] = useState(true);
  const { error, loading } = userStore((state: IUserStore) => state);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const { setFooterHidden } = useFooterContext();
  const { getAllPostsAuthors } = userStore.getState();
  const [messageApi, contextHolder] = message.useMessage();

  const wrapRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );
  const [currentAchievements, setCurrentAchievements] = useState<string>('all');

  const achievementsToDisplay = useMemo(() => {
    return currentAchievements === 'all' ? achievements : departmentAchievements;
  }, [currentAchievements, achievements, departmentAchievements]);

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
      setUserData(initialData);
      setAvatar(initialData.avatar_pic);

      if (initialData?.username) {
        setIsLoading(true);
        getAllUserAchievements(initialData.username);
        if (!avatars || avatars.length === 0) {
          await getAvatars();
        }

        setIsLoading(false);
        getAchievementsDepartment();
      }
      if (initialData?.userrights === 'admin') {
        getAllPostsAuthors();
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

  const openModal = useCallback((item: IUserAchData, opacity: number, activeIcon: boolean) => {
    const doneItem = item.stages === item.level;
    const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${item.achivement_pic}`;

    setCurrentItem({ ...item, done: doneItem });
    setCurrentImageElement(
      <div key={generateKey()} className={style.item}>
        {activeIcon ? (
          <>
            <ImgWithBackground imgPath={imgPath} size={60} imgType={'avatar'} opacity={opacity} />
          </>
        ) : (
          <>
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${DONE_ACH}`}
              alt=""
              height={106}
              width={106}
            />{' '}
          </>
        )}
      </div>,
    );
    setOpen(true);
  }, []);

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

  useEffect(() => {
    userStore.getState().loading = false;
  }, []);

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

  const warning = () => {
    messageApi.open({
      type: 'warning',
      content:
        'Мы используем файлы cookie для повышения безопасности и предотвращения мошенничества. Оставаясь на сайте, вы соглашаетесь на их использование. Собранные данные о ваших входах и устройстве не передаются третьим лицам.',
      className: 'custom-class',
      style: {
        marginTop: '77vh',
      },
      duration: 7,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      warning();
    }, 2000);
  }, []);

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
    <>
      {contextHolder}
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
                      avatarSize={115}
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
              <p className={style.textAchieveHeaderDesktopCommon}>Общие</p>
              <Image src="/images/Achievement_Element.webp" alt="line" height={2} width={40} />
              <Image
                src="/images/Achievement_AllBased_Active.webp"
                alt="achievement"
                height={50}
                width={50}
                className={style.ach}
                onClick={() => setCurrentAchievements('all')}
              />
              <Image src="/images/Achievement_Element.webp" alt="line" height={2} width={40} />
              <p className={style.textAchieveHeaderDesktop}>Достижения</p>
              <Image src="/images/Achievement_Element.webp" alt="line" height={2} width={40} />
              <Image
                src="/images/Achievement_Управление_Active.webp"
                alt="sign"
                height={50}
                width={50}
                className={style.ach}
                onClick={() => setCurrentAchievements('dep')}
              />
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
                  avatarSize={93}
                  userPageSelectPosition={true}
                />
              </div>
            </Form>
          )}

          <section className={style.achieveHeader}>
            <Image
              src="/images/Achievement_AllBased_Active.webp"
              alt="achievement"
              height={50}
              width={50}
              className={style.ach}
              onClick={() => setCurrentAchievements('all')}
            />
            <Image src="/images/Achievement_Element.webp" alt="line" height={2} width={40} />
            <p className={style.time}>Достижения</p>
            <Image src="/images/Achievement_Element.webp" alt="line" height={2} width={40} />
            <Image
              src="/images/Achievement_Управление_Active.webp"
              alt="sign"
              height={50}
              width={50}
              className={style.ach}
              onClick={() => setCurrentAchievements('dep')}
            />
          </section>
        </div>

        {achievementsToDisplay &&
          achievementsToDisplay.length > 0 &&
          (windowWidth <= 960 ? (
            <AchieveBlockMobile achievements={achievementsToDisplay ?? []} openModal={openModal} />
          ) : (
            <div className={style.achieveBlockContainer}>
              <AchieveBlock achievements={achievementsToDisplay ?? []} openModal={openModal} />
            </div>
          ))}
        {open && (
          <AchievementModal
            open={open}
            setOpen={setOpen}
            title="Ачивка"
            currentItem={currentItem}
            setCurrentItem={setCurrentItem}
            allPossibleUserAchievements={achievementsToDisplay}
            currentImageElement={currentImageElement}
            setCurrentImageElement={setCurrentImageElement}
          />
        )}
        {openTransferModal && (
          <TransferModal
            openTransferModal={openTransferModal}
            setOpenTransferModal={setOpenTransferModal}
            title="Перевод"
            selfMoney={Number(userData.balance) || 0}
            userData={userData}
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
    </>
  );
};

export default UserPage;
