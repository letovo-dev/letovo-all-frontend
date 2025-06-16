'use client';

import { memo, useMemo, useState } from 'react';
import PostHeader from './PostHeader';
import CarouselElement from './Carousel';
import NewsActionPanel from '@/features/news-action-panel/ui';
import OneComment from './OneComment';
import { RealMedia, RealNews } from '@/shared/stores/data-store';
import userStore, { IUserStore } from '@/shared/stores/user-store';
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
  const { avatar_pic, userrights } = userStore((state: IUserStore) => state.store.userData);
  const comments = useMemo(
    () =>
      commentsStore.getState().normalizedComments
        ? (commentsStore.getState().normalizedComments?.[newsId] ?? [])
        : [],
    [newsId],
  );
  const [visible, setVisible] = useState(false); // State for modal visibility
  const [post, setPost] = useState<Post | null>({
    ...el.news,
    mediaUrl: el.media.length > 0 ? el.media : [],
  }); // State for editing post
  const showMore = comments.length > 1;
  console.log('el.media', el.media);

  const authors = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ];

  // Open modal for creating or editing
  const handleOpen = (editPost?: Post) => {
    // setPost(editPost || null); // Set post for editing or null for creating
    setVisible(true); // Show modal
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      // Mock API call (replace with your actual API)
      console.log('Submitted:', values);
      // Example: await api.savePost(values);
      setVisible(false); // Close modal on success
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    setVisible(false); // Hide modal
    // setPost(null); // Clear post data
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
