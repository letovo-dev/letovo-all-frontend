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
  console.log('error --', error);
  const [form] = Form.useForm();

  useEffect(() => {
    if (authed || userData?.authed) {
      redirect('/');
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

  console.log(formData);

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
                // Seed Token
                colorPrimary: '#ffa39e',
                borderRadius: 20,

                // Alias Token
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
                placeholder="Kotya"
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
                placeholder="Password"
                onChange={handlePassChange}
              />
            </Form.Item>
          </ConfigProvider>

          {/* <div>
                        <Form.Item
                            name="remember"
                            valuePropName="checked"
                            style={{ visibility: 'visible', marginBottom: 10 }}
                        >
                            <Checkbox style={{ visibility: 'visible' }}>
                                <Text type="secondary">Remember me</Text>
                            </Checkbox>
                        </Form.Item>
                        {action === 'login' ? (
                            <div style={{ marginBottom: 10 }}>
                                <a href="">Forgot password</a>
                            </div>
                        ) : null}
                    </div> */}
          <div className={style.textMessage}>{error && <Text type="danger">{error}</Text>}</div>
        </Card>
        <div className={style.buttonsContainer}>
          <Button color="default" variant="link">
            <span className={style.forgetPass}> забыл пароль</span>
          </Button>
          <Form.Item>
            <Button
              type="primary"
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
      {/* </Spin> */}
    </div>
  );
}

export default EnterForm;
