export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export class Logger {
  static log(level: LogLevel, message: string, metadata?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, metadata || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, metadata || '');
        break;
      case LogLevel.INFO:
        console.log(logMessage);
        break;
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, metadata || '');
        }
        break;
    }
  }

  static error(message: string, metadata?: any) {
    this.log(LogLevel.ERROR, message, metadata);
  }

  static warn(message: string, metadata?: any) {
    this.log(LogLevel.WARN, message, metadata);
  }

  static info(message: string, metadata?: any) {
    this.log(LogLevel.INFO, message, metadata);
  }

  static debug(message: string, metadata?: any) {
    this.log(LogLevel.DEBUG, message, metadata);
  }
}
