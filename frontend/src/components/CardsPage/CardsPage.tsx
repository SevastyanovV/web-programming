import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

import Card from '@/components/Card/Card';

import type {
  ICard,
  ICardDirectory,
} from '@/components/CardsPage/CardsPage.type';
import styles from './CardsPage.module.scss';
import { ApiEvents } from '@/api/api';

export default function CardsPage() {
  const navigate = useNavigate();
  const [cardsDirectories, setCardsDirectories] = useState<ICardDirectory[]>(
    [],
  );
  const [search, setSearch] = useState('');

  function onItemClick(id: number) {
    navigate(`/detailing/${id}`);
  }

  function filterItem(item: ICard) {
    const filteredItem = {
      title: item.title.toLowerCase(),
      datetime: item.datetime.toLowerCase(),
    };
    const stringItem = JSON.stringify(filteredItem);
    return stringItem.includes(search.toLowerCase());
  }

  useEffect(() => {
    ApiEvents.getEvents()
      .then((response) => {
        const stateItems: ICardDirectory[] = Object.entries(response.data).map(
          ([key, value]) => ({
            directory: key,
            items: value,
          }),
        );
        setCardsDirectories(stateItems);
      });
  }, []);

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>СД</span>
          <span className={styles.logoText}>Стадион «Дружба»</span>
        </div>

        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="События, артисты и места"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>

        <div className={styles.rightBlock}>
          <button className={styles.cityBtn}>
            <span className={styles.cityIcon} />
            <span>Саратов</span>
          </button>

          <button className={styles.avatarBtn}>
            <span className={styles.avatarBorder}>
              <span className={styles.avatarCircle} />
            </span>
          </button>
        </div>
      </header>
      <div className={styles.page}>
        {cardsDirectories.map(({ directory, items }) => (
          <section className={styles.section} key={directory}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{directory}</h2>
              <span className={styles.sectionArrow}>›</span>
            </div>

            <div className={styles.cardsRow}>
              {items.filter(filterItem).map((item) => (
                <Card key={item.id} onItemClick={onItemClick} {...item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
