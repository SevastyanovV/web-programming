export interface CardProps {
  id: number;
  img_url: string;
  rating: number;
  price: number;
  discount: number;
  title: string;
  datetime: string;
  author: string;
  onItemClick?: (id: number) => void;
}
