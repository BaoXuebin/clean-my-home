import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import * as scanner from '../services/scanner.js';
import { logger } from '../logger.js';
import type { ScanEvent, ScanSnapshot } from '../types.js';

/** Map an internal event type to the socket channel name. */
function channelFor(type: string): string {
  switch (type) {
    case 'snapshot':
      return 'scan:snapshot';
    case 'scan-start':
      return 'scan:start';
    case 'agent-start':
      return 'scan:agent-start';
    case 'agent-progress':
      return 'scan:agent-progress';
    case 'agent-done':
      return 'scan:agent-done';
    case 'scan-done':
      return 'scan:done';
    default:
      return 'scan:event';
  }
}

export function setupSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // A scan is global (single in-flight for the whole server): one subscriber
  // fans every scan event out to all connected clients.
  scanner.subscribe((event) => {
    const { type, ...rest } = event as ScanEvent | ScanSnapshot;
    io.emit(channelFor(type), rest);
  });

  io.on('connection', (socket) => {
    logger.info('Client connected', { id: socket.id });
    // Send the current state so a freshly opened dashboard renders immediately.
    socket.emit('scan:snapshot', scanner.snapshot());

    socket.on('scan:start', () => {
      logger.info('Scan requested', { id: socket.id });
      scanner.startScan();
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { id: socket.id });
    });
  });

  return io;
}
