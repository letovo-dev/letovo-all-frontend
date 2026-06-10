'use client';

import React from 'react';
import style from './EmojiPicker.module.scss';

const EMOJIS: string[] = [
  // Smileys — positive
  '😀',
  '😁',
  '😂',
  '🤣',
  '😅',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😍',
  '🥰',
  '😘',
  '😋',
  '😛',
  '😝',
  '🤪',
  '😎',
  '🤩',
  '🥳',
  // Smileys — neutral / curious
  '🤔',
  '🤨',
  '🧐',
  '🤓',
  '😏',
  '😒',
  '🙄',
  '😬',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😯',
  '😦',
  '😮',
  '😲',
  '🥱',
  '😴',
  '🤤',
  '😪',
  // Smileys — unwell / wild
  '😵',
  '🤯',
  '🤐',
  '🥴',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🥶',
  '🥵',
  '🤧',
  '😈',
  '👻',
  '💀',
  '👽',
  '🤖',
  // Smileys — negative
  '😕',
  '🙁',
  '😟',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🥺',
  '😖',
  '😣',
  '😞',
  '😩',
  '😫',
  '😨',
  '😰',
  '😱',
  // Hearts
  '❤️',
  '🧡',
  '💛',
  '💚',
  '💙',
  '💜',
  '🖤',
  '🤍',
  '🤎',
  '💔',
  '❣️',
  '💕',
  '💖',
  '💘',
  '💝',
  '💞',
  '💓',
  // Hands
  '👍',
  '👎',
  '👌',
  '✌️',
  '🤞',
  '🤟',
  '🤘',
  '🤙',
  '👋',
  '✋',
  '🖐️',
  '🤚',
  '🖖',
  '🤝',
  '🙏',
  '🙌',
  '👏',
  '💪',
  '🫶',
  // Symbols & celebration
  '🔥',
  '✨',
  '⭐',
  '🌟',
  '💯',
  '🎉',
  '🎊',
  '🎈',
  '🎁',
  '🎂',
  '☕',
  '🍕',
  '🌞',
  '🌙',
  '⚡',
  '🌈',
  '🌹',
  '🍀',
  '👀',
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  return (
    <div className={style.picker} role="dialog" aria-label="Эмодзи">
      {EMOJIS.map(emoji => (
        <button key={emoji} type="button" className={style.emoji} onClick={() => onSelect(emoji)}>
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
