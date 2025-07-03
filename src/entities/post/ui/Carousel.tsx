'use client';

import React, { useRef } from 'react';
import { Carousel, Image, ConfigProvider } from 'antd';
import style from './Carousel.module.scss';

const CarouselElement = ({ imgs }: { imgs: string[] }) => {
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  const onChange = (currentSlide: number) => {
    videoRefs.current.forEach(video => {
      if (video) video.pause();
    });
  };

  const isVideo = (src: string) => {
    return src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.ogg');
  };

  const isPDF = (src: string) => {
    return src.toLowerCase().endsWith('.pdf');
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Carousel: {
            arrowOffset: 20,
            dotOffset: -15,
            dotWidth: 8,
          },
        },
        token: {
          colorBgContainer: '#494949',
        },
      }}
    >
      {imgs && imgs.length > 0 ? (
        <Carousel afterChange={onChange} className={style.imageBackground}>
          {imgs.map((item, index) => (
            <div key={item} className={style.slideContainer}>
              {isVideo(item) ? (
                <video
                  ref={el => {
                    if (el) videoRefs.current[index] = el;
                  }}
                  src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${item}`}
                  controls
                  // muted
                  className={style.video}
                  preload="metadata"
                />
              ) : isPDF(item) ? (
                <iframe
                  src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}${item}`}
                  className={style.pdf}
                  title={`PDF-${index}`}
                  frameBorder="0"
                  scrolling="no"
                />
              ) : (
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}/${item}`}
                  preview={false}
                  alt={`img-${index}`}
                  className={style.image}
                />
              )}
            </div>
          ))}
        </Carousel>
      ) : null}
    </ConfigProvider>
  );
};

export default CarouselElement;
