export interface ToastContextType {
  show: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}