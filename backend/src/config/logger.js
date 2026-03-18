import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat()
);

const formatPrimitive = (value) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const buildReadableMeta = (meta) => {
  const lines = [];
  const preferredOrder = [
    'requestId', 'method', 'url', 'statusCode', 'durationMs',
    'userId', 'role', 'ip', 'userAgent', 'port', 'env',
    'commandTerminateAllNodeProcesses',
    'commandFindPid', 'commandKillByPid', 'commandKillPortOneLiner',
  ];

  for (const key of preferredOrder) {
    if (meta[key] !== undefined) {
      lines.push(`  ${key}: ${formatPrimitive(meta[key])}`);
    }
  }

  for (const [key, value] of Object.entries(meta)) {
    if (preferredOrder.includes(key)) continue;
    lines.push(`  ${key}: ${formatPrimitive(value)}`);
  }

  return lines.join('\n');
};

const devFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: false }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const readableMeta = buildReadableMeta(meta);
    const header = `${timestamp} [${level}] ${message}`;
    const block = readableMeta ? `\n${readableMeta}` : '';
    const stackBlock = stack ? `\n  stack:\n${stack.split('\n').map((line) => `    ${line}`).join('\n')}` : '';
    return `${header}${block}${stackBlock}\n`;
  })
);

const prodFormat = winston.format.combine(baseFormat, winston.format.json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  format: prodFormat,
  defaultMeta: { service: 'findkar-backend', env },
  transports: [
    new winston.transports.Console({
      format: isDev ? devFormat : prodFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: prodFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: prodFormat,
    }),
  ],
  exitOnError: false,
});

export default logger;
