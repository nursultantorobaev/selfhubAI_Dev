/**
 * Logger utility for production-safe logging
 * Only logs errors in development, silently fails in production
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      if (error) {
        console.error(`[Error] ${message}`, error);
      } else {
        console.error(`[Error] ${message}`);
      }
    }
    // In production, you could send to error tracking service (Sentry, etc.)
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data) {
        console.warn(`[Warning] ${message}`, data);
      } else {
        console.warn(`[Warning] ${message}`);
      }
    }
  },
  
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      if (data) {
        console.info(`[Info] ${message}`, data);
      } else {
        console.info(`[Info] ${message}`);
      }
    }
  },
};


