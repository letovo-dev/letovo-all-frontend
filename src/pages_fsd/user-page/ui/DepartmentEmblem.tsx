import Image from 'next/image';
import type { DepartmentMeta } from '../model/departments';
import style from './DepartmentEmblem.module.scss';

interface DepartmentEmblemProps {
  department: DepartmentMeta;
  className?: string;
  width: number;
  height: number;
  alt?: string;
}

const DepartmentEmblem = ({
  department,
  className = '',
  width,
  height,
  alt = '',
}: DepartmentEmblemProps) => {
  return (
    <span className={`${style.root} ${className}`} style={{ width, height }}>
      <Image
        className={`${style.image} ${department.hoverIcon ? style.normalImage : ''}`}
        src={department.icon}
        alt={alt}
        width={width}
        height={height}
      />
      {department.hoverIcon && (
        <Image
          className={`${style.image} ${style.hoverImage}`}
          src={department.hoverIcon}
          alt=""
          aria-hidden="true"
          width={width}
          height={height}
        />
      )}
    </span>
  );
};

export default DepartmentEmblem;
