import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import DatabasePoolMonitor from './utils/databasePoolMonitor.js';
import dbManager from './utils/databaseManager.js';
import { corsOptions } from './config/cors.js';
import passport from 'passport';
import configurePassport from './config/passport.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { securityHeaders } from './middlewares/security.middleware.js';
import { securityHeaders as helmetHeaders, additionalSecurityHeaders } from './middlewares/security.headers.middleware.js';
import { sanitizeInput, sanitizeMongoQuery, preventParameterPollution } from './middlewares/sanitization.middleware.js';
import { enhancedSecurityHeaders } from './middlewares/enhancedSecurity.middleware.js';
import { requestLogger, securityMonitor } from './middlewares/logging.middleware.js';
import { sanitizeInput as validationSanitize } from './middlewares/validation.middleware.js';
import { advancedRateLimit } from './middlewares/antiBypassRateLimit.middleware.js';
import { correlationId } from './middlewares/correlationId.middleware.js';
import { performanceMetrics } from './middlewares/performance.middleware.js';
import {
  distributedRateLimit,
  botDetection,
  geoSecurityCheck,
  securityAudit,
  abuseDetection
} from './middlewares/advancedSecurity.middleware.js';
import { autoRefresh } from './middlewares/jwtManager.middleware.js';
import { globalErrorBoundary } from './middlewares/errorBoundary.middleware.js';
import DistributedSessionManager from './utils/distributedSessionManager.js';
import WebSocketManager from './utils/websocketManager.js';
import BatchProcessingService from './services/batchProcessing.service.js';
import CacheWarmingService from './utils/cacheWarmingService.js';
import RobustJobQueue from './utils/robustJobQueue.js';
import CronScheduler from './services/cronScheduler.service.js';
import ReliableJobHandlers from './services/reliableJobHandlers.service.js';
import HealthMonitor from './utils/healthMonitor.js';
import AlertManager from './utils/alertManager.js';
import { performanceMonitoring, errorTracking, memoryMonitoring } from './middlewares/monitoring.middleware.js';
import RequestManager from './utils/requestManager.js';
import PuppeteerManager from './utils/puppeteerManager.js';

// Import setup functions
import { setupMiddlewares } from './middlewares/index.js';
import { setupRoutes } from './routes/index.js';
import { initializeServices } from './services/index.js';

// Import secure logger to prevent JWT exposure
import './utils/secureLogger.js';
// Import constants
import { HTTP_STATUS, ENVIRONMENTS } from './constants/app.constants.js';
import Logger from './utils/logger.js';

// Set default NODE_ENV if not provided
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Validate environment on startup
validateEnvironment();

// Start memory monitoring
memoryMonitor.start();

// Start CPU monitoring
cpuMonitor.start();

// Start bandwidth monitoring
bandwidthMonitor.start();

// Set process resource limits
processLimiter.setLimits();

// Setup memory event handlers
memoryMonitor.on('warning', ({ usage, ratio }) => {
  console.warn(`⚠️ Memory warning: ${Math.round(ratio * 100)}% usage`);
});

memoryMonitor.on('critical', ({ usage, ratio }) => {
  console.error(`🚨 Memory critical: ${Math.round(ratio * 100)}% usage`);
  cacheManager.cleanup(); // Clean expired cache entries
});

memoryMonitor.on('emergency', ({ usage, ratio }) => {
  console.error(`💥 Memory emergency: ${Math.round(ratio * 100)}% usage`);
  cacheManager.clearAll(); // Clear all caches
});

// Setup CPU event handlers
cpuMonitor.on('warning', ({ cpuPercent }) => {
  console.warn(`⚠️ CPU warning: ${cpuPercent.toFixed(1)}% usage`);
});

cpuMonitor.on('critical', ({ cpuPercent }) => {
  console.error(`🚨 CPU critical: ${cpuPercent.toFixed(1)}% usage`);
  // Trigger garbage collection to free up resources
  if (global.gc) global.gc();
});

cpuMonitor.on('emergency', ({ cpuPercent }) => {
  console.error(`💥 CPU emergency: ${cpuPercent.toFixed(1)}% usage`);
  // Emergency cleanup
  cacheManager.clearAll();
  if (global.gc) {
    global.gc();
    global.gc(); // Double GC in emergency
  }
});

const app = express();
const PORT = process.env.PORT || 5001;

// Setup middlewares
setupMiddlewares(app);

// Setup routes
setupRoutes(app);

// Start server function
const startServer = async () => {
  try {
    // Initialize services after database connection
    BatchProcessingService.startScheduler();
    CacheWarmingService.startDefaultSchedules();

    // Register job handlers
    JobQueue.registerHandler('scraping', JobHandlers.handleScraping);
    JobQueue.registerHandler('cache_warmup', JobHandlers.handleCacheWarmup);
    JobQueue.registerHandler('analytics', JobHandlers.handleAnalytics);
    JobQueue.registerHandler('notification', JobHandlers.handleNotification);
    JobQueue.registerHandler('cleanup', JobHandlers.handleCleanup);
    JobQueue.registerHandler('export', JobHandlers.handleExport);

    // Start job processing
    JobQueue.startProcessing({ concurrency: 3, types: [] });

    CronScheduler.start();
    HealthMonitor.startMonitoring(30000);

    server.listen(PORT, () => {
      Logger.info('Server started', {
        port: PORT,
        environment: NODE_ENV,
        healthCheck: `http://localhost:${PORT}/health`,
        websocket: `ws://localhost:${PORT}/ws`,
        features: ['distributed-rate-limiting', 'distributed-sessions', 'real-time-updates'],
      });
    });
  } catch (error) {
    console.error('Failed to connect to database FATAL:', error);
    process.exit(1);
  }
};

/**
 * ✅ CHANGE #6 (WRAPPED)
 * Do NOT start listening server during tests.
 */
if (!IS_TEST) {
  startServer();
}

// Setup connection management
const connManager = connectionManager(server);

// Track bandwidth usage
server.on('request', (req, res) => {
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const size = chunk ? Buffer.byteLength(chunk, encoding) : 0;
    bandwidthMonitor.trackUsage(req.ip || req.socket.remoteAddress, size);
    return originalEnd.call(this, chunk, encoding);
  };
});

gracefulShutdown(server, connManager);
