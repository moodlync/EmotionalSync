/**
 * Simplified logger for MoodLync authentication system
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class SimplifiedLogger {
  private level: LogLevel;
  private useSimplifiedAuth: boolean;

  constructor() {
    this.level = process.env.LOG_LEVEL ? 
      parseInt(process.env.LOG_LEVEL) : 
      LogLevel.INFO;
    
    this.useSimplifiedAuth = process.env.USE_SIMPLIFIED_AUTH === 'true';
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    const prefix = this.useSimplifiedAuth ? '[SIMPLIFIED AUTH]' : '[AUTH]';
    return `${timestamp} ${prefix} ${level}: ${message}`;
  }

  debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message));
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message));
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message));
    }
  }

  error(message: string): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message));
    }
  }

  // Method for logging detailed authentication events
  logAuth(event: string, details: any): void {
    if (this.level <= LogLevel.INFO) {
      const detailsStr = JSON.stringify(details, null, 2);
      console.info(this.formatMessage('AUTH', `${event}\n${detailsStr}`));
    }
  }

  // Method for debugging HTTP requests
  logRequest(method: string, path: string, status: number, duration: number): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('REQUEST', `${method} ${path} ${status} ${duration}ms`));
    }
  }
}

// Create and export a singleton instance
export const logger = new SimplifiedLogger();