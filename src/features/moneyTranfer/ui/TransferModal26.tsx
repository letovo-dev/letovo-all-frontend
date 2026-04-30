'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import style from './TransferModal26.module.scss';
import Image from 'next/image';
import { Avatar, Button, ConfigProvider, Form, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import userStore, { IUserData, IUserStore } from '@/shared/stores/user-store';

interface ModalProps {
  openTransferModal: boolean;
  setOpenTransferModal: (value: boolean) => void;
  title?: string;
  selfMoney: number;
  userData: IUserData;
}

interface FormValues {
  nick: string;
  sum: number;
}

const TransferModal26: React.FC<ModalProps> = ({
  openTransferModal,
  setOpenTransferModal,
  title = 'Перевод',
  selfMoney = 100,
  userData,
}) => {
  const [receiver, setReceiver] = useState<string | undefined>(undefined);
  const { error, loading } = userStore((state: IUserStore) => state);
  const [form] = Form.useForm();
  const { Text } = Typography;
  const [nick, setNick] = useState<string | undefined>('');
  const [sum, setSum] = useState<number | undefined>(undefined);
  const { isRequireUserInDatabase, transferMoney } = userStore((state: IUserStore) => state);
  const [finished, setFinished] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isButtonDisable, setIsButtonDisable] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!openTransferModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openTransferModal]);

  useEffect(() => {
    if (nick !== receiver) {
      setReceiver(undefined);
    }
  }, [receiver, nick]);

  useEffect(() => {
    const isButtonDisabled = () => {
      if (!nick || nick.length <= 4) {
        return true;
      }
      if (receiver && (!sum || (sum <= 0 && userData?.userrights !== 'admin'))) {
        return true;
      }
      if (sum && userData?.userrights !== 'admin' && sum > selfMoney) {
        return true;
      }
      return false;
    };

    setIsButtonDisable(isButtonDisabled());

    const timeOutId = setTimeout(() => {
      userStore.setState({
        error:
          sum && sum > selfMoney && userData?.userrights !== 'admin'
            ? 'Недостаточно средств'
            : undefined,
      });
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [sum, selfMoney, nick, receiver]);

  if (!openTransferModal || !mounted) return null;

  const onClose = () => {
    setOpenTransferModal(false);
    setIsButtonDisable(false);
    userStore.setState({ error: undefined });
  };

  const onValuesChange = (changedValues: any) => {
    if ('nick' in changedValues) {
      setNick(changedValues.nick || undefined);
    }
    if ('sum' in changedValues) {
      setSum(changedValues.sum || undefined);
    }
  };

  const onFinish = async (values: FormValues) => {
    if (values.nick && !values.sum) {
      const user = await isRequireUserInDatabase(values?.nick);
      setIsButtonDisable(false);
      setReceiver(user ? values.nick : undefined);
      setAvatar(user?.avatar);
      form.resetFields();
    }
    if (values.nick && values.sum) {
      const res = await transferMoney({ receiver: values.nick, amount: Number(values.sum) });
      if (res && res === 'success') {
        userStore.setState((state: IUserStore) => ({
          store: {
            ...state.store,
            userData: {
              ...state.store.userData,
              balance: Number(selfMoney) - Number(values.sum),
            },
          },
        }));
        setFinished(true);
      }
    }
  };

  const isAdmin = userData?.userrights === 'admin';

  const modalNode = (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContainer} onClick={e => e.stopPropagation()}>
        {loading && (
          <div className={style.spinWrapper}>
            <ConfigProvider theme={{ token: { colorPrimary: '#FB4724' } }}>
              <Spin size={'large'} />
            </ConfigProvider>
          </div>
        )}

        <div className={style.headerRow}>
          <h5 className={style.modalHeader}>{title}</h5>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className={style.closeButton}
          >
            ×
          </button>
        </div>

        {!finished && (
          <>
            <div className={style.walletRow}>
              <Image src="/26_wallet.png" alt="wallet" height={22} width={30} />
              <Text className={style.walletLabel}>Ваш баланс</Text>
              {isAdmin ? (
                <span className={style.infinity}>&infin;</span>
              ) : (
                <p className={style.walletSum}>{`${selfMoney} энк.`}</p>
              )}
            </div>

            <Form
              form={form}
              onValuesChange={onValuesChange}
              onFinish={onFinish}
              className={style.form}
            >
              <div
                className={`${style.receiverRow} ${!receiver && error ? style.receiverRowError : ''}`}
              >
                {!receiver ? (
                  <div className={style.receiverIcon}>
                    <Image src="/26_user_icon.svg" alt="user" height={24} width={24} />
                  </div>
                ) : (
                  <div className={style.avatarTemplate}>
                    <Avatar src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${avatar}`} size={42} />
                  </div>
                )}
                <div className={style.inputBox}>
                  <Text className={style.inputLabel}>Ник получателя</Text>
                  <Form.Item
                    name="nick"
                    initialValue={nick}
                    normalize={value => (value === '' ? undefined : value)}
                  >
                    <input
                      type="text"
                      className={style.customInput}
                      placeholder="Nickname"
                      autoComplete="username"
                    />
                  </Form.Item>
                </div>
              </div>

              {receiver && (
                <div className={`${style.receiverRow} ${error ? style.receiverRowError : ''}`}>
                  <div className={style.receiverIcon}>
                    <Image src="/26_refresh.svg" alt="sum" height={20} width={24} />
                  </div>
                  <div className={style.inputBox}>
                    <Text className={style.inputLabel}>Сумма перевода</Text>
                    <Form.Item name="sum" normalize={value => (value === '' ? undefined : value)}>
                      <input
                        type="number"
                        className={style.customInput}
                        placeholder="0"
                        autoComplete="off"
                      />
                    </Form.Item>
                  </div>
                </div>
              )}

              <div className={style.errorContainer}>
                {error && (
                  <>
                    <ExclamationCircleOutlined className={style.warning} />
                    <Text className={style.warnText}>{error}</Text>
                  </>
                )}
              </div>

              <div className={style.buttonsRow}>
                {receiver && (
                  <Form.Item style={{ flex: 1, marginBottom: 0 }}>
                    <Button
                      disabled={!nick || nick.length < 3}
                      className={style.rejectButton}
                      onClick={() => {
                        setReceiver(undefined);
                        userStore.setState({ error: undefined });
                        setSum(0);
                        form.resetFields();
                      }}
                    >
                      Назад
                    </Button>
                  </Form.Item>
                )}
                <Form.Item style={{ flex: 1, marginBottom: 0 }}>
                  <Button
                    htmlType="submit"
                    disabled={isButtonDisable}
                    className={style.submitButton}
                  >
                    {receiver ? 'Перевести' : 'Найти'}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </>
        )}

        {finished && (
          <div className={style.successBlock}>
            <div className={style.successIcon}>✓</div>
            <p className={style.successText}>Перевод выполнен</p>
            <p className={style.successSubtext}>
              {isAdmin
                ? `Средства отправлены пользователю ${receiver ?? ''}`
                : `Остаток: ${selfMoney} энк.`}
            </p>
            <div className={style.readyRow}>
              <Button
                htmlType="button"
                className={style.submitButton}
                onClick={onClose}
                style={{ minWidth: 160, flex: 'unset' }}
              >
                Готово
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};

export default TransferModal26;
