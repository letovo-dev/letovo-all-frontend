'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import News from '@/pages_fsd/news/News';
import dataStore from '@/shared/stores/data-store';
import { OneNews } from '@/entities/post/ui';
import commentsStore from '@/shared/stores/comments-store';
import SpinModule from '@/shared/ui/spiner';
import { debounce } from 'lodash';

const MemoizedNews = memo(({ children }: { children: React.ReactNode }) => {
  return <News>{children}</News>;
});
MemoizedNews.displayName = 'MemoizedNews';

const LOAD_NEWS_SIZE = 10;

const NewsPage = () => {
  const { getTitles, likeNewsOrComment, dislikeNews, fetchNews } = dataStore(state => state);
  const { saveComment } = commentsStore(state => state);
  const normalizedNews = dataStore(state => state.data.normalizedNews);
  const { currentNewsState, loading } = dataStore(state => state);
  const savedNews = dataStore(state => state.data.savedNews);
  const searchedNews = dataStore(state => state.data.searchedNews);
  const newsTitles = dataStore(state => state.data.newsTitles);
  const [renderNews, setRenderNews] = useState(normalizedNews);
  const [startNewsItem, setStartNewsItem] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const [newsLength, setNewsLength] = useState(0);
  const [loadedNewsLength, setLoadedNewsLength] = useState(0);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    setNewsLength(newsTitles.length);
  }, [newsTitles]);

  useEffect(() => {
    setLoadedNewsLength(LOAD_NEWS_SIZE);
  }, []);

  useEffect(() => {
    if (!navigator.onLine) {
      console.warn('No internet connection, skipping fetchNews');
      return;
    }

    const initializeData = async () => {
      try {
        await Promise.all([
          fetchNews({ type: 'getLimitNews', start: startNewsItem, size: LOAD_NEWS_SIZE }),
          fetchNews({ type: 'getSavedNews' }),
          getTitles(),
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    initializeData();
  }, []);
  const getRenderNews = useCallback(() => {
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
  }, [currentNewsState, normalizedNews, savedNews, searchedNews]);

  useEffect(() => {
    const news = getRenderNews();
    if (news && Object.keys(news).length > 0) {
      setRenderNews(news);
    } else {
      console.warn('No renderNews data available');
      setRenderNews({});
    }
  }, [getRenderNews]);

  const debouncedLoadMore = useMemo(
    () =>
      debounce(() => {
        const nextStart = startNewsItem + LOAD_NEWS_SIZE;
        setLoadedNewsLength(prev => prev + LOAD_NEWS_SIZE);
        fetchNews({ type: 'getLimitNews', start: nextStart, size: LOAD_NEWS_SIZE })
          .then(() => {
            setHasMore(newsLength >= loadedNewsLength + LOAD_NEWS_SIZE);
            setStartNewsItem(nextStart);
          })
          .catch(error => {
            console.error('Failed to load more news:', error);
            setHasMore(false);
          });
      }, 300),
    [fetchNews, startNewsItem, loading, hasMore, newsLength, loadedNewsLength],
  );

  const loadMore = useCallback(() => {
    debouncedLoadMore();
  }, [debouncedLoadMore]);

  useEffect(() => {
    if (!currentNewsState.default) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0, rootMargin: '100px' },
    );
    observerRef.current = observer;

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading, currentNewsState.default]);

  useEffect(() => {
    return () => {
      debouncedLoadMore.cancel();
    };
  }, [debouncedLoadMore]);

  if (loading && startNewsItem === 0) {
    return <SpinModule />;
  }

  if (!renderNews || Object.keys(renderNews).length === 0) {
    return <SpinModule />;
  }

  return (
    <MemoizedNews>
      {Object.entries(renderNews).map((el, index) => {
        const newsArr = Object.entries(renderNews);
        const [lastNewsId] = newsArr[newsArr.length - 1];
        const [id, data] = el;
        const isLastElement = id === lastNewsId;

        return (
          <div ref={isLastElement ? lastElementRef : null} key={id}>
            <OneNews
              el={data ?? { media: [], news: {} }}
              index={index}
              lastNews={id === lastNewsId ? data : null}
              newsId={String(id)}
              likeNewsOrComment={likeNewsOrComment}
              dislikeNews={dislikeNews}
              saveComment={saveComment}
            />
          </div>
        );
      })}
      {loading && startNewsItem > 0 && <SpinModule />}
    </MemoizedNews>
  );
};

export default NewsPage;
