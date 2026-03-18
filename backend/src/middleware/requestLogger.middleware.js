import morgan from 'morgan';
import logger from '../config/logger.js';

export const attachRequestId = (req, res, next) => {
  const existing = req.headers['x-request-id'];
  req.requestId = existing || `req_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  res.setHeader('x-request-id', req.requestId);
  next();
};

export const requestLifecycleLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  logger.info('request.received', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info('request.completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userId: req.user?._id?.toString() || null,
      role: req.user?.role || null,
    });
  });

  next();
};

morgan.token('request-id', (req) => req.requestId);
morgan.token('user-id', (req) => req.user?._id?.toString() || '-');

const morganFormat = (tokens, req, res) => JSON.stringify({
  requestId: tokens['request-id'](req, res),
  method: tokens.method(req, res),
  url: tokens.url(req, res),
  statusCode: Number(tokens.status(req, res) || 0),
  durationMs: Number(tokens['response-time'](req, res) || 0),
  contentLength: tokens.res(req, res, 'content-length') || '-',
  userId: tokens['user-id'](req, res),
  ip: tokens['remote-addr'](req, res),
});

export const httpRequestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      try {
        const data = JSON.parse(message.trim());
        logger.http('request.http', data);
      } catch {
        logger.http('request.http', { raw: message.trim() });
      }
    },
  },
  skip: (req) => req.originalUrl === '/api/health',
});
