/**
 * Logger with request ID support
 */
export class Logger {
  constructor(private requestId: string) {}

  /**
   * Log info message
   */
  info(message: string, data?: unknown): void {
    console.log(`[${this.requestId}] ${message}`, data || '');
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown): void {
    console.error(`[${this.requestId}] ${message}`, error || '');
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown): void {
    console.warn(`[${this.requestId}] ${message}`, data || '');
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.requestId}] ${message}`, data || '');
    }
  }
}

/**
 * Create logger instance with request ID
 */
export function createLogger(requestId: string): Logger {
  return new Logger(requestId);
}












