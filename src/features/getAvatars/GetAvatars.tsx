import React from 'react';
import Avatar from '@/shared/ui/avatar';
import CustomSelect from '@/shared/ui/select/CustomSelect';
import { Form, FormInstance } from 'antd';
import style from './GetAvatars.module.scss';

interface ComponentProps {
  form: FormInstance<any>;
  onValuesChange?: (value: any) => void;
  setVisible: (value: boolean) => void;
  visible: boolean;
  avatar: string | undefined;
  setAvatar: React.Dispatch<React.SetStateAction<string | undefined>>;
  avatars: string[];
  avatarSize?: { width: number; height: number };
  userPageSelectPosition?: boolean;
}

const GetAvatars: React.FC<ComponentProps> = ({
  form,
  setVisible,
  visible,
  avatar,
  avatars,
  setAvatar,
  avatarSize,
  userPageSelectPosition,
}) => {
  return (
    <div>
      <Form.Item name="avatar" initialValue={avatar} className={style.selectPhotoFormItem}>
        <CustomSelect
          visible={visible}
          setVisible={setVisible}
          value={avatar}
          onChange={value => {
            form.setFieldsValue({ avatar: value });
            setAvatar(value);
          }}
          avatars={avatars}
          userPageSelectPosition={userPageSelectPosition}
        />
      </Form.Item>
      {Avatar(avatar, avatarSize ?? { width: 40, height: 40 })}
    </div>
  );
};

export default GetAvatars;
