'use client';

import React from 'react';
import Image from 'next/image';
import style from './CollapseBody.module.scss';

interface SkillItem {
  id: number;
  new: boolean;
  stage: number;
  achivement_pic: string;
  achivement_name: string;
  category_name?: string;
}

interface CollapseBodyProps {
  departmentIcon: string;
  brigade?: string;
  post?: string;
  achivements: SkillItem[];
  iconColor: string;
}

const CollapseBody = ({
  departmentIcon,
  brigade,
  post,
  achivements,
  iconColor,
}: CollapseBodyProps) => {
  const newSkills = achivements.filter(a => a.new);
  const oldSkills = achivements.filter(a => !a.new);

  return (
    <div className={style.body}>
      <div className={style.infoRow}>
        <div className={style.deptIconCircle} style={{ borderColor: iconColor }}>
          <Image src={departmentIcon} alt="" width={38} height={38} />
        </div>
        <div className={style.infoTexts}>
          <span className={style.label}>Отдел</span>
          <span className={style.value}>{brigade}</span>
          <span className={style.label}>Должность 1</span>
          <span className={style.value}>{post}</span>
        </div>
      </div>

      {newSkills.length > 0 && (
        <>
          <div className={style.divider} />
          <div className={style.skillsRow}>
            <span className={style.sectionLabel}>{'Новые\nнавыки'}</span>
            <div className={style.skillsList}>
              {newSkills.map(item => (
                <div key={item.id} className={style.skillItem}>
                  <div className={style.stageCircle} style={{ background: iconColor }}>
                    <span className={style.stageNum}>{item.stage}</span>
                    {item.category_name && (
                      <span className={style.proBadge}>{item.category_name}</span>
                    )}
                  </div>
                  <span className={style.skillName}>{item.achivement_name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {oldSkills.length > 0 && (
        <>
          <div className={style.divider} />
          <div className={style.skillsRow}>
            <span className={style.sectionLabel}>{'Старые\nнавыки'}</span>
            <div className={style.skillsList}>
              {oldSkills.map(item => (
                <div key={item.id} className={style.skillItem}>
                  <div className={style.oldIconWrap}>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${item.achivement_pic}`}
                      alt=""
                      width={32}
                      height={32}
                    />
                  </div>
                  <span className={style.skillName}>{item.achivement_name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CollapseBody;
