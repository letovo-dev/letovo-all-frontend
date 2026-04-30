'use client';
import React, { useEffect, useState } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Typography, ConfigProvider, Spin, Flex, message, Input } from 'antd';
import authStore from '@/shared/stores/auth-store';
import { redirect } from 'next/navigation';
import style from './EnterForm.module.scss';
import { setDataToLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import userStore, { IUserData } from '@/shared/stores/user-store';
import CustomModal from './CustomForgetPassModal';
import { IUserStore } from '@/shared/stores/user-store';
import { getDataFromLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';

function EnterForm() {
  const { Title, Text } = Typography;
  const userStatus = authStore(state => state.userStatus);
  const userName = userStore((state: IUserStore) => state.store?.userData.username);
  const error = authStore(state => state.error);
  const [form] = Form.useForm();
  const loading = authStore(state => state.loading);
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [user, setUser] = useState<IUserData | null>(null);

  useEffect(() => {
    if (userStatus?.logged && userStatus?.registered) {
      setDataToLocaleStorage('token', userStatus?.token);
      redirect(`/user/${userName}`);
    } else if (userStatus?.logged && !userStatus?.registered) {
      redirect('/registration');
    }
  }, [userStatus]);

  useEffect(() => {
    authStore.setState({ error: undefined });
  }, []);

  useEffect(() => {
    try {
      const {
        state: {
          store: { userData },
        },
      } = getDataFromLocaleStorage('userStore');
      setUser(userData);
    } catch (e) {
      console.error('Failed to get user data:', e);
      setUser(null);
    }
  }, []);

  const onFinish = (values: any) => {
    authStore.getState().login({ ...values, last_user: user?.username });
  };

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => {
      return { ...prev, login: e.target.value || '' };
    });
  };

  const handlePassInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => {
      return { ...prev, password: e.target.value || '' };
    });
  };

  const showModal = () => {
    setOpen(true);
  };

  const disabledButton = !formData?.login || !formData?.password;

  const warning = () => {
    messageApi.open({
      type: 'warning',
      content:
        'Мы используем файлы cookie для повышения безопасности и предотвращения мошенничества. Нажимая «Войти», вы соглашаетесь на их использование. Собранные данные о ваших входах и устройстве не передаются третьим лицам.',
      className: 'custom-class',
      style: {
        marginTop: '77vh',
      },
      duration: 15,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      warning();
    }, 1000);
  }, []);

  return (
    <>
      {contextHolder}
      <div className={style.loginFormWrapper}>
        <Title level={4} className={style.titleBorder}>
          ВХОД
        </Title>
        <Form name="form" onFinish={onFinish} form={form}>
          <div className={style.card}>
            {loading && (
              <div className={style.spinWrapper}>
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
            )}
            <div className={style.inputsContainer}>
              <Text className={style.inputTextHeader} type="secondary">
                {'Логин'}
              </Text>
              <Form.Item
                name="login"
                initialValue={formData.login}
                className={!error ? style.inputForm : style.inputFormError}
              >
                <Input
                  type="text"
                  className={style.customInput}
                  placeholder=""
                  autoComplete="username"
                  onChange={handleNameInput}
                  value={formData.login || ''}
                />
              </Form.Item>
              <Text className={style.inputTextHeader} type="secondary">
                {'Пароль'}
              </Text>
              <Form.Item
                className={!error ? style.inputForm : style.inputFormError}
                name="password"
                initialValue={formData.password}
              >
                <Input
                  className={style.customInput}
                  type="password"
                  id="form_password"
                  onChange={handlePassInput}
                  autoComplete="current-password"
                  placeholder=""
                  value={formData.password || ''}
                />
              </Form.Item>

              {error && (
                <Flex vertical={false} justify={'center'} align={'center'} gap="small">
                  <ExclamationCircleOutlined style={{ color: '#FB4724' }} />
                  <Text type="danger">{error}</Text>
                </Flex>
              )}
            </div>
          </div>
          <div className={style.buttonsContainer}>
            <span className={style.forgetPass} onClick={() => showModal()}>
              забыли пароль
            </span>
            <Form.Item>
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      defaultHoverBorderColor: disabledButton ? '' : '#ffffff',
                      defaultHoverColor: disabledButton ? '' : '#ffffff',
                      defaultHoverBg: disabledButton ? '' : '#FB4724',
                      defaultActiveColor: '#ffffff',
                      defaultActiveBorderColor: '#ffffff',
                      defaultActiveBg: '#FB4724',
                      borderColorDisabled: '#b2b2b2',
                    },
                  },
                }}
              >
                <Button htmlType="submit" disabled={disabledButton} className={style.submitButton}>
                  Войти
                </Button>
              </ConfigProvider>
            </Form.Item>
          </div>
        </Form>
        {open && <CustomModal open={open} setOpen={setOpen} title="Забыли пароль?" />}
      </div>
    </>
  );
}

export default EnterForm;
