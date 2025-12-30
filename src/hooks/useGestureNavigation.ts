import { useRef, useCallback } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
}

const SWIPE_THRESHOLD = 50; // minimum distance for swipe
const SWIPE_TIMEOUT = 300; // max time for swipe gesture (ms)

export function useGestureNavigation(handlers: SwipeHandlers) {
  const swipeState = useRef<SwipeState | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeState.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeState.current.startX;
      const deltaY = touch.clientY - swipeState.current.startY;
      const deltaTime = Date.now() - swipeState.current.startTime;

      // Check if swipe was fast enough
      if (deltaTime > SWIPE_TIMEOUT) {
        swipeState.current = null;
        return;
      }

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Horizontal swipe
      if (absX > SWIPE_THRESHOLD && absX > absY) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }
      // Vertical swipe
      else if (absY > SWIPE_THRESHOLD && absY > absX) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }

      swipeState.current = null;
    },
    [handlers],
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

// Common gesture patterns
export function useSwipeToNavigate(
  onNext: () => void,
  onPrevious: () => void,
  direction: "horizontal" | "vertical" = "horizontal",
) {
  return useGestureNavigation(
    direction === "horizontal"
      ? { onSwipeLeft: onNext, onSwipeRight: onPrevious }
      : { onSwipeUp: onNext, onSwipeDown: onPrevious },
  );
}

export function useSwipeToClose(onClose: () => void) {
  return useGestureNavigation({ onSwipeDown: onClose });
}

// Pull-to-refresh implementation
interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
}: PullToRefreshOptions) {
  const pullStart = useRef<number | null>(null);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      pullStart.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (pullStart.current === null) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStart.current;

      if (diff > threshold && !isPulling.current) {
        isPulling.current = true;
      }
    },
    [threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (isPulling.current) {
      await onRefresh();
    }
    pullStart.current = null;
    isPulling.current = false;
  }, [onRefresh]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
