import { IDetailingCard } from "../DetailingPage/DetailingPage.type";

export interface IRectSector {
  id: string;
  x: number; // левый верхний угол сектора (в условных единицах)
  y: number;
  rows: number;
  cols: number;
  seatSize: number;
  hGap: number; // горизонтальный отступ между местами
  vGap: number; // вертикальный отступ
  color: string;
  diagonal?: string;
}

export interface IRectSeat {
  id: string;
  sectorId: string;
  isBusy?: boolean;
  row: number;
  col: number;
  x: number;
  y: number;
}

export type THallSchemeProps = {
  eventId: number;
  detailedData: IDetailingCard | null;
};
