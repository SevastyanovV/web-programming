import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import HallScheme from '@/components/HallScheme/HallScheme';
import type { IDetailingCard } from '@/components/DetailingPage/DetailingPage.type';

import styles from './DetailingPage.module.scss';
import { ApiEvents } from '@/api/api';

export default function DetailingPage() {
  const { id } = useParams();
  const ticketsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [detailedData, setDetailedData] = useState<null | IDetailingCard>(null);

  function handleBack() {
    navigate('/');
  }

  function goToTickets() {
    if (ticketsRef.current) {
      ticketsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  useEffect(() => {
    if (id) {
      ApiEvents.getEvent(Number(id))
        .then((response) => {
          setDetailedData(response.data);
        });
    }
  }, [id]);

  if (detailedData)
    return (
      <div>
        <section
          className={styles.hero}
          style={{ backgroundImage: `url(${detailedData.img_url})` }}
        >
          <div className={styles.overlay} />
          <div className={styles.content}>
            <button className={styles.backBtn} onClick={handleBack}>
              ← Назад
            </button>
            <div className={styles.tags}>
              {detailedData.tags?.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                  {index !== detailedData.tags.length - 1 && ' · '}
                </span>
              ))}
            </div>

            <h1 className={styles.title}>{detailedData.title}</h1>
            <h2 className={styles.subtitle}>{detailedData.author}</h2>

            <div className={styles.meta}>
              <span>Концерт в Москве</span>
              <span className={styles.dot}>•</span>
              <span>Стадион «Дружба»</span>
            </div>

            <div className={styles.actions}>
              <button onClick={goToTickets} className={styles.buyBtn}>
                Купить билеты
              </button>

              <div className={styles.discountBadge}>
                до{' '}
                <span className={styles.discountValue}>
                  -{detailedData.discount}%
                </span>
              </div>
            </div>
          </div>
        </section>
        <div ref={ticketsRef} />
        <HallScheme detailedData={detailedData} eventId={Number(id)} />
      </div>
    );
}
