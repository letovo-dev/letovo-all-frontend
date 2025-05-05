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
  const activeIcon = Boolean(item.stages);

  return (
    <div key={uuidv4()} className={className} onClick={onClick}>
      {activeIcon ? (
        <>
          <ImgWithBackground
            imgPath={'/изображение5.png'}
            size={60}
            imgType={'avatar'}
            opacity={opacity}
          />
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
