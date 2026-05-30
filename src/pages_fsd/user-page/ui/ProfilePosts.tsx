'use client';

import React from 'react';
import NewsPost from '@/entities/post/ui/NewsPost';
import dataStore from '@/shared/stores/data-store';
import commentsStore from '@/shared/stores/comments-store';
import type { ProfilePost } from '@/shared/stores/public-profile-store';
import style from './ProfilePosts.module.scss';

interface ProfilePostsProps {
  posts: ProfilePost[];
}

const ProfilePosts: React.FC<ProfilePostsProps> = ({ posts }) => {
  const { likeNewsOrComment, dislikeNews } = dataStore(state => state);
  const { saveComment } = commentsStore(state => state);

  if (!posts || posts.length === 0) {
    return <p className={style.empty}>Постов пока нет</p>;
  }

  const lastPost = posts[posts.length - 1];

  return (
    <div className={style.postsWrap}>
      {posts.map((post, index) => (
        <NewsPost
          key={post.news.post_id}
          newsId={String(post.news.post_id)}
          index={index}
          el={post}
          lastNews={lastPost}
          likeNewsOrComment={likeNewsOrComment}
          dislikeNews={dislikeNews}
          saveComment={saveComment}
        />
      ))}
    </div>
  );
};

export default ProfilePosts;
