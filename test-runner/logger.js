import winston from 'winston';
import moment from'moment';

const tsFormat = () => moment().format('YYYY-MM-DD hh:mm:ss').trim();

const customFormat = winston.format.printf((info) => {
  return `${tsFormat()} ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: customFormat,
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({
      filename: 'test-runner.log',
    }),
  ],
});

export default logger;
