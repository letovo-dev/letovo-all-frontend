'use client';

import articlesStore from '@/shared/stores/articles-store';
import SpinModule from '@/shared/ui/spiner';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import axios from 'axios';
import { extractImageUrls } from '@/shared/utils/utils';
import { useRouter } from 'next/navigation';
import { getDataFromLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';

const Articles = () => {
  const { article, getOneArticle, setCurrentArticle, normalizedArticles, loading } = articlesStore(
    state => state,
  );

  const router = useRouter();
  const [processedText, setProcessedText] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      router.push(`/login`);
    }
  }, [token]);

  useEffect(() => {
    const fetchImages = async () => {
      const markdownText = article?.text || '';

      // // Шаг 1: Найти все URL изображений в тексте Markdown
      const imageRegex = /!\[.*?\]\((.*?)\)/g;
      // const imageUrls = [...markdownText.matchAll(imageRegex)].map(match => match[1]);
      const imageUrls = extractImageUrls(markdownText);
      console.log('imageUrls', imageUrls);

      // Шаг 2: Загрузить изображения и заменить URL
      const urlMap: Record<string, string> = {};
      for (const url of imageUrls) {
        try {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
          });

          // Создать временный URL для изображения
          const objectUrl = URL.createObjectURL(response.data);
          urlMap[url] = objectUrl;
        } catch (error) {
          console.error(`Ошибка загрузки изображения ${url}:`, error);
        }
      }

      // Шаг 3: Заменить URL изображений в тексте
      const updatedText = markdownText.replace(imageRegex, (match, url) => {
        const localUrl = urlMap[url];
        return localUrl ? match.replace(url, localUrl) : match;
      });

      setProcessedText(updatedText);
    };

    fetchImages();
  }, [article]);

  if (loading) {
    return <SpinModule />;
  }

  return (
    <div style={{ marginTop: 200, padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt }) => (
            <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />
          ),
        }}
      >
        {processedText}
      </ReactMarkdown>
    </div>
  );
};

export default Articles;
