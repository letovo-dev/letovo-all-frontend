'use client';

import React from 'react';
import PostHeader from '@/entities/post/ui/PostHeader';
import CarouselElement from '@/entities/post/ui/Carousel';
import { generateKey } from '@/shared/api/utils';
import type { ProfilePost } from '@/shared/stores/public-profile-store';
import style from './ProfilePosts.module.scss';

interface ProfilePostsProps {
  posts: ProfilePost[];
}

const ProfilePosts: React.FC<ProfilePostsProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <p className={style.empty}>Постов пока нет</p>;
  }

  return (
    <div className={style.postsWrap}>
      {posts.map((post, index) => (
        <div key={generateKey()} className={style.postContainer}>
          <PostHeader
            index={index}
            author={{
              username: post.news.author || 'Unknown',
              avatar: post.news.avatar_pic || '',
              id: String(post.news.post_id),
            }}
            text={post.news.text || ''}
            userStatus=""
            handleOpen={() => {}}
            handleDelete={() => {}}
            currentNewsStateSaved={true}
          />
          {post.media?.length > 0 ? (
            <CarouselElement imgs={post.media} />
          ) : (
            <div style={{ margin: '10px 0 20px 0' }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProfilePosts;
