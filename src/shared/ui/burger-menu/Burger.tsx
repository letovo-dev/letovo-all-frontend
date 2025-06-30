import Image from 'next/image';
import React from 'react';
import style from './Burger.module.scss';

const Burger = ({
  setOpen,
  openComments,
}: {
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  openComments?: string;
}) => (
  <Image
    className={style.burger}
    src="/images/Icon_Sidebar.webp"
    alt="logo"
    width={24}
    height={20}
    onClick={() => {
      if (openComments) {
        return;
      } else {
        setOpen((prev: boolean) => !prev);
      }
    }}
  />
);
export default Burger;
