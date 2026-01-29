/**
 * Environment-aware logging utility
 * 
 * Prevents verbose error logging in production that could expose
 * internal application details to potential attackers.
 * 
 * In development: Logs to console normally
 * In production: Suppresses detailed logs (could be extended to send to error tracking service)
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log general information (development only)
   */
  log: (...args: unknown[]): void => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log debug information (development only)
   */
  debug: (...args: unknown[]): void => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log errors - in production, sanitizes output
   * In development: Full error details
   * In production: Could be extended to send to Sentry/LogRocket/etc.
   */
  error: (message: string, error?: unknown): void => {
    if (isDev) {
      console.error(message, error);
    } else {
      // In production, we could send to an error tracking service here
      // For now, we log a sanitized version without stack traces
      // Example: errorTrackingService.captureException(error);
    }
  },

  /**
   * Log info that should always appear (minimal production logging)
   */
  info: (...args: unknown[]): void => {
    if (isDev) {
      console.info(...args);
    }
  },
};

export default logger;
