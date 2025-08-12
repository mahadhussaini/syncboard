import winston from 'winston';
import { serverConfig } from '@/config';

type LoggerWithExtras = winston.Logger & {
  logRequest: (req: any, res: any, next: any) => void;
  logError: (error: any, req?: any) => void;
  logPerformance: (operation: string, duration: number, metadata?: any) => void;
  logQuery: (query: string, duration: number, params?: any) => void;
  logSecurity: (event: string, details: any) => void;
  logBusiness: (event: string, details: any) => void;
  logWebSocket: (event: string, details: any) => void;
  logRedis: (operation: string, details: any) => void;
  logAI: (operation: string, details: any) => void;
  logCollaboration: (event: string, details: any) => void;
};

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = serverConfig.nodeEnv || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info['timestamp']} ${info['level']}: ${info['message']}`),
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger
const baseLogger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

const logger = baseLogger as LoggerWithExtras;

// Add request logging middleware
logger.logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.http(logMessage);
    }
  });
  
  next();
};

// Add error logging middleware
logger.logError = (error: any, req?: any) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    timestamp: new Date().toISOString(),
  };
  
  logger.error('Application Error:', errorInfo);
};

// Add performance logging
logger.logPerformance = (operation: string, duration: number, metadata?: any) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    metadata,
    timestamp: new Date().toISOString(),
  };
  
  if (duration > 1000) {
    logger.warn('Slow operation detected:', logData);
  } else {
    logger.debug('Performance log:', logData);
  }
};

// Add database query logging
logger.logQuery = (query: string, duration: number, params?: any) => {
  const logData = {
    query,
    duration: `${duration}ms`,
    params,
    timestamp: new Date().toISOString(),
  };
  
  if (duration > 100) {
    logger.warn('Slow database query:', logData);
  } else {
    logger.debug('Database query:', logData);
  }
};

// Add security event logging
logger.logSecurity = (event: string, details: any) => {
  const securityLog = {
    event,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userId: details.userId,
  };
  
  logger.warn('Security event:', securityLog);
};

// Add business event logging
logger.logBusiness = (event: string, details: any) => {
  const businessLog = {
    event,
    details,
    timestamp: new Date().toISOString(),
  };
  
  logger.info('Business event:', businessLog);
};

// Add WebSocket event logging
logger.logWebSocket = (event: string, details: any) => {
  const wsLog = {
    event,
    details,
    timestamp: new Date().toISOString(),
  };
  
  logger.debug('WebSocket event:', wsLog);
};

// Add Redis event logging
logger.logRedis = (operation: string, details: any) => {
  const redisLog = {
    operation,
    details,
    timestamp: new Date().toISOString(),
  };
  
  logger.debug('Redis operation:', redisLog);
};

// Add AI operation logging
logger.logAI = (operation: string, details: any) => {
  const aiLog = {
    operation,
    details,
    timestamp: new Date().toISOString(),
  };
  
  logger.info('AI operation:', aiLog);
};

// Add collaboration event logging
logger.logCollaboration = (event: string, details: any) => {
  const collaborationLog = {
    event,
    details,
    timestamp: new Date().toISOString(),
  };
  
  logger.debug('Collaboration event:', collaborationLog);
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  logger.end();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  logger.end();
});

export default logger; 