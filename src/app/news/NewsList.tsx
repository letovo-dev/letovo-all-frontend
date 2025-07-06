'use client';

import React, { memo } from 'react';
import { OneNews } from '@/entities/post/ui';

interface NewsListProps {
  news: [string, any][];
  lastElementRef: React.RefObject<HTMLDivElement>;
  likeNewsOrComment: (postId: string, action: string) => Promise<void>;
  dislikeNews: (postId: string, action: string) => Promise<void>;
  saveComment: (comment: string, postId: string, author: string | undefined) => Promise<void>;
}

const NewsList: React.FC<NewsListProps> = ({
  news,
  lastElementRef,
  likeNewsOrComment,
  dislikeNews,
  saveComment,
}) => {
  return (
    <>
      {news.map(([id, data], index) => {
        const isLast = index === news.length - 1;
        return (
          <div key={id} data-news-id={id} ref={isLast ? lastElementRef : null}>
            <OneNews
              el={data ?? { media: [], news: {} }}
              index={index}
              lastNews={isLast ? data : null}
              newsId={String(id)}
              likeNewsOrComment={likeNewsOrComment}
              dislikeNews={dislikeNews}
              saveComment={saveComment}
            />
          </div>
        );
      })}
    </>
  );
};

export default memo(NewsList);
