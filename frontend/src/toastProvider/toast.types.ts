export type ToastStatus = 'success' | 'failed';

export type Toast = {
  id: string;
  message: string;
  status: ToastStatus;
  createdAt: number;
};
