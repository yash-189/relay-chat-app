import { toast as sonner } from "sonner";

interface ToastOptions {
  description?: string;
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    sonner.success(message, options),
  error: (message: string, options?: ToastOptions) =>
    sonner.error(message, options),
};
