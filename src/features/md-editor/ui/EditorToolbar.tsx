'use client';

import React from 'react';
import style from './MdEditor.module.scss';

export interface ToolbarItem {
  key: string;
  title: string;
  label: React.ReactNode;
  onClick: () => void;
}

interface EditorToolbarProps {
  /** Группы кнопок: между группами рисуется разделитель. */
  groups: ToolbarItem[][];
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ groups }) => (
  <div className={style.toolbar} role="toolbar" aria-label="Форматирование">
    {groups.map((group, groupIndex) => (
      <React.Fragment key={group.map(item => item.key).join('-')}>
        {groupIndex > 0 && <span className={style.toolbarSeparator} aria-hidden="true" />}
        {group.map(item => (
          <button
            key={item.key}
            type="button"
            title={item.title}
            aria-label={item.title}
            className={style.toolbarButton}
            onMouseDown={event => event.preventDefault()}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
      </React.Fragment>
    ))}
  </div>
);

export default EditorToolbar;
