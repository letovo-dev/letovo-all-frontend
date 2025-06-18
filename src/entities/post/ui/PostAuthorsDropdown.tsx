import React, { useMemo } from 'react';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown, Space } from 'antd';
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
  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }}>
      <a onClick={e => e.preventDefault()}>
        <Space>
          <Avatar src={avatarSrc ?? '/img/pic3.png'} size={30} className={style.avatar} />
        </Space>
      </a>
    </Dropdown>
  );
};

export default PostAuthorsDropdown;
