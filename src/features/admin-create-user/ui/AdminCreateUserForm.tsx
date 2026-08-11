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
  Upload,
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
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const accessLevels: Array<{
  value: AdminCreateUserPayload['userrights'];
  label: string;
  description: string;
}> = [
  {
    value: 'user',
    label: 'Пользователь',
    description: 'Обычный аккаунт без полномочий управления.',
  },
  {
    value: 'child',
    label: 'Ребёнок',
    description: 'Детский аккаунт: только одобренные общие аватары, без личной загрузки.',
  },
  {
    value: 'author',
    label: 'Автор (устаревший)',
    description:
      'Исторический уровень автора. Для новых аккаунтов предпочтителен «Публичный автор».',
  },
  {
    value: 'public_author',
    label: 'Публичный автор',
    description: 'Может публиковаться от своего имени в разрешённых разделах.',
  },
  {
    value: 'moder',
    label: 'Модератор',
    description: 'Расширенные права модерации. Назначайте только ответственным сотрудникам.',
  },
  {
    value: 'admin',
    label: 'Администратор',
    description: 'Полный административный доступ. Критически важное право.',
  },
];

const permissionCatalog = [
  {
    field: 'chattable',
    label: 'Доступ к чату',
    description: 'Разрешает другим пользователям начинать диалог с аккаунтом.',
  },
  {
    field: 'write_posts',
    label: 'Публикация записей',
    description: 'Разрешает создавать записи и новости.',
  },
  {
    field: 'admin',
    label: 'Администрирование',
    description: 'Даёт административные возможности. Высокий риск.',
  },
  {
    field: 'moder',
    label: 'Модерация',
    description: 'Разрешает модерировать пользовательский контент.',
  },
  {
    field: 'main_page',
    label: 'Главная страница',
    description: 'Разрешает управлять материалами главной страницы.',
  },
  {
    field: 'whireable',
    label: 'Участник переводов',
    description: 'Позволяет аккаунту участвовать в денежных переводах.',
  },
  {
    field: 'ava_upload',
    label: 'Загрузка личного аватара',
    description: 'Разрешает загружать собственные изображения профиля; недоступно детям.',
  },
] as const;

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
  whireable: false,
  ava_upload: true,
};

export const AdminCreateUserForm = () => {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [roles, setRoles] = useState<DepartmentRoleOption[]>([]);
  const [loadingDictionaries, setLoadingDictionaries] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File>();
  const [createdUsername, setCreatedUsername] = useState<string>();
  const userrights = userStore(state => state.store.userData.userrights);
  const [messageApi, contextHolder] = message.useMessage();

  const isAdmin = userrights === 'admin';
  const selectedUserrights = Form.useWatch('userrights', form);
  const selectedAccessLevel = accessLevels.find(option => option.value === selectedUserrights);

  useEffect(() => {
    if (selectedUserrights === 'child') {
      form.setFieldValue(['role_rights', 'ava_upload'], false);
      setAvatarFile(undefined);
    }
  }, [form, selectedUserrights]);

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
        label: `${role.rolename} · ранг ${role.rang} · выплата ${role.payment}`,
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
    if (createdUsername && createdUsername !== values.username) {
      void messageApi.error(
        `Аккаунт ${createdUsername} уже создан. Верните прежний username, чтобы повторить загрузку аватара.`,
      );
      return;
    }
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
        whireable: values.role_rights?.whireable ?? false,
        ava_upload:
          values.userrights === 'child' ? false : (values.role_rights?.ava_upload ?? false),
      },
    };

    if (!createdUsername) {
      const response = await SERVICES_AUTH.Auth.adminCreateUser(payload);
      if (!response.success || response.code !== 201) {
        setSubmitting(false);
        void messageApi.error(response.codeMessage || 'Не удалось создать аккаунт');
        return;
      }
      setCreatedUsername(values.username);
    }

    if (avatarFile) {
      const upload = await SERVICES_USERS.UsersData.uploadPersonalAvatar(
        avatarFile,
        values.username,
      );
      if (!upload.success || upload.code !== 200 || !upload.data?.file) {
        setSubmitting(false);
        void messageApi.error(
          upload.codeMessage ||
            'Аккаунт создан, но загрузить аватар не удалось. Повторите попытку.',
        );
        return;
      }
      const assignment = await SERVICES_USERS.UsersData.setAvatar({
        avatar: upload.data.file,
        username: values.username,
      });
      if (!assignment.success || assignment.code !== 200) {
        setSubmitting(false);
        void messageApi.error(
          assignment.codeMessage || 'Файл загружен, но аватар не установлен. Повторите попытку.',
        );
        return;
      }
    }

    setSubmitting(false);
    void messageApi.success(avatarFile ? 'Аккаунт и аватар созданы' : 'Аккаунт создан');
    router.push(`/user/${values.username}`);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FB4724',
          colorText: '#1F2937',
          colorTextHeading: '#111827',
          colorBgContainer: '#FFFFFF',
          colorBorder: '#D1D5DB',
        },
      }}
    >
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
            <div>
              <Form.Item name="userrights" label="Уровень доступа" rules={[{ required: true }]}>
                <Select
                  options={accessLevels.map(option => ({
                    value: option.value,
                    label: `${option.label} (${option.value})`,
                  }))}
                />
              </Form.Item>
              <Typography.Text type="secondary" className={style.accessDescription}>
                {selectedAccessLevel?.description}
              </Typography.Text>
            </div>
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
            <div className={style.fullWidth}>
              <Typography.Title level={5}>Права доступа</Typography.Title>
              <div className={style.rightsGrid}>
                {permissionCatalog.map(permission => (
                  <Form.Item
                    key={permission.field}
                    name={
                      permission.field === 'chattable'
                        ? 'chattable'
                        : ['role_rights', permission.field]
                    }
                    valuePropName="checked"
                  >
                    <Checkbox
                      disabled={permission.field === 'ava_upload' && selectedUserrights === 'child'}
                    >
                      <span className={style.permissionLabel}>{permission.label}</span>
                      <Typography.Text type="secondary" className={style.permissionDescription}>
                        {permission.description}
                      </Typography.Text>
                    </Checkbox>
                  </Form.Item>
                ))}
              </div>
            </div>
            <div className={style.fullWidth}>
              <Typography.Title level={5}>Аватар (необязательно)</Typography.Title>
              <Upload
                accept="image/png,image/jpeg,image/webp"
                maxCount={1}
                showUploadList={false}
                disabled={selectedUserrights === 'child'}
                beforeUpload={file => {
                  if (!AVATAR_TYPES.has(file.type)) {
                    void messageApi.error('Поддерживаются только PNG, JPEG и WebP');
                    return Upload.LIST_IGNORE;
                  }
                  if (file.size > MAX_AVATAR_SIZE) {
                    void messageApi.error('Размер аватара не должен превышать 5 МБ');
                    return Upload.LIST_IGNORE;
                  }
                  setAvatarFile(file);
                  return Upload.LIST_IGNORE;
                }}
              >
                <Button disabled={selectedUserrights === 'child'}>Выбрать изображение</Button>
              </Upload>
              <Typography.Text type="secondary" className={style.avatarHint}>
                {selectedUserrights === 'child'
                  ? 'Для детского аккаунта личная загрузка запрещена политикой безопасности.'
                  : avatarFile?.name || 'PNG, JPEG или WebP, не более 5 МБ'}
              </Typography.Text>
            </div>
          </div>
          <Form.Item className={style.actions}>
            <Space>
              <Button
                htmlType="button"
                onClick={() => {
                  form.resetFields();
                  setAvatarFile(undefined);
                  setCreatedUsername(undefined);
                }}
              >
                Сбросить
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {createdUsername ? 'Повторить загрузку аватара' : 'Создать аккаунт'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </main>
    </ConfigProvider>
  );
};
