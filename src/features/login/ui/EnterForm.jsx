'use client';
import React, { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Card, Typography, ConfigProvider } from 'antd';
import { authStore } from '@/shared/stores/auth-store';
import { redirect } from 'next/navigation';
import style from './EnterForm.module.scss';

function EnterForm() {
  const { Title, Text } = Typography;
  const authed = authStore(state => state.userData.authed);
  const error = authStore(state => state.error);
  const user = localStorage.getItem('user');
  const userData = JSON.parse(user);
  const [form] = Form.useForm();

  useEffect(() => {
    if (userData?.login && (authed || userData?.authed)) {
      redirect(`/user/${userData.login}`);
    }
  }, [authed, userData]);

  const [formData, setFormData] = useState({ login: undefined, password: undefined });

  const onFinish = async values => {
    authStore.getState().login(values);
  };

  const handleNameChange = e => {
    setFormData(prev => {
      return { ...prev, login: e.target.value };
    });
  };

  const handlePassChange = e => {
    setFormData(prev => {
      return { ...prev, password: e.target.value };
    });
  };

  return (
    <div className={style.loginFormWrapper}>
      <Title level={4}>ВХОД</Title>
      <Form
        name="form"
        // initialValues={
        //     action === 'login'
        //         ? { email: user.remember ? user.email : '', remember: user.remember }
        //         : { remember: true }
        // }
        // style={{ minWidth: '100%' }}
        onFinish={onFinish}
        form={form}
      >
        <Card>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FB4724',
                borderRadius: 20,
                colorBgContainer: 'rgba(5,5,5,0.06)',
              },
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <Text type="secondary">{'Логин'}</Text>
            </div>
            <Form.Item name="login" rules={[{ required: true, message: 'Введите логин' }]}>
              <Input
                onChange={handleNameChange}
                className={style.inputForm}
                prefix={<UserOutlined />}
                placeholder="Nickname"
              />
            </Form.Item>
            <div style={{ marginBottom: '10px' }}>
              <Text type="secondary">{'Пароль'}</Text>
            </div>
            <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
              <Input
                className={style.inputForm}
                prefix={<LockOutlined />}
                type="password"
                placeholder="123abc"
                onChange={handlePassChange}
              />
            </Form.Item>
          </ConfigProvider>
          <div className={style.textMessage}>{error && <Text type="danger">{error}</Text>}</div>
        </Card>
        <div className={style.buttonsContainer}>
          <Button color="default" variant="link">
            <span className={style.forgetPass}> забыл пароль</span>
          </Button>
          <Form.Item>
            <Button
              type="primary"
              color="#FB4724"
              htmlType="submit"
              style={{ marginRight: 20 }}
              disabled={!formData.login || !formData.password}
            >
              Войти
            </Button>

            {/* <Text type="secondary">
                            {action === 'login' ? 'Already have an account?' : "Don't have an account?"}
                        </Text>{' '}
                        {action === 'login' ? <NavLink to="/signup">Signup</NavLink> : <NavLink to="/">Login</NavLink>} */}
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}

export default EnterForm;
