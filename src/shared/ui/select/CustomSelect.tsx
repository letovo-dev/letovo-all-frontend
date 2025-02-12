import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.scss';

const CustomSelect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Выбрать опцию');
  const containerRef = useRef(null);

  // Функция для переключения открытия/закрытия списка
  const toggleDropdown = e => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  // Обработка клика по опции
  const handleOptionClick = option => {
    setSelected(option);
    setIsOpen(false);
  };

  // Закрываем список при клике вне компонента
  useEffect(() => {
    const handleClickOutside = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const options = [
    'Опция 1',
    'Опция 2',
    'Опция 3',
    'Опция 4',
    'Опция 5',
    'Опция 6',
    'Опция 7',
    'Опция 8',
    'Опция 9',
    'Опция 10',
  ];

  return (
    <div className={styles.customSelect} ref={containerRef}>
      <div className={styles.customSelectBtn} onClick={toggleDropdown}>
        {selected}
      </div>
      {isOpen && (
        <div className={styles.customSelectDropdown}>
          {options.map((option, index) => (
            <div
              key={index}
              className={styles.customSelectOption}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
