'use client';

import React, { useRef } from 'react';
import { Carousel, Image, ConfigProvider } from 'antd';
import style from './Carousel.module.scss';

const CarouselElement = ({ imgs }: { imgs: string[] }) => {
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  const onChange = (currentSlide: number) => {
    console.log(currentSlide);
    videoRefs.current.forEach(video => {
      if (video) video.pause();
    });
  };

  const isVideo = (src: string) => {
    return src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.ogg');
  };

  return (
    <>
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
        <Carousel afterChange={onChange} className={style.imageBackground}>
          {imgs.map((item, index) => (
            <div key={item} className={style.slideContainer}>
              {isVideo(item) ? (
                <video
                  ref={el => {
                    if (el) videoRefs.current[index] = el;
                  }}
                  src={item}
                  width={394}
                  max-width={394}
                  controls
                  muted
                  className={style.video}
                />
              ) : (
                <Image
                  src={item}
                  width={394}
                  max-width={394}
                  preview={false}
                  alt={`img-${index}`}
                />
              )}
            </div>
          ))}
        </Carousel>
      </ConfigProvider>
      {/* <div style={{ height: '2000px', backgroundColor: 'red' }}>ok</div> */}
    </>
  );
};

export default CarouselElement;
