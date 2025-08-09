import { useState, useEffect } from 'react';

export const useCanvas = (containerRef) => {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const updateCanvasSize = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate the maximum possible size while maintaining aspect ratio
    const aspectRatio = 4/3;
    let width, height;

    if (containerWidth / containerHeight > aspectRatio) {
      height = containerHeight * 0.9;
      width = height * aspectRatio;
    } else {
      width = containerWidth * 0.9;
      height = width / aspectRatio;
    }

    setCanvasSize({
      width: Math.floor(width),
      height: Math.floor(height)
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', updateCanvasSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
    };
  }, []);

  return { canvasSize, updateCanvasSize };
};
