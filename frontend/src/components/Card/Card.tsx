import type { CardProps } from '@/components/Card/Card.type';
import styles from './Card.module.scss';

export default function Card({
  img_url = 'https://avatars.mds.yandex.net/get-afishanew/4768735/09bf58cce2c1711e7914467fd77a452b/s380x220',
  rating,
  price,
  discount,
  title,
  datetime,
  author,
  id,
  onItemClick,
}: CardProps) {
  return (
    <div className={styles.card} onClick={() => onItemClick(id)}>
      <div className={styles.imageWrapper}>
        <img src={img_url} alt={title} className={styles.image} />

        {rating && (
          <div className={styles.ratingBadge}>{rating.toFixed(1)}</div>
        )}

        <div className={styles.priceRow}>
          {price && <span className={styles.priceFrom}>от {price} ₽</span>}
          {discount && <span className={styles.discount}>до -{discount}%</span>}
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span>{datetime}</span>
          <span className={styles.dot}>•</span>
          <span>{author}</span>
        </div>
      </div>
    </div>
  );
}
