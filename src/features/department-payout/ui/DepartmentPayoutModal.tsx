'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, InputNumber, Modal, Select, Spin, Typography, message } from 'antd';
import { SERVICES_USERS } from '@/shared/api/user';
import type { DepartmentOption } from '@/features/admin-create-user/model/types';
import type { DepartmentPayoutResponse } from '@/shared/api/user/models/departmentPayout';

interface DepartmentPayoutModalProps {
  open: boolean;
  onClose: () => void;
  onApplied: () => Promise<void> | void;
}

interface FormValues {
  department_id: number;
  amount: number;
}

const newRequestId = () => crypto.randomUUID();

export const DepartmentPayoutModal: React.FC<DepartmentPayoutModalProps> = ({
  open,
  onClose,
  onApplied,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [preview, setPreview] = useState<DepartmentPayoutResponse | null>(null);
  const [result, setResult] = useState<DepartmentPayoutResponse | null>(null);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setPreview(null);
    setResult(null);
    setRequestId(newRequestId());
    setLoadingDepartments(true);
    void SERVICES_USERS.UsersData.getDepartments().then(response => {
      if (response.success && response.data && 'result' in response.data) {
        setDepartments(response.data.result);
      } else {
        void messageApi.error('Не удалось загрузить департаменты');
      }
      setLoadingDepartments(false);
    });
  }, [form, messageApi, open]);

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

  const showError = (fallback: string, response: { codeMessage?: string; message?: string }) => {
    void messageApi.error(response.codeMessage || response.message || fallback);
  };

  const previewPayout = async (values: FormValues) => {
    setSubmitting(true);
    const response = await SERVICES_USERS.UsersData.departmentPayout({
      ...values,
      amount: Math.floor(values.amount),
      request_id: requestId,
      confirm: false,
    });
    setSubmitting(false);
    if (!response.success || !response.data) {
      showError('Не удалось рассчитать начисление', response);
      return;
    }
    setPreview(response.data);
  };

  const applyPayout = async () => {
    if (!preview) return;
    setSubmitting(true);
    const response = await SERVICES_USERS.UsersData.departmentPayout({
      department_id: preview.department_id,
      amount: preview.amount,
      request_id: requestId,
      confirm: true,
      expected_recipient_count: preview.recipient_count,
    });
    setSubmitting(false);
    if (!response.success || !response.data) {
      setPreview(null);
      showError('Состав получателей изменился. Рассчитайте начисление ещё раз', response);
      return;
    }
    setResult(response.data);
    await onApplied();
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title="Выдать премию департаменту"
        onCancel={submitting ? undefined : onClose}
        footer={null}
        destroyOnHidden
      >
        {loadingDepartments ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Spin />
          </div>
        ) : result ? (
          <div style={{ display: 'grid', gap: 16 }}>
            <Alert
              type="success"
              showIcon
              message={result.duplicate ? 'Начисление уже было выполнено' : 'Премия начислена'}
              description={`${result.recipient_count} получателям, всего ${result.total} энк.`}
            />
            <Button type="primary" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        ) : (
          <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={previewPayout}
            onValuesChange={() => setPreview(null)}
          >
            <Form.Item
              name="department_id"
              label="Департамент"
              rules={[{ required: true, message: 'Выберите департамент' }]}
            >
              <Select options={departmentOptions} placeholder="Выберите департамент" />
            </Form.Item>
            <Form.Item
              name="amount"
              label="Сумма каждому ребёнку"
              rules={[{ required: true, message: 'Введите сумму' }]}
            >
              <InputNumber min={1} max={2147483647} precision={0} style={{ width: '100%' }} />
            </Form.Item>

            {preview && (
              <Alert
                type="warning"
                showIcon
                message="Подтвердите начисление"
                description={
                  <Typography.Text>
                    {preview.department_name}: {preview.recipient_count} получателей ×{' '}
                    {preview.amount}
                    {' = '}
                    {preview.total} энк. Начисление нельзя отменить.
                  </Typography.Text>
                }
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={onClose} disabled={submitting}>
                Отмена
              </Button>
              {preview ? (
                <Button type="primary" danger loading={submitting} onClick={applyPayout}>
                  Начислить {preview.total} энк.
                </Button>
              ) : (
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Рассчитать
                </Button>
              )}
            </div>
          </Form>
        )}
      </Modal>
    </>
  );
};
