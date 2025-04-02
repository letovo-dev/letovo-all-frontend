import Image from 'next/image';
import React from 'react';
import style from './Burger.module.scss';

const Burger = ({
  setOpen,
}: {
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}) => (
  <Image
    className={style.burger}
    src="/Icon_Sidebar.png"
    alt="logo"
    width={24}
    height={20}
    onClick={() => setOpen((prev: boolean) => !prev)}
  />
);
export default Burger;
