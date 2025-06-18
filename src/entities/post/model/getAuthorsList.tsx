import { IUserData } from '@/shared/stores/user-store';
import type { MenuProps } from 'antd';
import { Avatar } from 'antd';

const src = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/`;

const getAuthorsList = (authors: IUserData[]): MenuProps['items'] => {
  return authors?.reduce<MenuProps['items']>((acc = [], author, index) => {
    acc.push({
      key: author.username,
      icon: <Avatar src={`${src}${author.avatar_pic}`} size={30} />,
      label: author.username,
    });
    if (index < authors.length - 1) {
      acc.push({ type: 'divider' });
    }
    return acc;
  }, []);
};

export default getAuthorsList;
