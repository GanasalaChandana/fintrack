// lib/toast.ts
import { toast } from 'react-hot-toast';

type ToastMessage = string;

export const showToast = {
  success(message: ToastMessage) {
    toast.success(message, {
      duration: 4000,
    });
  },

  error(message: ToastMessage) {
    toast.error(message, {
      duration: 5000,
    });
  },

  info(message: ToastMessage) {
    toast(message, {
      duration: 4000,
    });
  },

  loading(message: ToastMessage) {
    return toast.loading(message);
  },

  dismiss(id?: string) {
    toast.dismiss(id);
  },
};
