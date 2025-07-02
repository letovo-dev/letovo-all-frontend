'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dataStore from '@/shared/stores/data-store';
import { OneNews } from '@/entities/post/ui';
import commentsStore from '@/shared/stores/comments-store';
import SpinModule from '@/shared/ui/spiner';
import { News } from '@/pages_fsd/news';
import { message } from 'antd';

const LOAD_NEWS_SIZE = 10;

const NewsPage = () => {
  const { getTitles, likeNewsOrComment, dislikeNews, fetchNews } = dataStore(state => state);
  const { saveComment } = commentsStore(state => state);
  const normalizedNews = dataStore(state => state.data.normalizedNews);
  const { currentNewsState, setCurrentNewsState, loading, error } = dataStore(state => state);
  const savedNews = dataStore(state => state.data.savedNews);
  const searchedNews = dataStore(state => state.data.searchedNews);
  const newsTitles = dataStore(state => state.data.newsTitles);
  const openComments = commentsStore(state => state.openComments);
  const [renderNews, setRenderNews] = useState(normalizedNews);
  const [startNewsItem, setStartNewsItem] = useState(0);
  const [newsLength, setNewsLength] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const isFetching = useRef(false);
  const lastVisiblePosition = useRef<{ newsId: string | null; offsetTop: number }>({
    newsId: null,
    offsetTop: 0,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const info = () => {
    messageApi.open({
      type: 'error',
      content: error,
    });
  };

  useEffect(() => {
    if (error) {
      info();
    }
  }, [error]);

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
    if (!navigator.onLine) {
      return;
    }

    const initializeData = async () => {
      try {
        await Promise.all([
          fetchNews({ type: 'getLimitNews', start: 0, size: LOAD_NEWS_SIZE }),
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
      case currentNewsState.selectedAuthor.state:
        return Object.fromEntries(currentNewsState.selectedAuthor.news);
      default:
        return normalizedNews;
    }
  }, [currentNewsState, normalizedNews, savedNews, searchedNews]);

  useEffect(() => {
    const news = getRenderNews();

    if (news && Object.keys(news).length > 0) {
      setRenderNews(news);
    } else if (currentNewsState.saved && news && Object.keys(news).length === 0) {
      setCurrentNewsState({
        default: true,
        saved: false,
        selectedNews: undefined,
        searched: false,
        selectedAuthor: false,
      });
    } else {
      setRenderNews({});
    }
  }, [getRenderNews, currentNewsState]);

  const loadMore = useCallback(async () => {
    if (!currentNewsState.default || loading || isFetching.current || openComments) {
      return;
    }

    const nextStart = startNewsItem + LOAD_NEWS_SIZE;
    if (nextStart >= newsLength) {
      return;
    }

    if (containerRef.current && lastElementRef.current) {
      const lastVisibleElement = lastElementRef.current;
      const lastNewsId = lastVisibleElement.getAttribute('data-news-id');
      const offsetTop = lastVisibleElement.offsetTop;
      lastVisiblePosition.current = { newsId: lastNewsId, offsetTop };
    }
    isFetching.current = true;
    try {
      await fetchNews({
        type: 'getLimitNews',
        start: nextStart,
        size: LOAD_NEWS_SIZE,
      });
      await getTitles();
      setStartNewsItem(nextStart);
    } catch (error) {
      console.error('Failed to load more news:', error);
    } finally {
      isFetching.current = false;
    }
  }, [fetchNews, startNewsItem, loading, newsLength, openComments, currentNewsState.default]);

  useEffect(() => {
    if (!currentNewsState.default) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    // Процент от высоты экрана, при достижении которого срабатывает дозагрузка
    const triggerPercentage = 10;
    const screenHeight = window.innerHeight;
    const rootMarginValue = `${Math.round(screenHeight * (triggerPercentage / 100))}px`;

    const observer = new IntersectionObserver(
      entries => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          !isFetching.current &&
          !openComments &&
          startNewsItem < newsLength &&
          !currentNewsState.saved &&
          !currentNewsState.selected
        ) {
          loadMore();
        }
      },
      {
        threshold: 0.1, // Процент пересечения элемента (10% видимости)
        rootMargin: `0px 0px ${rootMarginValue} 0px`, // Триггер на 10% высоты экрана от нижней границы
      },
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
  }, [loadMore, currentNewsState.default, openComments, startNewsItem, newsLength]);

  useEffect(() => {
    if (observerRef.current && lastElementRef.current && currentNewsState.default) {
      observerRef.current.observe(lastElementRef.current);
    }

    const { newsId, offsetTop } = lastVisiblePosition.current;
    if (newsId && containerRef.current && !openComments) {
      const lastVisibleElement = containerRef.current.querySelector(`[data-news-id="${newsId}"]`);
      if (lastVisibleElement) {
        containerRef.current.scrollTop = (lastVisibleElement as HTMLElement).offsetTop - 120;
      } else {
        containerRef.current.scrollTop = offsetTop - 120;
      }
      lastVisiblePosition.current = { newsId: null, offsetTop: 0 };
    }
  }, [renderNews, openComments, currentNewsState.default]);

  if (loading && startNewsItem === 0) {
    return <SpinModule />;
  }

  return (
    <>
      {contextHolder}
      <News onContainerRef={ref => (containerRef.current = ref.current)}>
        {renderNews &&
          Object.entries(renderNews)
            .sort((a, b) => {
              const dateA = new Date(a[1].news.date);
              const dateB = new Date(b[1].news.date);
              return dateB.getTime() - dateA.getTime();
            })
            .map((el, index) => {
              const newsArr = Object.entries(renderNews);
              const isLastElement = index === newsArr.length - 1;
              return (
                <div ref={isLastElement ? lastElementRef : null} key={el[0]} data-news-id={el[0]}>
                  <OneNews
                    el={el[1] ?? { media: [], news: {} }}
                    index={index}
                    lastNews={isLastElement ? el[1] : null}
                    newsId={String(el[0])}
                    likeNewsOrComment={likeNewsOrComment}
                    dislikeNews={dislikeNews}
                    saveComment={saveComment}
                  />
                </div>
              );
            })}
        {loading && startNewsItem > 0 && <SpinModule />}
      </News>
    </>
  );
};

export default NewsPage;
