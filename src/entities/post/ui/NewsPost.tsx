'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import PostHeader from './PostHeader';
import CarouselElement from './Carousel';
import NewsActionPanel from '@/features/news-action-panel/ui';
import OneComment from './OneComment';
import dataStore, { RealNews } from '@/shared/stores/data-store';
import userStore, { IUserData, IUserStore } from '@/shared/stores/user-store';
import commentsStore from '@/shared/stores/comments-store';
import { generateKey } from '@/shared/api/utils';
import style from './NewsPost.module.scss';
import PostModal, { Post } from '@/features/post-modal/ui/PostModal';

interface OnePostProps {
  newsId: string;
  lastNews: any;
  index: number;
  el: { news: RealNews; media: string[] };
  likeNewsOrComment: (post_id: string, action: string) => Promise<void>;
  dislikeNews: (post_id: string, action: string) => Promise<void>;
  saveComment: (comment: string, post_id: string, author: string | undefined) => Promise<void>;
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
  const { avatar_pic, userrights } = userStore((state: IUserStore) => state.store.userData);
  const allPostsAuthors = userStore((state: IUserStore) => state.store.allPostsAuthors);
  const editNews = dataStore(state => state.editNews);
  const deleteNews = dataStore(state => state.deleteNews);
  const setCurrentNewsState = dataStore(state => state.setCurrentNewsState);
  const currentNewsStateSaved = dataStore(state => state.currentNewsState?.saved ?? false);
  const comments = useMemo(
    () =>
      commentsStore.getState().normalizedComments
        ? (commentsStore.getState().normalizedComments?.[newsId] ?? [])
        : [],
    [newsId],
  );
  const [visible, setVisible] = useState(false);

  const post = useMemo(() => {
    return {
      ...el.news,
      mediaUrl: el.media?.length > 0 ? el.media : [],
    };
  }, [el]);

  const showMore = useMemo(() => {
    return comments?.length > 1;
  }, [comments]);

  const authors = useMemo(() => {
    return allPostsAuthors?.map((author: IUserData) => {
      return { id: author.username, name: author.username };
    });
  }, [allPostsAuthors]);

  const handleOpen = useCallback(() => setVisible(true), []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteNews(id);
      setCurrentNewsState({
        default: true,
        saved: false,
        selectedNews: undefined,
        searched: false,
        selectedAuthor: false,
      });
    },
    [deleteNews, setCurrentNewsState],
  );

  const handleSubmit = useCallback(
    async (values: any) => {
      try {
        editNews({ ...post, ...values });
        setVisible(false);
      } catch (error) {
        console.error('Submit error:', error);
      }
    },
    [editNews, post],
  );

  const handleCancel = useCallback(() => setVisible(false), []);

  const permittedUser = userrights === 'admin' || userrights === 'moder';
  const isLetovo = el.news.author === 'LETOVO';

  return (
    <div key={generateKey()} className={isLetovo ? style.letovoPostContainer : style.postContainer}>
      <PostHeader
        index={index}
        author={{
          username: el.news.display_name || el.news.author || 'Unknown',
          avatar: el.news.avatar_pic || '',
          id: String(el.news.post_id),
        }}
        text={el.news.text || ''}
        title={el.news.title || ''}
        date={el.news.date || ''}
        isLetovo={isLetovo}
        userStatus={userrights}
        handleOpen={handleOpen}
        handleDelete={handleDelete}
        currentNewsStateSaved={currentNewsStateSaved}
      />
      {el.media?.length > 0 ? (
        <CarouselElement imgs={el.media} />
      ) : (
        <div style={{ margin: '10px 0 20px 0' }}></div>
      )}
      <NewsActionPanel
        postId={el.news.post_id}
        savedCount={10}
        commentsCount={comments?.length}
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
        isAdmin={userrights === 'admin'}
        allPostsAuthors={allPostsAuthors}
        isLetovo={isLetovo}
      />
      {permittedUser && (
        <PostModal
          visible={visible}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          post={post}
          authors={authors}
        />
      )}
    </div>
  );
};

const newsPostAreEqual = (prev: OnePostProps, next: OnePostProps): boolean => {
  if (prev.newsId !== next.newsId || prev.index !== next.index) return false;
  if (prev.el.media !== next.el.media) return false;
  const pn = prev.el.news;
  const nn = next.el.news;
  return (
    pn.post_id === nn.post_id &&
    pn.text === nn.text &&
    pn.title === nn.title &&
    pn.author === nn.author &&
    pn.avatar_pic === nn.avatar_pic &&
    pn.is_published === nn.is_published
  );
};

export default memo(NewsPost, newsPostAreEqual);
