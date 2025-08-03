'use client';
import React, { useEffect, useState } from 'react';
import style from './TransferModal.module.scss';
import Image from 'next/image';
import { Avatar, Button, ConfigProvider, Flex, Form, Space, Spin, Typography } from 'antd';
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

const TransferModal: React.FC<ModalProps> = ({
  openTransferModal,
  setOpenTransferModal,
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

  if (!openTransferModal) return null;

  const onClose = () => {
    setOpenTransferModal(false);
    setIsButtonDisable(false);
    userStore.setState({ error: undefined });
  };

  const onValuesChange = (changedValues: any, allValues: any) => {
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
                {userData?.userrights === 'admin' ? (
                  <div className={style.walletMoney}>
                    <Image src="/images/Icon_Wallet.webp" alt="wallet" height={26} width={24} />
                    <span className={style.infinity}>&infin;</span>
                  </div>
                ) : (
                  <div className={style.walletMoney}>
                    <Image src="/images/Icon_Wallet.webp" alt="wallet" height={26} width={24} />
                    <p className={style.text}>{`${selfMoney} мон.`}</p>
                  </div>
                )}
                <Image
                  className={style.imageStyle}
                  src="/images/Transfer_Element_1.webp"
                  alt="wallet"
                  height={41}
                  width={180}
                />
                <Form
                  form={form}
                  onValuesChange={onValuesChange}
                  onFinish={onFinish}
                  className={style.form}
                >
                  <div className={style.receiverContainer}>
                    {!receiver ? (
                      <Image
                        src="/images/Icon_Transfer_Account.webp"
                        alt="user"
                        height={78}
                        width={78}
                      />
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
                    <div className={style.receiverContainerAdditional}>
                      <Image
                        src="/images/Icon_Transfer_Wallet.webp"
                        alt="user"
                        height={78}
                        width={78}
                      />
                      <div className={style.nickBox}>
                        <Text className={style.nickText}>Сумма перевода</Text>
                        <Form.Item
                          name="sum"
                          className={!error ? style.inputForm : style.inputFormError}
                          normalize={value => (value === '' ? undefined : value)}
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
                      <Form.Item>
                        <Button
                          variant="solid"
                          htmlType="submit"
                          disabled={isButtonDisable}
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
                {userData?.userrights === 'admin' ? (
                  <div className={style.walletMoney}>
                    <Image src="/images/Icon_Wallet.webp" alt="wallet" height={26} width={24} />
                    <span className={style.infinity}>&infin;</span>
                  </div>
                ) : (
                  <div className={style.walletMoney}>
                    <Image src="/images/Icon_Wallet.webp" alt="wallet" height={26} width={24} />
                    <p className={style.text}>{`${selfMoney} мон.`}</p>
                  </div>
                )}
                <Image
                  className={style.imageStyle}
                  src="/images/Transfer_Element_1.webp"
                  alt="wallet"
                  height={41}
                  width={180}
                />
                <Image
                  className={style.imageEarth}
                  src="/images/Transfer_Element_3_2.webp"
                  alt="earth"
                  height={220}
                  width={360}
                />

                <div className={style.success}>
                  <Image
                    src="/images/transfer_element_forget.webp"
                    alt="wallet"
                    height={48}
                    width={172}
                  />
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
                      disabled={!nick || nick.length < 3}
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
