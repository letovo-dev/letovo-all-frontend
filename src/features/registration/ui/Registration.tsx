'use client';
import CustomSelect from '@/shared/ui/select/CustomSelect';
import { Button, Card, ConfigProvider, Input, Space, Typography, Form, Spin } from 'antd';
import React, { useEffect } from 'react';
import style from './Registration.module.scss';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import userStore from '@/shared/stores/user-store';
import authStore from '@/shared/stores/auth-store';
import { redirect } from 'next/navigation';
type FormData = {
  avatar?: string | undefined;
  nick?: string | undefined;
};

const Registration = () => {
  const changeLogin = userStore(state => state.changeLogin);
  const changeAvatar = userStore(state => state.setAvatar);
  const register = authStore(state => state.register);
  const error = userStore(state => state.error);
  const { Title, Text } = Typography;
  const [form] = Form.useForm();
  const [avatar, setAvatar] = React.useState<string | undefined>(undefined);
  const [nick, setNick] = React.useState<string | undefined>(undefined);
  const { registered } = authStore(state => state.userStatus);
  const userName = userStore(state => state.store.userData.username);
  const loading = userStore(state => state.loading);

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

  const onFinish = async (values: FormData) => {
    if (values.avatar && values.nick) {
      await changeLogin(values.nick);
      await changeAvatar(values.avatar);
      if (!error) {
        register();
      }
    }
  };

  useEffect(() => {
    if (registered) {
      redirect(`/user/${userName}`);
    }
  }, [registered]);

  if (loading) {
    return (
      <div className={style.loginFormWrapper}>
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
    <Space className={style.formWrapper}>
      <Title level={4}>РЕГИСТРАЦИЯ</Title>
      <Form form={form} onValuesChange={onValuesChange} onFinish={onFinish}>
        <Card>
          <Space>
            <Form.Item name="avatar">
              <CustomSelect />
            </Form.Item>
            <Space direction="vertical">
              <Text>Придумайте ник</Text>
              <Form.Item name="nick">
                <Input />
              </Form.Item>
            </Space>
          </Space>
        </Card>
        <Form.Item>
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultHoverBorderColor: '#ffffff',
                  defaultHoverColor: '#ffffff',
                  defaultHoverBg: '#FB4724',
                },
              },
            }}
          >
            <Space style={{ marginTop: '15px', width: '100%', justifyContent: 'end' }}>
              <Button
                htmlType="submit"
                disabled={!avatar || !nick || nick.length < 4}
                className={style.submitButton}
              >
                Войти
              </Button>
            </Space>
          </ConfigProvider>

          {/* <Text type="secondary">
                            {action === 'login' ? 'Already have an account?' : "Don't have an account?"}
                        </Text>{' '}
                        {action === 'login' ? <NavLink to="/signup">Signup</NavLink> : <NavLink to="/">Login</NavLink>} */}
        </Form.Item>
      </Form>
      <Card className={style.textCard}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space direction="horizontal" style={{ width: '100%' }}>
            {getIcon(avatar)}
            <Text className={avatar ? style.text : ''}>Выберете аватарку из доступного списка</Text>
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
      </Card>
    </Space>
  );
};

export default Registration;
