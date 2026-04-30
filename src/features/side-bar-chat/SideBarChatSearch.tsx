import React from 'react';
import Image from 'next/image';
import style from './SideBarChatSearch.module.scss';

interface SideBarChatSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SideBarChatSearch: React.FC<SideBarChatSearchProps> = ({ value, onChange, disabled }) => {
  return (
    <div className={style.inputForm}>
      <input
        type="text"
        className={style.customInput}
        placeholder="поиск"
        autoComplete="off"
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
      />
      <button
        type="button"
        className={style.searchButton}
        onClick={e => e.stopPropagation()}
        aria-label="поиск"
      >
        <Image src="/26_search.svg" alt="search" height={16} width={16} />
      </button>
    </div>
  );
};

export default SideBarChatSearch;
