'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input, Button, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';

const ArticleEditInput = ({
  articleId,
  categoryId,
  initialValue,
  onSubmit,
}: {
  articleId: string;
  categoryId: string;
  initialValue: string;
  onSubmit: (
    articleId: string | null,
    categoryId: string,
    type: 'category' | 'article',
    newValue: string,
  ) => void;
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [articleId]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  return (
    <Space.Compact
      style={{ width: '100%', marginTop: '8px' }}
      onClick={e => e.stopPropagation()}
      key={`article-${articleId}`}
    >
      <Input ref={inputRef} value={value} onChange={handleChange} />
      <Button
        type="primary"
        style={{ backgroundColor: '#fb4724' }}
        onClick={() => onSubmit(articleId, categoryId, 'article', value)}
      >
        <SaveOutlined />
      </Button>
    </Space.Compact>
  );
};

ArticleEditInput.displayName = 'ArticleEditInput';

export default React.memo(ArticleEditInput);
