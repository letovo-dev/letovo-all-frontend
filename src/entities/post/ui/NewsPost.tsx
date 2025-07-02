'use client';

import { memo, useMemo, useState } from 'react';
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
  const { allPostsAuthors } = userStore((state: IUserStore) => state.store);
  const { editNews, deleteNews, setCurrentNewsState, currentNewsState } = dataStore(state => state);
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

  const showMore = comments?.length > 1;

  const authors = useMemo(() => {
    return allPostsAuthors?.map((author: IUserData) => {
      return { id: author.username, name: author.username };
    });
  }, [allPostsAuthors]);

  const handleOpen = (editPost?: Post) => {
    setVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteNews(id);
    setCurrentNewsState({
      default: true,
      saved: false,
      selectedNews: undefined,
      searched: false,
      selectedAuthor: false,
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      editNews({ ...post, ...values });
      setVisible(false);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    // setPost(null);
  };

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
        userStatus={userrights}
        handleOpen={handleOpen}
        handleDelete={handleDelete}
        currentNewsStateSaved={currentNewsState.saved}
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
      />
      {userrights === 'admin' && (
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

export default memo(NewsPost);
