import { Avatar } from 'antd';
import style from './ImgWithBackground.module.scss';
import Image from 'next/image';

const ImgWithBackground = ({
  imgPath = '/изображение5.png',
  size,
  imgType,
  height = 90,
  width = 90,
  opacity,
}: {
  imgPath: string;
  size?: number;
  imgType: string;
  height?: number;
  width?: number;
  opacity: number;
}) => {
  return (
    <div className={style.imgContainer}>
      {imgType === 'avatar' ? (
        <Avatar src={imgPath} size={size} className={style.avatar} style={{ opacity: opacity }} />
      ) : (
        <Image src={imgPath} height={height} width={width} alt="" style={{ opacity: opacity }} />
      )}
    </div>
  );
};

export default ImgWithBackground;
