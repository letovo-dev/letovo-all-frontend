'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import style from './CalendarWidget26.module.scss';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon-based
}

function toISODate(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

interface CalendarWidget26Props {
  onDateSelect?: (date: string | null) => void;
}

const CalendarWidget26: React.FC<CalendarWidget26Props> = ({ onDateSelect }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day: number) => {
    const iso = toISODate(viewYear, viewMonth, day);
    if (selectedDate === iso) {
      setSelectedDate(null);
      onDateSelect?.(null);
    } else {
      setSelectedDate(iso);
      onDateSelect?.(iso);
    }
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (day: number) => selectedDate === toISODate(viewYear, viewMonth, day);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={style.calendar}>
      <div className={style.header}>
        <button
          type="button"
          className={style.navBtn}
          onClick={prevMonth}
          aria-label="Предыдущий месяц"
        >
          <Image src="/26_orange_arrow_l.svg" alt="←" width={8} height={12} />
        </button>
        <span className={style.monthLabel}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          className={style.navBtn}
          onClick={nextMonth}
          aria-label="Следующий месяц"
        >
          <Image src="/26_orange_arrow_r.svg" alt="→" width={8} height={12} />
        </button>
      </div>

      <div className={style.grid}>
        {DAYS.map(d => (
          <div key={d} className={style.dayName}>
            {d}
          </div>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} className={style.empty} />
          ) : (
            <button
              key={day}
              type="button"
              className={`${style.day} ${isToday(day) ? style.today : ''} ${isSelected(day) ? style.selected : ''}`}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export default CalendarWidget26;
