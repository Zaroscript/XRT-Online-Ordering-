import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

// Create transports based on environment
const transports = [
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A',
      }),
      printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
  })
];

// Only add file transports in development/local environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const { existsSync, mkdirSync } = require('fs');
  const path = require('path');
  
  // Create logs directory if it doesn't exist
  const logsDir = path.join(process.cwd(), 'logs');
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir);
  }

  transports.push(
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports,
});

export default logger;