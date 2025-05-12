'use client';
import React, { useEffect, useState } from 'react';
import style from './TransferModal.module.scss';
import Image from 'next/image';
import { Avatar, Button, ConfigProvider, Flex, Form, Space, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import userStore, { IUserStore } from '@/shared/stores/user-store';

interface ModalProps {
  openTransferModal: boolean;
  setOpenTransferModal: (value: boolean) => void;
  title?: string;
  selfMoney: number;
}
interface FormValues {
  nick: string;
  sum: number;
}

const TransferModal: React.FC<ModalProps> = ({
  openTransferModal,
  setOpenTransferModal,
  selfMoney = 100,
}) => {
  const [receiver, setReceiver] = useState<string | undefined>(undefined);
  const { error, loading } = userStore((state: IUserStore) => state);
  const [form] = Form.useForm();
  const { Text } = Typography;
  const [nick, setNick] = useState<string | undefined>('');
  const [sum, setSum] = useState<number>(0);
  const { isRequireUserInDatabase, transferMoney } = userStore((state: IUserStore) => state);
  const [finished, setFinished] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (nick !== receiver) {
      setReceiver(undefined);
    }
  }, [receiver, nick]);

  useEffect(() => {
    if (sum > selfMoney) {
      const timeOutId = setTimeout(() => {
        userStore.setState({ error: 'Недостаточно средств' });
      }, 500);
      return () => clearTimeout(timeOutId);
    } else {
      const timeOutId = setTimeout(() => {
        userStore.setState({ error: undefined });
      }, 500);
      return () => clearTimeout(timeOutId);
    }
  }, [sum, selfMoney]);

  if (!openTransferModal) return null;
  const onClose = () => {
    setOpenTransferModal(false);
    userStore.setState({ error: undefined });
  };

  const onValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.nick) {
      setNick(changedValues.nick);
    }
    if (changedValues.sum) {
      setSum(changedValues.sum);
    }
  };

  const onFinish = async (values: FormValues) => {
    if (values.nick && !values.sum) {
      const user = await isRequireUserInDatabase(values?.nick);
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
        form.resetFields();
        setFinished(true);
      }
      form.resetFields();
    }
  };

  return (
    <>
      {!finished && (
        <div className={style.modalOverlay} onClick={onClose}>
          <div
            className={receiver ? style.modalContainerTransfer : style.modalContainer}
            onClick={e => e.stopPropagation()}
          >
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
            <button onClick={onClose} className={style.closeButton} type="button" />
            <h5
              className={
                !receiver ? style.modalContainerHeader : style.modalContainerHeaderTransfer
              }
            >
              Перевод
            </h5>
            <div
              className={!receiver ? style.modalContainerItem : style.modalContainerItemTransfer}
            >
              <section
                className={
                  !receiver
                    ? style.modalContainerItemContent
                    : style.modalContainerItemContentTransfer
                }
              >
                <div className={style.walletMoney}>
                  <Image src="/Icon_Wallet.png" alt="wallet" height={26} width={24} />
                  <p className={style.text}>{`${selfMoney} мон.`}</p>
                </div>
                <Image
                  className={style.imageStyle}
                  src="/Transfer_Element_1.png"
                  alt="wallet"
                  height={41}
                  width={180}
                />{' '}
                <Form
                  form={form}
                  onValuesChange={onValuesChange}
                  onFinish={onFinish}
                  className={style.form}
                >
                  <div className={style.receiverContainer}>
                    {!receiver ? (
                      <Image src="/Icon_Transfer_Account.png" alt="user" height={78} width={78} />
                    ) : (
                      <div className={style.avatarTemplate}>
                        <Avatar
                          src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${avatar}`}
                          size={50}
                          style={{ marginTop: 15 }}
                        />
                      </div>
                    )}
                    <div className={style.nickBox}>
                      <Text className={style.nickText}>Ник получателя</Text>
                      <Form.Item
                        name="nick"
                        initialValue={nick}
                        className={!receiver && error ? style.inputFormError : style.inputForm}
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
                    <div className={style.receiverContainerAdditional}>
                      <Image src="/Icon_Transfer_Wallet.png" alt="user" height={78} width={78} />
                      <div className={style.nickBox}>
                        <Text className={style.nickText}>Сумма перевода</Text>
                        <Form.Item
                          name="sum"
                          className={!error ? style.inputForm : style.inputFormError}
                        >
                          <input
                            type="number"
                            className={style.customInput}
                            placeholder="sum"
                            autoComplete="summa"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  )}

                  <div className={style.errorContainer}>
                    {error && (
                      <Flex vertical={false} justify={'center'} align={'center'} gap="small">
                        <ExclamationCircleOutlined className={style.warning} />
                        <Text className={style.warnText}>{error}</Text>
                      </Flex>
                    )}
                  </div>

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
                    <Space
                      className={
                        receiver ? style.submitButtonSpaceTransfer : style.submitButtonSpace
                      }
                    >
                      {receiver && (
                        <Form.Item>
                          <Button
                            color="default"
                            variant="solid"
                            disabled={!nick || nick.length < 4}
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
                      <Form.Item>
                        <Button
                          variant="solid"
                          htmlType="submit"
                          disabled={!nick || nick.length < 4}
                          className={style.submitButton}
                        >
                          {receiver ? `${'Перевести'}` : `${'Найти'}`}
                        </Button>
                      </Form.Item>
                    </Space>
                  </ConfigProvider>
                </Form>
              </section>
            </div>
          </div>
        </div>
      )}
      {finished && (
        <div className={style.modalOverlay} onClick={onClose}>
          <div className={style.modalContainerTransfer} onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className={style.closeButton} type="button" />
            <h5 className={style.modalContainerHeaderTransfer}>Перевод</h5>
            <div className={style.modalContainerItemTransfer}>
              <section className={style.modalContainerItemContentFinished}>
                <div className={style.walletMoney}>
                  <Image src="/Icon_Wallet.png" alt="wallet" height={26} width={24} />
                  <p className={style.text}>{`${selfMoney} мон.`}</p>
                </div>
                <Image
                  className={style.imageStyle}
                  src="/Transfer_Element_1.png"
                  alt="wallet"
                  height={41}
                  width={180}
                />
                <Image
                  className={style.imageEarth}
                  src="/Transfer_Element_3_2.png"
                  alt="earth"
                  height={220}
                  width={360}
                />

                <div className={style.success}>
                  <Image src="/transfer_element_forget.png" alt="wallet" height={48} width={172} />
                  <Text className={style.nickText}>Успешно!</Text>
                </div>
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
                  <Space className={style.readyButton}>
                    <Button
                      variant="solid"
                      htmlType="submit"
                      disabled={!nick || nick.length < 4}
                      className={style.submitButton}
                      onClick={onClose}
                    >
                      Готово
                    </Button>
                  </Space>
                </ConfigProvider>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransferModal;
