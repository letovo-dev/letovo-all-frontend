import React from 'react';
import style from './Money26.module.scss';
import Image from 'next/image';

const Money26 = ({ userData }: any) => {
  return (
    <>
      {userData?.userrights === 'admin' ? (
        <div className={style.walletAndSum}>
          <div className={style.sum}>
            <Image src="/images/26_wallet.webp" alt="wallet" height={27} width={36} />
            <Image src="/images/26_infinity.webp" alt="" height={38} width={42} />
          </div>
          <div className={style.sign}>
            <Image src="/images/26_en.webp" alt="" height={10} width={16} />
          </div>
        </div>
      ) : (
        <div className={style.walletAndSum}>
          <Image src="/images/26_wallet.webp" alt="wallet" height={27} width={36} />
          <p
            className={style.count}
          >{`${new Intl.NumberFormat('ru-RU').format(userData?.balance ?? 100)}`}</p>
          <div className={style.sign}>
            <Image src="/images/26_en.webp" alt="" height={10} width={16} />
          </div>
        </div>
      )}
    </>
  );
};

export default Money26;
