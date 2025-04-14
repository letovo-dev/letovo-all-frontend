import React from 'react';
import AvatarElement from '@/shared/ui/avatar';
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
  avatarSize?: number | undefined;
  userPageSelectPosition?: boolean;
}

const GetAvatars: React.FC<ComponentProps> = ({
  form,
  setVisible,
  visible,
  avatar,
  avatars,
  setAvatar,
  userPageSelectPosition,
  avatarSize = 60,
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
      {AvatarElement(avatar, avatarSize)}
    </div>
  );
};

export default GetAvatars;
