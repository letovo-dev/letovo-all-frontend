import React from 'react';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown, Space, Menu } from 'antd';
import style from './InputModule.module.scss';

const defaultItems: MenuProps['items'] = [
  {
    label: <span>Admin</span>,
    key: '0',
  },
  {
    type: 'divider',
  },
  {
    label: <span>User</span>,
    key: '1',
  },
  {
    type: 'divider',
  },
  {
    label: <span>Warrior</span>,
    key: '3',
    disabled: true,
  },
];

const PostAuthorsDropdown = ({
  avatarSrc,
  handleMenuClick,
  items = defaultItems,
}: {
  avatarSrc: string;
  handleMenuClick: MenuProps['onClick'];
  items: MenuProps['items'];
}) => {
  const menu = <Menu items={items} onClick={handleMenuClick} className={style.menu} />;

  return (
    <div className={style.dropdownContainer}>
      <Dropdown overlay={menu} overlayClassName={style.dropdown}>
        <a onClick={e => e.preventDefault()}>
          <Space>
            <Avatar src={avatarSrc} size={40} className={style.avatar} />
          </Space>
        </a>
      </Dropdown>
    </div>
  );
};

export default PostAuthorsDropdown;
