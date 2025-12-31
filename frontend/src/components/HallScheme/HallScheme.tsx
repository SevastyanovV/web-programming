import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import image from '@/components/HallScheme/arena.png';
import type {
  IRectSeat,
  IRectSector,
  THallSchemeProps,
} from '@/components/HallScheme/HallScheme.type';
import styles from './HallScheme.module.scss';
import { ApiEvents } from '@/api/api';
import { useZoom } from './useZoom';
import { useToast } from '@/toastProvider';

const COLORS = {
  darkBlue: '#003b73',
  blue: '#0f87ff',
  lightBlue: '#27b3ff',
  orange: '#ff7a2f',
  gray: '#e5e7eb',
} as Record<string, string>;

const A_ROWS = 6;
const A_COLS = 10;
const B_ROWS = 8;
const B_COLS = 12;
const C_ROWS = 8;
const C_COLS = 14;

const seatSize = 10;
const hGap = 4;
const vGap = 6;
const stageW = 220;
const stageH = 60;
const stageMargin = 40; // расстояние от сцены до A
const ringGap = 47; // расстояние между A и B
const ringGapC = 47; // расстояние между B и C
const stageWidth = 60;
const stageHeight = 130;
const stageX = -stageWidth * 2 - 20;

const blockWidthA = A_COLS * seatSize + (A_COLS - 1) * hGap;
const blockHeightA = A_ROWS * seatSize + (A_ROWS - 1) * vGap;
const aTopCount = 4;
const totalWidthTopA = aTopCount * blockWidthA + (aTopCount - 1) * 20;
const aBottomCount = 4;
const totalWidthBottomA =
  aBottomCount * blockWidthA + (aBottomCount - 1) * 20;
const topY_A = -(stageH / 2 + stageMargin + blockHeightA); // верхний A
const bottomY_A = stageH / 2 + stageMargin; // нижний A
const leftX_A = -(stageW / 2 + stageMargin + blockWidthA); // левый A
const rightX_A = stageW / 2 + stageMargin; // правый A

const blockWidthB = B_COLS * seatSize + (B_COLS - 1) * hGap;
const blockHeightB = B_ROWS * seatSize + (B_ROWS - 1) * vGap;
const topY_B = topY_A - ringGap - blockHeightB - 1; // верхний B
const bottomY_B = bottomY_A + blockHeightA + ringGap; // нижний B
const leftX_B = leftX_A - ringGap - blockWidthB + 60; // левый B
const rightX_B = rightX_A + blockWidthA + ringGap - 3; // правый B

const blockWidthC = C_COLS * seatSize + (C_COLS - 1) * hGap;
const blockHeightC = C_ROWS * seatSize + (C_ROWS - 1) * vGap;
const topY_C = topY_B + 1 - ringGapC - blockHeightC;
const bottomY_C = bottomY_B + blockHeightB + ringGapC;
const leftX_C = leftX_B - ringGapC - blockWidthC + 23;
const rightX_C = rightX_B + blockWidthB + ringGapC;
const cTopCount = 6;
const totalWidthTopC = cTopCount * blockWidthC + (cTopCount - 1) * 24;

const colorA = COLORS.blue;
const colorB = COLORS.darkBlue;
const colorC = COLORS.orange;

const SECTORS: IRectSector[] = (() => {
  const sectors: IRectSector[] = [];

  let startXTopA = -totalWidthTopA / 2;
  let startXBottomA = -totalWidthBottomA / 2;
  let startXLeftA = (startXTopA + startXBottomA) / 2;

  for (let i = 0; i < aTopCount; i++) {
    sectors.push({
      id: `A${i + 1}`,
      x: startXTopA,
      y: topY_A,
      rows: A_ROWS,
      cols: A_COLS,
      seatSize,
      hGap,
      vGap,
      color: colorA,
    });
    startXTopA += blockWidthA + 20;
  }

  // 4 снизу (A5..A8)
  for (let i = 0; i < aBottomCount; i++) {
    sectors.push({
      id: `A${5 + i}`,
      x: startXBottomA,
      y: bottomY_A,
      rows: A_ROWS,
      cols: A_COLS,
      seatSize,
      hGap,
      vGap,
      color: colorA,
    });
    startXBottomA += blockWidthA + 20;
  }

  // 1 слева (A9)
  sectors.push({
    id: 'A9',
    x: startXLeftA,
    y: -blockHeightA / 2,
    rows: A_ROWS,
    cols: A_COLS,
    seatSize,
    hGap,
    vGap,
    color: colorA,
  });

  // 1 справа (A10)
  sectors.push({
    id: 'A10',
    x: (startXTopA + startXBottomA) / 2 - blockWidthA - 20,
    y: -blockHeightA / 2,
    rows: A_ROWS,
    cols: A_COLS,
    seatSize,
    hGap,
    vGap,
    color: colorA,
  });

  // сверху 5 (B1..B5)
  const bTopCount = 5;
  const totalWidthTopB = bTopCount * blockWidthB + (bTopCount - 1) * 24;
  let startXTopB = -totalWidthTopB / 2;
  for (let i = 0; i < bTopCount; i++) {
    sectors.push({
      id: `B${i + 1}`,
      x:
        i === 0
          ? leftX_B
          : i === 4
            ? startXTopB + 7
            : i === 2 || i === 3
              ? startXTopB + 10
              : startXTopB,
      y: topY_B,
      rows: B_ROWS,
      cols: i === 0 || i === 4 ? B_COLS - 2 : i === 3 ? B_COLS - 1 : B_COLS,
      seatSize,
      hGap,
      vGap,
      color: colorB,
    });
    startXTopB += blockWidthB + 24;
  }

  // снизу 5 (B6..B10)
  const bBottomCount = 5;
  const totalWidthBottomB =
    bBottomCount * blockWidthB + (bBottomCount - 1) * 24;
  let startXBottomB = -totalWidthBottomB / 2;
  for (let i = 0; i < bBottomCount; i++) {
    sectors.push({
      id: `B${6 + i}`,
      x:
        i === 0
          ? leftX_B
          : i === 4
            ? startXBottomB + 7
            : i === 2 || i === 3
              ? startXBottomB + 10
              : startXBottomB,
      y: bottomY_B,
      rows: B_ROWS,
      cols: i === 0 || i === 4 ? B_COLS - 2 : i === 3 ? B_COLS - 1 : B_COLS,
      seatSize,
      hGap,
      vGap,
      color: colorB,
    });
    startXBottomB += blockWidthB + 24;
  }

  // по бокам (слева/справа)
  const sideYOffset = blockHeightB - 55;

  // слева
  sectors.push({
    id: 'B11',
    x: leftX_B,
    y: -sideYOffset - blockHeightB,
    rows: B_COLS * 2,
    cols: B_ROWS,
    seatSize,
    hGap,
    vGap,
    color: colorB,
  });

  // справа
  sectors.push({
    id: 'B13',
    x: rightX_B,
    y: -sideYOffset - blockHeightB,
    rows: B_COLS * 2,
    cols: B_ROWS,
    seatSize,
    hGap,
    vGap,
    color: colorB,
  });

  let startXTopC = -totalWidthTopC / 2;

  // сверху 6 (C1..C6)
  for (let i = 0; i < cTopCount; i++) {
    sectors.push({
      id: `C${i + 1}`,
      x:
        i === 5
          ? startXTopC + 18
          : i === 0
            ? startXTopC - 17
            : i === 3
              ? startXTopC + 6
              : startXTopC,
      y: topY_C,
      rows: C_ROWS,
      cols: C_COLS,
      seatSize,
      hGap,
      vGap,
      color: colorC,
      diagonal: i === 0 ? 'tr-bl' : i === 5 ? 'br-tl' : undefined,
    });
    startXTopC += blockWidthC + 24;
  }

  // снизу 6 (C7..C12)
  const cBottomCount = 6;
  const totalWidthBottomC =
    cBottomCount * blockWidthC + (cBottomCount - 1) * 24;
  let startXBottomC = -totalWidthBottomC / 2;

  for (let i = 0; i < cBottomCount; i++) {
    sectors.push({
      id: `C${7 + i}`,
      x:
        i === 5
          ? startXBottomC + 18
          : i === 0
            ? startXBottomC - 17
            : i === 3
              ? startXBottomC + 6
              : startXBottomC,
      y: bottomY_C,
      rows: C_ROWS,
      cols: C_COLS,
      seatSize,
      hGap,
      vGap,
      color: colorC,
      diagonal: i === 0 ? 'tl-br' : i === 5 ? 'bl-tr' : undefined,
    });
    startXBottomC += blockWidthC + 24;
  }

  // по одному слева/справа (C13, C14)
  sectors.push({
    id: 'C13',
    x: leftX_C,
    y: -blockHeightC / 2 - 290,
    rows: C_COLS * 2 + 16,
    cols: C_ROWS + 6,
    seatSize,
    hGap,
    vGap,
    color: colorC,
  });

  sectors.push({
    id: 'C14',
    x: rightX_C - 79,
    y: -blockHeightC / 2 - 290,
    rows: C_COLS * 2 + 16,
    cols: C_ROWS + 6,
    seatSize,
    hGap,
    vGap,
    color: colorC,
  });

  return sectors;
})();

function createRectSeats(busySeats: Record<string, boolean>): IRectSeat[] {
  const seats: IRectSeat[] = [];

  SECTORS.forEach((sector) => {
    const { id, x, y, rows, cols, seatSize, hGap, vGap } = sector;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = x + c * (seatSize + hGap);
        const sy = y + r * (seatSize + vGap);
        const seatID = `${id}-R${r + 1}-S${c + 1}`;
        const isBusy = busySeats[seatID];

        seats.push({
          id: seatID,
          sectorId: id,
          isBusy,
          row: r,
          col: c,
          x: sx,
          y: sy,
        });
      }
    }
  });

  return seats;
}

export default function HallScheme({
  eventId,
  detailedData: { price },
}: THallSchemeProps) {
  const wsUrl = ApiEvents.getWSOrders(eventId);
  const { showToast } = useToast();

  const [selectedSeatIds, setSelectedSeatIds] = useState<Array<string>>([]);
  const [busySeats, setBusySeats] = useState<Record<string, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const seatsRef = useRef<IRectSeat[]>(createRectSeats(busySeats));
  const isPanningRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const shouldReconnectRef = useRef(true);

  const { handleZoom, scale, setScale, offset, setOffset } = useZoom(canvasRef);

  useEffect(() => {
    if (!wsUrl) return;

    shouldReconnectRef.current = true;

    const connect = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket подключен');
      };

      ws.onmessage = (event) => {
        try {
          const newOccupiedSeatsArr = JSON.parse(event.data) as Array<string>;
          const set = new Set(newOccupiedSeatsArr);

          setSelectedSeatIds((prev) => prev.filter((item) => !set.has(item)));

          setBusySeats((prev) => {
            const next = { ...prev };
            for (const id of newOccupiedSeatsArr) next[id] = true;
            return next;
          });
        } catch (error) {
          console.error('Ошибка парсинга сообщения:', error);
        }
      };

      ws.onclose = () => {
        if (!shouldReconnectRef.current) return;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [wsUrl]);

  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      bgImageRef.current = img;
      draw();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.translate(centerX + offset.x, centerY + offset.y);
    ctx.scale(scale, scale);

    if (bgImageRef.current) {
      const img = bgImageRef.current;

      const maxW = 1500;
      const maxH = 1200;

      const k = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * k;
      const h = img.height * k;

      const x = -w / 2;
      const y = -h / 2;

      ctx.drawImage(img, x, y, w, h);
    }

    ctx.fillStyle = '#111827';
    ctx.font = '18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ТАНЦПОЛ', 0, 6);

    ctx.fillStyle = 'gray';
    ctx.beginPath();

    ctx.roundRect(stageX, -stageHeight / 2, stageWidth, stageHeight, 10);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '18px system-ui';
    const labelX = -stageWidth * 2 - 20 + stageWidth / 2;
    const labelY = 0;
    ctx.translate(labelX, labelY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('СЦЕНА', 0, 0);
    ctx.restore();

    // сами места
    const localSeatSize = 8;

    seatsRef.current.forEach((seat) => {
      const sector = SECTORS.find((s) => s.id === seat.sectorId)!;
      const isSelected = selectedSeatIds.includes(seat.id);

      const r = sector.seatSize ?? localSeatSize;
      const x = seat.x;
      const y = seat.y;

      if (sector.diagonal) {
        const sx = sector.x;
        const sy = sector.y;
        const w =
          sector.cols * sector.seatSize + (sector.cols - 1) * sector.hGap;
        const h =
          sector.rows * sector.seatSize + (sector.rows - 1) * sector.vGap;

        const centerX = x + r / 2;
        const centerY = y + r / 2;

        let keep = true;

        if (sector.diagonal === 'tl-br') {
          if (centerY - sy > (h / w) * (centerX - sx)) keep = false;
        } else if (sector.diagonal === 'bl-tr') {
          if (centerY - (sy + h) > -(h / w) * (centerX - sx)) keep = false;
        } else if (sector.diagonal === 'tr-bl') {
          if (centerY - sy < -(h / w) * (centerX - (sx + w))) keep = false;
        } else if (sector.diagonal === 'br-tl') {
          if (centerY - (sy + h) < (h / w) * (centerX - (sx + w))) keep = false;
        }

        if (!keep) return;
      }

      ctx.beginPath();
      ctx.roundRect(x, y, r, r, 6);
      ctx.fillStyle = sector.color;

      if (x < stageX || busySeats[seat.id]) {
        ctx.globalAlpha = 0.4;
      } else {
        ctx.globalAlpha = 1;
      }
      ctx.fill();

      if (isSelected && x >= stageX) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = sector.color;
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  const handleClick: MouseEventHandler<HTMLCanvasElement> = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // координаты клика с учётом pan+zoom
    const x = (event.clientX - rect.left - (cx + offset.x)) / scale;
    const y = (event.clientY - rect.top - (cy + offset.y)) / scale;

    let clicked: IRectSeat | null = null;

    for (const seat of seatsRef.current) {
      const sector = SECTORS.find((s) => s.id === seat.sectorId)!;
      const size = sector.seatSize;
      const sx = seat.x;
      const sy = seat.y;

      if (x >= sx && x <= sx + size && y >= sy && y <= sy + size) {
        clicked = seat;
        break;
      }
    }

    if (x >= stageX && !busySeats[clicked?.id] && clicked?.id) {
      setSelectedSeatIds((prev) =>
        prev.includes(clicked.id)
          ? prev.filter((el) => el !== clicked.id)
          : [...prev, clicked.id],
      );
    }
  };

  const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = (event) => {
    isPanningRef.current = true;
    lastPointRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (event) => {
    if (!isPanningRef.current || !lastPointRef.current) return;

    const dx = event.clientX - lastPointRef.current.x;
    const dy = event.clientY - lastPointRef.current.y;

    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastPointRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = () => {
    isPanningRef.current = false;
    lastPointRef.current = null;
  };

  const handleMouseLeave: MouseEventHandler<HTMLCanvasElement> = () => {
    isPanningRef.current = false;
    lastPointRef.current = null;
  };

  async function buySeats() {
    try {
      const data = await ApiEvents.buyTickets(
        eventId,
        selectedSeatIds,
        getCost(selectedSeatIds),
      );
      if (data.status === 'denied') {
        showToast({ message: data.reason, status: 'failed' });
      } else {
        showToast({
          message: `Места Ваши! Сохраните билетный код: ${data.ticket}`,
          status: 'success',
        });
      }
    } catch {
      showToast({ message: 'Неожиданная ошибка!', status: 'failed' })
    }
    setSelectedSeatIds([]);
  }

  const sector_price: Record<string, number> = {
    A: 1500,
    B: 1000,
    C: 0,
  };

  function getCost(seatIds: Array<string>) {
    return seatIds.reduce((sum, seatId) => {
      const sector = seatId[0];
      return sum + price + sector_price[sector];
    }, 0);
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, selectedSeatIds, offset, busySeats]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.topChips}>
        <span className={styles.chip}>
          <span
            className={styles.dot}
            style={{ backgroundColor: COLORS.darkBlue }}
          />
          A-сектора {price + 1500}
        </span>
        <span className={styles.chip}>
          <span className={styles.dot} style={{ backgroundColor: COLORS.blue }} />
          B-сектора {price + 1000}
        </span>
        <span className={styles.chip}>
          <span
            className={styles.dot}
            style={{ backgroundColor: COLORS.orange }}
          />
          C-сектора {price}
        </span>
      </div>

      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={1024}
          height={768}
          className={styles.canvas}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

        <div className={styles.zoomControls}>
          <button onClick={() => handleZoom('in')}>+</button>
          <button onClick={() => handleZoom('out')}>−</button>
        </div>
      </div>

      {selectedSeatIds.length > 0 && (
        <div className={styles.notice}>
          Вы выбрали место{' '}
          <span className={styles.noticeBadge}>
            {selectedSeatIds[selectedSeatIds.length - 1]}
          </span>
          <button onClick={buySeats} className={styles.buyBtn}>
            Купить билеты {getCost(selectedSeatIds)} ₽
          </button>
        </div>
      )}
    </div>
  );
}
