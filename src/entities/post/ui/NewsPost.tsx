'use client';

import { memo, useMemo } from 'react';
import PostHeader from './PostHeader';
import CarouselElement from './Carousel';
import NewsActionPanel from '@/features/news-action-panel/ui';
import OneComment from './OneComment';
import { RealNews } from '@/shared/stores/data-store';
import userStore, { IUserStore } from '@/shared/stores/user-store';
import commentsStore from '@/shared/stores/comments-store';
import { generateKey } from '@/shared/api/utils';
import style from './NewsPost.module.scss';

interface OnePostProps {
  newsId: string;
  lastNews: any;
  index: number;
  el: { news: RealNews; media: string[] };
  likeNewsOrComment: (post_id: string, action: string) => Promise<void>;
  dislikeNews: (post_id: string, action: string) => Promise<void>;
  saveComment: (comment: string, post_id: string) => Promise<void>;
}

const NewsPost: React.FC<OnePostProps> = ({
  el,
  index,
  lastNews,
  likeNewsOrComment,
  dislikeNews,
  saveComment,
  newsId,
}) => {
  const { avatar_pic } = userStore((state: IUserStore) => state.store.userData);
  const comments = useMemo(
    () =>
      commentsStore.getState().normalizedComments
        ? (commentsStore.getState().normalizedComments?.[newsId] ?? [])
        : [],
    [newsId],
  );

  const showMore = comments.length > 1;

  return (
    <div key={generateKey()} className={style.postContainer}>
      <PostHeader
        index={index}
        author={{
          username: el.news.author || 'Unknown',
          avatar: el.news.avatar_pic || '',
          id: String(el.news.post_id),
        }}
        text={el.news.text || ''}
      />
      {el.media.length > 0 ? (
        <CarouselElement imgs={el.media} />
      ) : (
        <div style={{ margin: '10px 0 20px 0' }}></div>
      )}
      <NewsActionPanel
        newsItem={el.news}
        savedCount={10}
        commentsCount={comments.length}
        likeNewsOrComment={likeNewsOrComment}
        dislikeNews={dislikeNews}
      />
      <OneComment
        showMore={showMore}
        newsId={String(el.news.post_id)}
        lastNews={el.news.post_id === lastNews?.news?.post_id}
        showInput={true}
        saveComment={saveComment}
        avatar={avatar_pic}
        comments={comments}
        likeNewsOrComment={likeNewsOrComment}
      />
    </div>
  );
};

export default memo(NewsPost);
