'use client';
import { memo, useEffect, useMemo, useState } from 'react';
import News from '@/pages/news/News';
import dataStore from '@/shared/stores/data-store';
import { OneNews } from '@/entities/post/ui';
import commentsStore from '@/shared/stores/comments-store';
import SpinModule from '@/shared/ui/spiner';

const MemoizedNews = memo(({ children }: { children: React.ReactNode }) => {
  return <News>{children}</News>;
});
MemoizedNews.displayName = 'MemoizedNews';

const NewsPage = () => {
  const { getTitles, likeNewsOrComment, dislikeNews, fetchNews } = dataStore(state => state);
  const { saveComment } = commentsStore(state => state);
  const normalizedNews = dataStore(state => state.data.normalizedNews);
  const { currentNewsState, loading } = dataStore(state => state);
  const savedNews = dataStore(state => state.data.savedNews);
  const searchedNews = dataStore(state => state.data.searchedNews);

  const [renderNews, setRenderNews] = useState(normalizedNews);

  useEffect(() => {
    fetchNews({ type: 'getLimitNews', start: 0, size: 10 });
    fetchNews({ type: 'getSavedNews' });
    getTitles();
  }, []);

  const getRenderNews = () => {
    switch (true) {
      case currentNewsState.default:
        return normalizedNews;
      case currentNewsState.saved:
        return savedNews;
      case currentNewsState.searched && searchedNews && Object.keys(searchedNews).length > 0:
        return searchedNews;
      case !!currentNewsState.selectedNews:
        return { [currentNewsState.selectedNews]: normalizedNews[currentNewsState.selectedNews] };
      default:
        return normalizedNews;
    }
  };

  useEffect(() => {
    setRenderNews(getRenderNews());
  }, [currentNewsState, normalizedNews, savedNews, searchedNews]);

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
