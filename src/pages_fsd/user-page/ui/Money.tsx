import React from 'react';
import style from './Money.module.scss';
import Image from 'next/image';

const Money = ({ userData, setOpenTransferModal, uploadPhoto }: any) => {
  return (
    <>
      <section className={style.money} onClick={() => setOpenTransferModal(true)}>
        <Image src="/Icon_Wallet.png" alt="wallet" height={26} width={24} />
        <p className={style.count}>{`${userData?.balance ?? 100} мон.`}</p>
        <Image src="/Icon_Time.png" alt="clock" height={24} width={24} />
        <p className={style.text}>
          {`|`} &nbsp;{`2000 мон. / д`}
        </p>
      </section>
      {userData?.userrights === 'admin' && (
        <Image
          src="/UploadPhoto_1.png"
          alt="upload"
          height={30}
          width={30}
          className={style.upload}
          onClick={uploadPhoto}
        />
      )}
    </>
  );
};

export default Money;
