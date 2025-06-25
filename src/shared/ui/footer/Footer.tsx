'use client';
import React from 'react';
import style from './Footer.module.scss';
import Menu from '../menu/Menu';

const Footer: React.FC = () => {
  return (
    <div className={style.footerContainer}>
      <Menu isFooter={true} />
    </div>
  );
};

export default Footer;
