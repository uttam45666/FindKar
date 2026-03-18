import dns from "dns";
dns.setServers(["1.1.1.1", "1.0.0.1"]);

import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import logger from './src/config/logger.js';

const PORT = process.env.PORT || 5000;
const KILL_ALL_NODE_COMMAND = 'taskkill /F /IM node.exe';

const logWithKillCommand = (event, payload = {}) => {
  logger.error(event, {
    ...payload,
    commandTerminateAllNodeProcesses: KILL_ALL_NODE_COMMAND,
  });
};

process.on('uncaughtException', (err) => {
  logWithKillCommand('process.uncaughtException', { message: err.message, stack: err.stack });
});

process.on('unhandledRejection', (err) => {
  logWithKillCommand('process.unhandledRejection', { message: err?.message, stack: err?.stack });
});

connectDB().then(() => {
  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const windowsFindPid = `netstat -ano | findstr :${PORT}`;
      const windowsKillByPid = 'Stop-Process -Id <PID> -Force';
      const windowsOneLiner = `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT} ^| findstr LISTENING') do taskkill /PID %a /F`;

      logger.error('server.port.inUse', {
        port: PORT,
        message: `Port ${PORT} is already in use. Stop the existing process or change PORT in env.`,
        commandFindPid: windowsFindPid,
        commandKillByPid: windowsKillByPid,
        commandKillPortOneLiner: windowsOneLiner,
        commandTerminateAllNodeProcesses: KILL_ALL_NODE_COMMAND,
      });
      process.exit(1);
      return;
    }

    logWithKillCommand('server.start.failed', { message: err.message, stack: err.stack });
    process.exit(1);
  });

  server.listen(PORT, () => {
    logger.info('server.started', {
      port: PORT,
      env: process.env.NODE_ENV || 'development',
    });
  });
}).catch((err) => {
  logWithKillCommand('db.connection.failed', { message: err.message, stack: err.stack });
  process.exit(1);
});
