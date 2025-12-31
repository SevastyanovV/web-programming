import { MutableRefObject, useEffect, useRef, useState } from 'react';

export const useZoom = (canvasRef: MutableRefObject<HTMLCanvasElement>) => {
  const [scale, setScale] = useState(0.7);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      // Зумим только если курсор над canvas — тогда блокируем скролл страницы
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const currentScale = scaleRef.current;
      const currentOffset = offsetRef.current;

      // "мир" под курсором до зума
      const worldX = (screenX - (cx + currentOffset.x)) / currentScale;
      const worldY = (screenY - (cy + currentOffset.y)) / currentScale;

      // deltaY < 0 => zoom in
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const nextScale = clamp(currentScale * factor, 0.3, 3);

      const nextOffsetX = screenX - cx - worldX * nextScale;
      const nextOffsetY = screenY - cy - worldY * nextScale;

      setScale(nextScale);
      setOffset({ x: nextOffsetX, y: nextOffsetY });
    };

    // Ключевое: passive:false
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  function handleZoom(direction: 'in' | 'out') {
    setScale((prev) => {
      const next = direction === 'in' ? prev * 1.1 : prev / 1.1;
      return clamp(next, 0.3, 3);
    });
  }

  return {
    handleZoom,
    scale,
    setScale,
    offset,
    setOffset,
  };
};
