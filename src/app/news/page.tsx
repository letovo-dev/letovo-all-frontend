'use client';
import { useEffect, useState } from 'react';
import News from '@/pages/news/News';
import dataStore from '@/shared/stores/data-store';
import style from './page.module.scss';
import { Comments, OneNews } from '@/entities/post/ui';

const NewsPage = () => {
  const [open, setOpen] = useState(false);
  const { news, saved, subjects } = dataStore(state => state.data.news);

  console.log('news', news);

  useEffect(() => {
    dataStore.getState().getNews();
  }, []);

  return (
    <News open={open} setOpen={setOpen} saved={saved} subjects={subjects}>
      {news.map((el, index) => {
        const isSaved = Boolean(saved.find(item => item.id === el.id));
        const lastNews = news[news.length - 1];
        return (
          <OneNews
            key={el.id}
            el={el}
            index={index}
            isSaved={isSaved}
            lastNews={lastNews}
            showMore={el.comments.length > 1}
            newsId={el.id}
          />
        );
      })}
    </News>
  );
};

export default NewsPage;
