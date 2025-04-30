'use client';
import { memo, useEffect, useMemo, useState } from 'react';
import News from '@/pages/news/News';
import dataStore from '@/shared/stores/data-store';
import { OneNews } from '@/entities/post/ui';
import commentsStore from '@/shared/stores/comments-store';
import SpinModule from '@/shared/ui/spiner';

const MemoizedNews = memo(({ children }: { children: React.ReactNode }) => {
  console.log('Rendering News');
  return <News>{children}</News>;
});
MemoizedNews.displayName = 'MemoizedNews';

const NewsPage = () => {
  const { getTitles, getSavedNews, getLimitNews, likeNewsOrComment, dislikeNews } = dataStore(
    state => state,
  );
  const { saveComment } = commentsStore(state => state);
  const normalizedNews = dataStore(state => state.data.normalizedNews);
  const { currentNewsState, loading } = dataStore(state => state);
  const savedNews = dataStore(state => state.data.savedNews);
  const [renderNews, setRenderNews] = useState(normalizedNews);

  console.log('normalizedNews', normalizedNews);

  useEffect(() => {
    getSavedNews();
    getLimitNews(0, 10);
    getTitles();
  }, []);

  useEffect(() => {
    if (currentNewsState.default) {
      setRenderNews(normalizedNews);
    } else if (currentNewsState.saved) {
      console.log('selectedNews==', savedNews);

      setRenderNews(savedNews);
    } else if (currentNewsState.selectedNews) {
      const selectedNews = normalizedNews[currentNewsState.selectedNews];
      console.log('selectedNews', {
        [currentNewsState.selectedNews]: selectedNews ?? { media: [], news: {} },
      });

      setRenderNews({ [currentNewsState.selectedNews]: selectedNews });
    }
  }, [currentNewsState, normalizedNews, savedNews]);

  console.log('lenta');

  if (loading) {
    return <SpinModule />;
  }

  return (
    <MemoizedNews>
      {renderNews &&
        Object.entries(renderNews).map((el, index) => {
          const newsArr = Object.entries(renderNews);
          const [lastNewsId] = newsArr[newsArr.length - 1];
          const [id, data] = el;

          return (
            <OneNews
              key={id}
              el={data ?? { media: [], news: {} }}
              index={index}
              lastNews={id === lastNewsId ? data : null}
              newsId={String(id)}
              likeNewsOrComment={likeNewsOrComment}
              dislikeNews={dislikeNews}
              saveComment={saveComment}
            />
          );
        })}
    </MemoizedNews>
  );
};

export default NewsPage;
