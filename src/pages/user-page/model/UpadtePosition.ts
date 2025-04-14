interface PositionedElement {
  ref: React.RefObject<HTMLElement>;
  targetX: number;
  targetY: number;
}

export const updatePositions = (
  wrapRef: React.RefObject<HTMLElement>,
  elements: PositionedElement[],
) => {
  const wrap = wrapRef.current;

  if (!wrap || elements.some(el => !el.ref.current)) {
    return;
  }

  const imgWidthPC = 1920;
  const imgHeightPC = 1080;
  const imgWidthMobile = 767;
  const imgHeightMobile = 375;

  const wrapWidth = wrap.offsetWidth;
  const wrapHeight = wrap.offsetHeight;
  const isMobile = window.innerWidth <= 767;
  const imgWidth = isMobile ? imgWidthMobile : imgWidthPC;
  const imgHeight = isMobile ? imgHeightMobile : imgHeightPC;
  const scale = Math.min(wrapWidth / imgWidth, wrapHeight / imgHeight);
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;
  const offsetX = (wrapWidth - scaledWidth) / 2;
  const offsetY = 0;

  elements.forEach(({ ref, targetX, targetY }) => {
    const element = ref.current!;
    const pointX = offsetX + targetX * scaledWidth;
    const pointY = offsetY + targetY * scaledHeight;

    element.style.left = `${pointX}px`;
    element.style.top = `${pointY}px`;
  });
};
