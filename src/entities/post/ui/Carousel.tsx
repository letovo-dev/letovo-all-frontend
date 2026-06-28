'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import style from './Carousel.module.scss';
import LazyVideo from './LazyVideo';

const CarouselElement = ({ imgs }: { imgs: string[] }) => {
  const isVideo = (src: string) => /\.(mp4|webm|ogg)$/i.test(src);
  const isPDF = (src: string) => /\.pdf$/i.test(src);

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      autoHeight={true}
      observer={true}
      observeParents={true}
      watchSlidesProgress={true}
      className={`${style.carouselWrapper} custom-swiper`}
    >
      {imgs.map((item, i) => {
        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL_MEDIA || '').replace(/\/+$/, '');
        const mediaPath = item.replace(/^\/+/, '');
        const url = `${baseUrl}/${mediaPath}`;
        return (
          <SwiperSlide key={item} className={style.slide}>
            {isVideo(item) ? (
              <LazyVideo src={url} className={style.media} />
            ) : isPDF(item) ? (
              <iframe src={url} className={style.media} title={`pdf-${i}`} />
            ) : (
              <div className={style.imageWrapper}>
                <Image
                  src={url}
                  alt={`img-${i}`}
                  fill
                  unoptimized
                  className={style.media}
                  sizes="(max-width: 760px) 100vw, 760px"
                />
              </div>
            )}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default CarouselElement;
