'use client';
import CustomSelect from '@/shared/ui/select/CustomSelect';
import { useRouter } from 'next/navigation';
import { Button, ConfigProvider, Space, Typography, Form, Spin, Flex } from 'antd';
import React, { useEffect, useState } from 'react';
import style from './Registration.module.scss';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import userStore, { IUserStore } from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import dataStore from '@/shared/stores/data-store';
import Avatar from '@/shared/ui/avatar';
type FormData = {
  avatar?: string | undefined;
  nick?: string | undefined;
};

const Registration = () => {
  const changeLogin = userStore((state: IUserStore) => state.changeLogin);
  const changeAvatar = userStore((state: IUserStore) => state.setAvatar);
  const register = authStore(state => state.register);
  const getAvatars = dataStore(state => state.getAvatars);
  const avatars = dataStore(state => state.data?.avatars);
  const error = authStore(state => state.error);
  const userStatus = authStore(state => state.userStatus);
  const { Title, Text } = Typography;
  const [form] = Form.useForm();
  const [avatar, setAvatar] = React.useState<string | undefined>('');
  const [nick, setNick] = React.useState<string | undefined>('');
  const registered = authStore(state => state.userStatus?.registered);
  const userName = userStore((state: IUserStore) => state.store.userData.username);
  const loading = userStore((state: IUserStore) => state.loading);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (registered) {
      router.push(`/user/${userName}`);
    }
    if (!userStatus?.authed) {
      router.push('/login');
    } else {
      getAvatars();
    }
  }, [registered, userName, router]);

  const onValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.avatar) {
      setAvatar(changedValues.avatar);
    }
    if (changedValues.nick) {
      setNick(changedValues.nick);
    }
  };

  const NICK_VALID = /^[a-zA-Z0-9_-]{4,32}$/;

  const getIcon = (value: string | undefined) => {
    if (value && NICK_VALID.test(value)) {
      return <CheckCircleOutlined className={style.icon} />;
    } else {
      return <MinusCircleOutlined className={style.icon} />;
    }
  };

  const NICK_RE = /^[a-zA-Z0-9_-]{4,32}$/;

  const onFinish = async (values: FormData) => {
    if (values.avatar && values.nick) {
      if (!NICK_RE.test(values.nick)) return;
      await changeLogin(values.nick);
      await changeAvatar(values.avatar);
      if (!error) {
        register();
      }
    }
  };

  const toggleVisible = () => {
    setVisible(!visible);
  };

  if (loading) {
    return (
      <div className={style.formWrapper}>
        {loading && (
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FB4724',
              },
            }}
          >
            <Spin size={'large'} />
          </ConfigProvider>
        )}
      </div>
    );
  }

  return (
    <>
      <Space className={style.formWrapper}>
        <div className={style.titleBorder}>
          <Title level={4}>Настройка профиля</Title>
        </div>
        <Form form={form} onValuesChange={onValuesChange} onFinish={onFinish}>
          <div className={style.form}>
            <div
              className={!avatar ? style.selectPhoto : style.avatarTemplate}
              onClick={() => {
                toggleVisible();
              }}
            >
              <Form.Item name="avatar" initialValue={avatar} className={style.selectPhotoFormItem}>
                <CustomSelect
                  visible={visible}
                  setVisible={setVisible}
                  value={avatar}
                  onChange={value => {
                    form.setFieldsValue({ avatar: value });
                    setAvatar(value);
                  }}
                  avatars={avatars}
                />
              </Form.Item>
              {Avatar(avatar, 50)}
            </div>
            <Space direction="vertical" className={style.nickBox}>
              <Text>Придумайте ник</Text>
              <Form.Item
                name="nick"
                initialValue={nick}
                className={!error ? style.inputForm : style.inputFormError}
              >
                <input
                  type="text"
                  className={style.customInput}
                  placeholder="Nickname"
                  autoComplete="username"
                  value={nick || ''}
                  maxLength={32}
                />
              </Form.Item>
              {error && (
                <Flex vertical={false} justify={'center'} align={'center'} gap="small">
                  <ExclamationCircleOutlined className={style.warning} />
                  <Text className={style.warning}>{error}</Text>
                </Flex>
              )}
            </Space>
          </div>
          <Form.Item>
            <ConfigProvider
              theme={{
                components: {
                  Button: {
                    defaultHoverBorderColor: '#ffffff',
                    defaultHoverColor: '#ffffff',
                    defaultHoverBg: '#FB4724',
                    defaultActiveColor: '#ffffff',
                    defaultActiveBorderColor: '#ffffff',
                    defaultActiveBg: '#FB4724',
                  },
                },
              }}
            >
              <Space style={{ marginTop: '15px', width: '90%', justifyContent: 'end' }}>
                <Button
                  htmlType="submit"
                  disabled={!avatar || !nick || !/^[a-zA-Z0-9_-]{4,32}$/.test(nick)}
                  className={style.submitButton}
                >
                  Продолжить
                </Button>
              </Space>
            </ConfigProvider>
          </Form.Item>
        </Form>
        <div className={style.infoPanel}>
          <Space direction="vertical" style={{ width: '80%' }}>
            <Space direction="horizontal" style={{ width: '100%' }}>
              {getIcon(avatar)}
              <Text className={avatar ? style.text : ''}>
                Выберете аватарку из доступного списка
              </Text>
            </Space>
            <Space direction="horizontal" style={{ width: '100%' }}>
              {getIcon(nick)}
              <Text className={nick && /^[a-zA-Z0-9_-]{4,32}$/.test(nick) ? style.text : ''}>
                Ник: 4–32 символа, только латинские буквы, цифры, _ и -
              </Text>
            </Space>
            <Space direction="horizontal" style={{ width: '100%' }}>
              <ExclamationCircleOutlined className={style.icon} />
              <Text className={style.warnText}>
                В нике запрещено использовать нецензурную лексику
              </Text>
            </Space>
          </Space>
        </div>
      </Space>
    </>
  );
};

export default Registration;
