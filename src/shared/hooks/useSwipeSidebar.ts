import { useEffect, useRef } from 'react';

interface UseSwipeSidebarOptions {
  open: boolean;
  setOpen: (value: boolean) => void;
  disabled?: boolean;
  /** Width of the right-edge zone that triggers open swipe (default 60px) */
  edgeZone?: number;
  /** Minimum horizontal distance to count as swipe (default 40px) */
  threshold?: number;
}

export function useSwipeSidebar({
  open,
  setOpen,
  disabled = false,
  edgeZone = 60,
  threshold = 40,
}: UseSwipeSidebarOptions) {
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (disabled) return;

    let startX = 0;
    let startY = 0;
    let directionLocked = false;
    let isHorizontal = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      directionLocked = false;
      isHorizontal = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!directionLocked) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          directionLocked = true;
          isHorizontal = Math.abs(dx) > Math.abs(dy);
        }
      }
      if (isHorizontal && openRef.current) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!directionLocked || !isHorizontal) return;
      const deltaX = e.changedTouches[0].clientX - startX;
      if (deltaX < -threshold && startX > window.innerWidth - edgeZone) {
        setOpen(true);
      } else if (deltaX > threshold && openRef.current) {
        setOpen(false);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [disabled, edgeZone, threshold, setOpen]);
}
