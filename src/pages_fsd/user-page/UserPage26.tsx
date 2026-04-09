'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import style from './UserPage26.module.scss';
import userStore, { IUserAchData, IUserStore } from '@/shared/stores/user-store';
import { ConfigProvider, Form, Spin, message, Button, Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import authStore from '@/shared/stores/auth-store';
import { setDataToLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import dataStore from '@/shared/stores/data-store';
import GetAvatars from '@/features/getAvatars';
import Image from 'next/image';
import { AchievementModal } from '@/entities/achievement/ui/modal';
import { TransferModal } from '@/features/moneyTranfer/ui';
import OnBoard from './ui/OnBoard';
import UserData from './ui/UserData';
import AchieveBlockMobile from './ui/AchieveBlockMobile';
import { ImgWithBackground } from '@/shared/ui/image-background';
import { generateKey } from '@/shared/api/utils';
import AchieveBlock from './ui/AchieveBlock';
import Money26 from './ui/Money26';
import { FileSearchOutlined } from '@ant-design/icons';
import Collapse from './ui/Collapse';
import CollapseBody from './ui/CollapseBody';
import AchieveBlockMobile26 from './ui/AchieveBlockMobile26';

const DONE_ACH = '/images/aceehimnstv/loched.png';

const departments: {
  [key: string]: {
    color: string;
    borderColor: string;
    iconColor: string;
    name: string;
    icon: string;
  };
} = {
  '1': {
    color: 'var(--it-header)',
    borderColor: 'var(--it-border)',
    iconColor: 'var(--it-icon)',
    name: 'IT',
    icon: '/26_it.svg',
  },
  '2': {
    color: 'var(--management-header)',
    borderColor: 'var(--management-border)',
    iconColor: 'var(--management-icon)',
    name: 'Менеджмент',
    icon: '/26_management.svg',
  },
  '3': {
    color: 'var(--enginery-header)',
    borderColor: 'var(--enginery-border)',
    iconColor: 'var(--enginery-icon)',
    name: 'Инженерный',
    icon: '/26_engineer.svg',
  },
  '4': {
    color: 'var(--public-relations-header)',
    borderColor: 'var(--public-relations-border)',
    iconColor: 'var(--public-relations-icon)',
    name: 'Связи с общественностью',
    icon: '/26_x.svg',
  },
  '5': {
    color: 'var(--design-header)',
    borderColor: 'var(--design-border)',
    iconColor: 'var(--design-icon)',
    name: 'Арт',
    icon: '/26_design.svg',
  },
  '6': {
    color: 'var(--science-header)',
    borderColor: 'var(--science-border)',
    iconColor: 'var(--science-icon)',
    name: 'Наука',
    icon: '/26_science.svg',
  },
  '7': {
    color: 'var(--proj-header)',
    borderColor: 'var(--proj-border)',
    iconColor: 'var(--proj-icon)',
    name: 'Проект 11',
    icon: '/26_proj11.svg',
  },
  '8': {
    color: 'var(--proj-header)',
    borderColor: 'var(--proj-border)',
    iconColor: 'var(--proj-icon)',
    name: 'Клуб',
    icon: '/26_proj11.svg',
  },
  '10': {
    color: 'var(--design-header)',
    borderColor: 'var(--design-border)',
    iconColor: 'var(--design-icon)',
    name: 'Дизайн',
    icon: '/26_design.svg',
  },
  '11': {
    color: 'var(--x-header)',
    borderColor: 'var(--x-border)',
    iconColor: 'var(--x-icon)',
    name: 'Х',
    icon: '/26_x.svg',
  },
};

const UserPage26 = () => {
  const router = useRouter();
  const { getAllUserAchievements, getAchievementsDepartment, getUserAchievements } = userStore(
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
  const { userAchievements } = userStore.getState().store;
  const [currentImageElement, setCurrentImageElement] = useState<JSX.Element | null>(null);
  const [userData, setUserData] = useState(userStore.getState().store.userData);
  const [isLoading, setIsLoading] = useState(true);
  const { error, loading } = userStore((state: IUserStore) => state);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const { getAllPostsAuthors } = userStore.getState();
  const [messageApi, contextHolder] = message.useMessage();

  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [currentAchievements, setCurrentAchievements] = useState<string>('all');
  const [openCollapseIndex, setOpenCollapseIndex] = useState<number | null>(0);
  const [viewSection, setViewSection] = useState<string>('career');

  const achievementsToDisplay = useMemo(() => {
    return currentAchievements === 'all' ? achievements : departmentAchievements;
  }, [currentAchievements, achievements, departmentAchievements]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
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
        getUserAchievements(initialData.username);
      }
      if (initialData?.userrights === 'admin' || initialData?.userrights === 'moder') {
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
      duration: 1,
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
  console.log(userData);
  console.log(userAchievements);
  console.log(achievements);

  return (
    <>
      <section aria-label="Профиль пользователя" className={style.userBlock}>
        <div className={style.icons}>
          <div className={style.userIcon}>
            <Avatar
              src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${userData.avatar_pic}`}
              size={80}
              className={style.avatar}
            />
          </div>
          <Image
            className={style.depIcon}
            src={departments[userData.departmentid].icon}
            alt="icon"
            height={80}
            width={80}
          />
        </div>
        <div className={style.userData}>
          <h1 className={style.userName}>{userData.display_name.toUpperCase()}</h1>
          <p className={style.status}>{userOnBoard}</p>
          <div className={style.depData}>
            <p className={style.depName}>{`${departments[userData.departmentid].name} >`}</p>
            <p className={style.branchName}>{userData?.brigadename ?? 'xxxxx'}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Выйти"
          className={style.menuButtonDiv}
          onClick={() => logout()}
        >
          <Image className={style.logout} src="/26_logout.svg" alt="exit" height={20} width={20} />
        </button>
      </section>
      <section aria-label="Финансы" className={style.moneyBlock}>
        <Money26 userData={userData} />
        <div className={style.salary}>
          <p className={style.salaryText}>Заработная плата</p>
          <p className={style.salarySum}>{`${userData?.paycheck} энк / д.`}</p>
        </div>
        <div className={style.transferBlock}>
          <Button className={style.transferButton}>
            Перевести
            <Image
              className={style.icon}
              src="/26_refresh.svg"
              alt="wallet"
              height={13}
              width={20}
            />
          </Button>
          <div className={style.moneyActions}>
            <div className={style.moneyActionLine}>
              <p className={style.moneyText}>последний приход</p>
              <p className={style.moneyPlus}>{`+${userData.last_incoming_payment?.amount ?? 0}`}</p>
            </div>
            <div className={style.moneyActionLine}>
              <p className={style.moneyText}>последний платеж</p>
              <p
                className={style.moneyMinus}
              >{`-${userData.last_outgoing_payment?.amount ?? 0}`}</p>
            </div>
          </div>
        </div>
      </section>
      <section aria-label="Карьера и достижения" className={style.careerAndAchievementsBlock}>
        <button
          type="button"
          className={`${style.tabButton} ${viewSection === 'career' ? style.tabButtonActive : ''}`}
          onClick={() => setViewSection('career')}
        >
          <Image src="/26_career.svg" alt="" height={18} width={18} />
          Карьера
        </button>
        <button
          type="button"
          className={`${style.tabButton} ${viewSection === 'achievements' ? style.tabButtonActive : ''}`}
          onClick={() => setViewSection('achievements')}
        >
          Достижения
          <Image src="/26_achive.svg" alt="" height={18} width={18} />
        </button>
      </section>

      {viewSection === 'career' && (
        <section aria-label="Карьера" className={style.careerBlock}>
          <button type="button" className={style.careerViewButton}>
            Посмотреть развитие карьеры на карте
            <Image src="/26_arrowUp.svg" alt="" height={12} width={12} />
          </button>
          <div className={style.collapseContainer}>
            {/* {[
            {
              leftText: 'Карьера',
              rightText: 'Активна',
              children: <p>Текущая позиция: Junior Developer. Следующий уровень — Middle.</p>,
            },
            {
              leftText: 'Достижения',
              rightText: 'Прогресс',
              children: (
                <div>
                  {Array.from({ length: 15 }, (_, i) => (
                    <p key={i}>Достижение {i + 1} — выполнено</p>
                  ))}
                </div>
              ),
            },
            {
              leftText: 'Навыки',
              rightText: 'Обновлено',
              children: <p>TypeScript, React, Next.js, Zustand</p>,
            },
            {
              leftText: 'Проекты',
              rightText: '3 активных',
              children: <p>Проект A, Проект B, Проект C</p>,
            },
            { leftText: 'Задачи', rightText: 'В работе', children: <p>Задача 1, Задача 2</p> },
            { leftText: 'Обучение', rightText: 'Идёт', children: <p>Курс по архитектуре</p> },
            { leftText: 'Отчёты', rightText: 'Актуально', children: <p>Отчёт за апрель 2026</p> },
            { leftText: 'Цели', rightText: 'Q2 2026', children: <p>Повышение до Middle</p> },
          ].map(({ leftText, rightText, children }, i) => (
            <Collapse
              key={leftText}
              leftText={leftText}
              rightText={rightText}
              isOpen={openCollapseIndex === i}
              onToggle={() => setOpenCollapseIndex(prev => (prev === i ? null : i))}
              headerColor={departments[userData.departmentid].color}
              dotColor={departments[userData.departmentid].iconColor}
              borderColor={departments[userData.departmentid].borderColor}
            >
              {children}
            </Collapse>
          ))} */}
            {userAchievements?.achivements?.map((achivement, i) => (
              <Collapse
                key={`${i}-${userAchievements?.username}`}
                leftText={achivement.role}
                rightText={`${achivement.department} | ${achivement.chapter} | ${achivement.year}`}
                isOpen={openCollapseIndex === i}
                onToggle={() => setOpenCollapseIndex(prev => (prev === i ? null : i))}
                headerColor={departments[userData.departmentid].color}
                dotColor={departments[userData.departmentid].iconColor}
                borderColor={departments[userData.departmentid].borderColor}
              >
                <CollapseBody
                  departmentIcon={departments[userData.departmentid].icon}
                  brigade={(achivement as any).brigade}
                  post={(achivement as any).Post}
                  achivements={achivement.achivements}
                  iconColor={departments[userData.departmentid].iconColor}
                />
                <></>
              </Collapse>
            ))}
          </div>
        </section>
      )}
      {viewSection === 'achievements' && (
        <div className={style.achievementsBlockContainer}>
          <div className={style.titleInfo}>
            <h5 className={style.title}>Корпоративные достижения</h5>
            <div className={style.info}>
              <span className={style.a}>30</span>
              <span className={style.b}>/50</span>
            </div>
          </div>

          <section aria-label="Достижения" className={style.achievementsBlock}>
            {achievementsToDisplay &&
              achievementsToDisplay.length > 0 &&
              (windowWidth <= 960 ? (
                <AchieveBlockMobile26
                  achievements={achievementsToDisplay ?? []}
                  openModal={openModal}
                />
              ) : (
                <div className={style.achieveBlockContainer}>
                  <AchieveBlock achievements={achievementsToDisplay ?? []} openModal={openModal} />
                </div>
              ))}
          </section>
        </div>
      )}

      {contextHolder}
    </>
  );
};

export default UserPage26;
