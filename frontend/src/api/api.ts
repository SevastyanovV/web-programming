import { getClient } from '@/api/axiosInstance';
import type { ICard } from '@/components/CardsPage/CardsPage.type';

export const ApiEvents = {
  getWSOrders(id: number) {
    return `${process.env.REACT_APP_BASE_URL_WS}ws/event/${id}`;
  },
  async getEvents() {
    return await getClient().get<Record<string, ICard[]>>(`events`);
  },
  async getEvent(id: number) {
    return await getClient().get(`event/${id}`);
  },
  async buyTickets(id: number, selectedSeatIds: Array<string>, cost: number) {
    const response = await getClient().post(`event/${id}/orders`, {
      seats: selectedSeatIds,
      payment: cost,
    });
    return response.data;
  },
};
