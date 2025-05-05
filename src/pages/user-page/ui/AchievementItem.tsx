import { IUserAchData } from '@/shared/stores/user-store';
import { ImgWithBackground } from '@/shared/ui/image-background';
import { calculateOpacity } from '@/shared/utils';
import Image from 'next/image';
import style from './AchieveBlockMobile.module.scss';
import { v4 as uuidv4 } from 'uuid';

const AchievementItem = ({
  item,
  onClick,
  className,
}: {
  item: IUserAchData;
  onClick: () => void;
  className: string;
}) => {
  const opacity = calculateOpacity(item.level, item.stages);
  const isActiveIcon = Boolean(item.stages);
  const imgPath = `${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${item.achivement_pic}`;

  return (
    <div key={uuidv4()} className={className} onClick={onClick}>
      {isActiveIcon ? (
        <>
          <ImgWithBackground imgPath={imgPath} size={60} imgType={'avatar'} opacity={opacity} />
          <p className={style.achTextActive}>{item.achivement_name}</p>
        </>
      ) : (
        <>
          <Image src="/Achievement_Closed.png" alt="" height={106} width={106} />
          <p className={style.achTextInactive}>{item.achivement_name}</p>
        </>
      )}
    </div>
  );
};
export default AchievementItem;
