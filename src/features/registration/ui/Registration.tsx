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
import userStore from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import dataStore from '@/shared/stores/data-store';
import { setDataToLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import Avatar from '@/shared/ui/avatar';
type FormData = {
  avatar?: string | undefined;
  nick?: string | undefined;
};

const Registration = () => {
  const changeLogin = userStore(state => state.changeLogin);
  const changeAvatar = userStore(state => state.setAvatar);
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
  const userName = userStore(state => state.store.userData.username);
  const loading = userStore(state => state.loading);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!userStatus?.token || !userStatus?.authed) {
      router.push('./login');
    }
    getAvatars();
    if (registered) {
      router.push(`/user/${userName}`);
    }
  }, [registered, userName, router, userStatus?.authed, userStatus?.token]);

  const onValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.avatar) {
      setAvatar(changedValues.avatar);
    }
    if (changedValues.nick) {
      setNick(changedValues.nick);
    }
  };

  const getIcon = (value: string | undefined) => {
    if (value && value.length > 3) {
      return <CheckCircleOutlined className={style.icon} />;
    } else {
      return <MinusCircleOutlined className={style.icon} />;
    }
  };

  useEffect(() => {
    setDataToLocaleStorage('token', userStatus?.token);
  }, [userStatus?.token]);

  const onFinish = async (values: FormData) => {
    if (values.avatar && values.nick) {
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
              {Avatar(avatar, { width: 40, height: 40 })}
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
                  disabled={!avatar || !nick || nick.length < 4}
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
              <Text className={nick && nick.length >= 4 ? style.text : ''}>
                Ник должен состоять не менее чем из 4 символов
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
