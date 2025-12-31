export interface ICard {
  id: number;
  title: string;
  datetime: string;
  author: string;
  img_url: string;
  price: number;
  rating: number;
  discount: number;
}
export interface ICardDirectory {
  directory: string;
  items: ICard[];
}
