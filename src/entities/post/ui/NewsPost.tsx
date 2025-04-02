'use client';

import { memo, useState, useEffect } from 'react';
import PostHeader from './PostHeader';
import CarouselElement from './Carousel';
import NewsActionPanel from '@/features/news-action-panel/ui';
import OneComment from './OneComment';
import { v4 as uuidv4 } from 'uuid';
import { News } from '@/shared/stores/data-store';
import Comments from './Comments';

interface OnePostProps {
  showMore: boolean;
  newsId: string;
  lastNews: News;
  isSaved: boolean;
  index: number;
  el: News;
}

const NewsPost: React.FC<OnePostProps> = ({ el, index, isSaved, lastNews }) => {
  const showMore = el.comments.length > 1;
  const [commentsOpen, setCommentsOpen] = useState<string>('');
  const [filteredByLikes] =
    el.comments.length > 0
      ? [...el.comments].filter(comment => comment.likes > 0).sort((a, b) => b.likes - a.likes)
      : [];
  const [filteredByDate] =
    el.comments.length > 0
      ? [...el.comments].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
      : [];

  const commentToDisplay = el.comments.length > 0 ? (filteredByLikes ?? filteredByDate) : undefined;

  console.log('filteredByDate', filteredByLikes);

  useEffect(() => {
    // getComments(commentsOpen)
    console.log('commentsOpen', commentsOpen);
  }, [commentsOpen]);

  return (
    <>
      <div key={uuidv4()}>
        <PostHeader index={index} author={el.author} text={el.text} />
        <CarouselElement imgs={el.media} />
        <NewsActionPanel
          newsItem={el}
          isSaved={isSaved}
          savedCount={10}
          commentsCount={el.comments.length}
        />
        <OneComment
          comment={commentToDisplay}
          showMore={showMore}
          newsId={el.id}
          lastNews={el === lastNews}
          showInput={true}
        />
      </div>
    </>
  );
};

export default memo(NewsPost);
