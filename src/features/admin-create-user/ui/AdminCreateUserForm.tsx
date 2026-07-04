'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  Select,
  Space,
  Typography,
  message,
} from 'antd';
import { useRouter } from 'next/navigation';
import { SERVICES_AUTH } from '@/shared/api/auth';
import { SERVICES_USERS } from '@/shared/api/user';
import userStore from '@/shared/stores/user-store';
import { generateAdminPassword } from '../lib/password';
import {
  AdminCreateUserPayload,
  AdminRoleRights,
  DepartmentOption,
  DepartmentRoleOption,
} from '../model/types';
import style from './AdminCreateUserForm.module.scss';

const USERNAME_RE = /^[A-Za-z0-9_-]{4,32}$/;

type FormValues = Omit<AdminCreateUserPayload, 'role_id' | 'role_rights'> & {
  department_id?: number;
  role_id?: number;
  role_rights?: Partial<AdminRoleRights>;
};

const defaultRoleRights: AdminRoleRights = {
  write_posts: false,
  admin: false,
  moder: false,
  main_page: false,
};

export const AdminCreateUserForm = () => {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [roles, setRoles] = useState<DepartmentRoleOption[]>([]);
  const [loadingDictionaries, setLoadingDictionaries] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const userrights = userStore(state => state.store.userData.userrights);
  const [messageApi, contextHolder] = message.useMessage();

  const isAdmin = userrights === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      router.push('/news');
    }
  }, [isAdmin, router]);

  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDictionaries(true);
      const response = await SERVICES_USERS.UsersData.getDepartments();
      if (response.success && response.data && 'result' in response.data) {
        setDepartments(response.data.result);
      } else {
        void messageApi.error('Не удалось загрузить департаменты');
      }
      setLoadingDictionaries(false);
    };

    if (isAdmin) {
      void loadDepartments();
    }
  }, [isAdmin, messageApi]);

  const departmentOptions = useMemo(
    () =>
      departments
        .filter(department => department.departmentname)
        .map(department => ({
          value: Number(department.departmentid),
          label: department.departmentname,
        })),
    [departments],
  );

  const roleOptions = useMemo(
    () =>
      roles.map(role => ({
        value: Number(role.roleid),
        label: `${role.rolename} (${role.rang})`,
      })),
    [roles],
  );

  const onDepartmentChange = async (departmentId: number) => {
    form.setFieldsValue({ role_id: undefined });
    setRoles([]);
    const response = await SERVICES_USERS.UsersData.getDepartmentRoles(departmentId);
    if (response.success && response.data && 'result' in response.data) {
      setRoles(response.data.result);
    } else {
      void messageApi.error('Не удалось загрузить должности');
    }
  };

  const validateUsernameUnique = async (_: unknown, value?: string) => {
    if (!value || !USERNAME_RE.test(value)) {
      return Promise.resolve();
    }

    const response = await SERVICES_USERS.UsersData.isUser(value);
    const data = response.data as { status?: string } | undefined;
    if (response.success && data?.status === 't') {
      return Promise.reject(new Error('Такой username уже занят'));
    }
    return Promise.resolve();
  };

  const onGeneratePassword = () => {
    form.setFieldValue('password', generateAdminPassword());
  };

  const onFinish = async (values: FormValues) => {
    setSubmitting(true);
    const payload: AdminCreateUserPayload = {
      username: values.username,
      display_name: values.display_name || values.username,
      password: values.password,
      chattable: values.chattable,
      userrights: values.userrights,
      role_id: values.role_id ?? 0,
      active: true,
      registered: true,
      role_rights: {
        write_posts: values.role_rights?.write_posts ?? false,
        admin: values.role_rights?.admin ?? false,
        moder: values.role_rights?.moder ?? false,
        main_page: values.role_rights?.main_page ?? false,
      },
    };

    const response = await SERVICES_AUTH.Auth.adminCreateUser(payload);
    setSubmitting(false);

    if (response.success && response.code === 201) {
      void messageApi.success('Аккаунт создан');
      router.push(`/user/${values.username}`);
      return;
    }

    void messageApi.error(response.codeMessage || 'Не удалось создать аккаунт');
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#FB4724' } }}>
      {contextHolder}
      <main className={style.shell}>
        <div className={style.header}>
          <Typography.Title level={3}>Создание аккаунта</Typography.Title>
        </div>
        <Form<FormValues>
          form={form}
          layout="vertical"
          initialValues={{
            chattable: false,
            userrights: 'user',
            active: true,
            registered: true,
            role_rights: defaultRoleRights,
          }}
          onFinish={onFinish}
        >
          <div className={style.grid}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Укажите username' },
                { pattern: USERNAME_RE, message: '4-32 символа: латиница, цифры, _ и -' },
                { validator: validateUsernameUnique },
              ]}
            >
              <Input autoComplete="off" maxLength={32} />
            </Form.Item>
            <Form.Item name="display_name" label="Отображаемое имя">
              <Input autoComplete="off" maxLength={64} />
            </Form.Item>
            <Form.Item
              name="password"
              label="Пароль"
              rules={[
                { required: true, message: 'Укажите пароль' },
                { min: 8, message: 'Минимум 8 символов' },
              ]}
            >
              <Input.Password
                autoComplete="new-password"
                addonAfter={
                  <Button type="link" onClick={onGeneratePassword}>
                    Сгенерировать
                  </Button>
                }
              />
            </Form.Item>
            <Form.Item name="userrights" label="Права пользователя" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'user', label: 'user' },
                  { value: 'moder', label: 'moder' },
                  { value: 'public_author', label: 'public_author' },
                  { value: 'admin', label: 'admin' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="department_id"
              label="Департамент"
              rules={[{ required: true, message: 'Выберите департамент' }]}
            >
              <Select
                loading={loadingDictionaries}
                options={departmentOptions}
                onChange={onDepartmentChange}
              />
            </Form.Item>
            <Form.Item
              name="role_id"
              label="Должность"
              rules={[{ required: true, message: 'Выберите должность' }]}
            >
              <Select disabled={!roles.length} options={roleOptions} />
            </Form.Item>
            <Form.Item name="chattable" valuePropName="checked">
              <Checkbox>Доступ к чату</Checkbox>
            </Form.Item>
            <div className={style.fullWidth}>
              <Typography.Text>Дополнительные права</Typography.Text>
              <div className={style.rightsGrid}>
                <Form.Item name={['role_rights', 'write_posts']} valuePropName="checked">
                  <Checkbox>write_posts</Checkbox>
                </Form.Item>
                <Form.Item name={['role_rights', 'admin']} valuePropName="checked">
                  <Checkbox>admin</Checkbox>
                </Form.Item>
                <Form.Item name={['role_rights', 'moder']} valuePropName="checked">
                  <Checkbox>moder</Checkbox>
                </Form.Item>
                <Form.Item name={['role_rights', 'main_page']} valuePropName="checked">
                  <Checkbox>main_page</Checkbox>
                </Form.Item>
              </div>
            </div>
          </div>
          <Form.Item className={style.actions}>
            <Space>
              <Button htmlType="button" onClick={() => form.resetFields()}>
                Сбросить
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Создать аккаунт
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </main>
    </ConfigProvider>
  );
};
