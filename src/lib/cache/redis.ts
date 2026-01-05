/**
 * @fileoverview Redis client for persistent storage
 * @description Redis client utility with fallback to in-memory storage
 */

import Redis from 'ioredis';
import { Logger } from '@/lib/utils/logger';

let redisClient: Redis | null = null;
let isRedisAvailable = false;
let initAttempted = false;
let hasLoggedConnectionFailure = false;
let connectionPromise: Promise<void> | null = null;
let healthCheckInterval: NodeJS.Timeout | null = null;

/**
 * Initialize Redis client (only called once)
 */
function initRedis(): void {
  // Prevent multiple initialization attempts
  if (initAttempted) return;
  initAttempted = true;

  try {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      Logger.info('Redis IO FAST KEY', 'Redis URL not configured. Using in-memory fallback for account lockout.');
      return;
    }

    // Parse Redis URL manually to handle special characters in password
    // new URL() fails with special chars, so we use regex parsing
    let redisConfig: string | any = redisUrl;

    try {
      // Manual regex parsing: redis://:password@host:port or redis://username:password@host:port
      // This handles special characters that new URL() can't parse
      // Pattern: redis://[:username][:password]@host:port
      // If username is omitted, format is redis://:password@host:port
      const redisUrlPattern = /^(rediss?):\/\/(?:(?:([^:@]+):)?([^@]+)@)?([^:]+):(\d+)$/;
      const match = redisUrl.match(redisUrlPattern);

      if (match) {
        let [, protocol, username, passwordOrEmpty, hostname, port] = match;

        // Handle redis://:password@host:port format (no username, password starts with :)
        // In this case, passwordOrEmpty will include the leading :
        let password: string | undefined;
        let finalUsername: string | undefined = username || undefined;
        if (passwordOrEmpty && passwordOrEmpty.startsWith(':')) {
          // Format: redis://:password@host
          password = passwordOrEmpty.substring(1); // Remove leading :
          finalUsername = undefined;
        } else if (username) {
          // Format: redis://username:password@host
          password = passwordOrEmpty;
        } else {
          // No authentication: redis://host:port
          password = undefined;
        }

        // Decode password (it might be URL encoded)
        // Note: Some special characters in passwords might need URL encoding in REDIS_URL
        let decodedPassword: string | undefined;
        if (password) {
          decodedPassword = password;
          try {
            decodedPassword = decodeURIComponent(password);
            // If password was URL encoded, it's now decoded
          } catch {
            decodedPassword = password; // Use as-is if decoding fails
          }

          // Log password length for debugging (not the actual password)
          Logger.info('Redis IO FAST KEY', `Password length: ${decodedPassword.length} characters`);
        }

        // Build config object (better for special characters)
        if (finalUsername) {
          let decodedUsername = finalUsername;
          try {
            decodedUsername = decodeURIComponent(finalUsername);
          } catch {
            decodedUsername = finalUsername;
          }
          redisConfig = {
            host: hostname,
            port: parseInt(port),
            username: decodedUsername,
            password: decodedPassword,
            tls: protocol === 'rediss' ? {} : undefined,
          };
          Logger.info('Redis IO FAST KEY', `Using parsed Redis config (username+password) at ${hostname}:${port}`);
        } else if (decodedPassword) {
          // Only password (no username) - most common case
          // For Redis 6+ with requirepass, password is for default user
          // ioredis handles this automatically, no need to specify username
          redisConfig = {
            host: hostname,
            port: parseInt(port),
            password: decodedPassword,
            tls: protocol === 'rediss' ? {} : undefined,
          };
          Logger.info('Redis IO FAST KEY', `Using parsed Redis config (password only) at ${hostname}:${port}`);
        } else {
          // No authentication
          redisConfig = {
            host: hostname,
            port: parseInt(port),
            tls: protocol === 'rediss' ? {} : undefined,
          };
          Logger.info('Redis IO FAST KEY', `Using parsed Redis config (no auth) at ${hostname}:${port}`);
        }
      } else {
        // Regex didn't match - try standard URL parsing as fallback
        try {
          const url = new URL(redisUrl);
          const maskedUrl = `${url.protocol}//${url.hostname}:${url.port || '6379'}`;
          Logger.info('Redis IO FAST KEY', `Attempting to connect to Redis at: ${maskedUrl} (using URL string)`);
          redisConfig = redisUrl;
        } catch {
          Logger.warn('Redis IO FAST KEY', `Redis URL format might be invalid: ${redisUrl.substring(0, 30)}...`);
          redisConfig = redisUrl;
        }
      }
    } catch (parseError) {
      Logger.warn('Redis IO FAST KEY', 'Could not parse Redis URL, using as-is');
      redisConfig = redisUrl;
    }

    // Create Redis client from URL or config object
    // Supports: redis://, rediss://, redis://:password@host:port, redis://username:password@host:port
    redisClient = new Redis(redisConfig, {
      retryStrategy: (times) => {
        // Limit retries - stop after 5 attempts (max ~10 seconds)
        if (times > 5) {
          return null; // Stop retrying
        }
        const delay = Math.min(times * 100, 2000);
        return delay;
      },
      maxRetriesPerRequest: 1, // Reduce retries per request
      enableReadyCheck: true,
      lazyConnect: true, // Don't connect immediately
      connectTimeout: 5000, // 5 seconds timeout
      keepAlive: 30000, // Keep connection alive
    });

    // Handle connection events (only log once)
    let hasLoggedConnect = false;
    redisClient.on('connect', () => {
      if (!hasLoggedConnect) {
        hasLoggedConnect = true;
        Logger.info('Redis IO FAST KEY', 'Redis client connecting...');
      }
    });

    redisClient.on('ready', () => {
      isRedisAvailable = true;
      hasLoggedConnectionFailure = false; // Reset failure flag on success
      Logger.success('Redis IO FAST KEY', 'Redis client initialized successfully for persistent storage.');
      
      // Start health check when ready
      startHealthCheck();
    });

    redisClient.on('error', (error: any) => {
      // Only log error once to avoid spam, but with more details
      if (!hasLoggedConnectionFailure) {
        hasLoggedConnectionFailure = true;

        // Extract detailed error information
        let errorDetails = error.message || 'Unknown error';
        if (error.code) {
          errorDetails += ` (code: ${error.code})`;
        }
        if (error.errno) {
          errorDetails += ` (errno: ${error.errno})`;
        }
        if (error.syscall) {
          errorDetails += ` (syscall: ${error.syscall})`;
        }
        if (error.address) {
          errorDetails += ` (address: ${error.address})`;
        }
        if (error.port) {
          errorDetails += ` (port: ${error.port})`;
        }

        Logger.error('Redis IO FAST KEY', `Redis connection failed: ${errorDetails}. Using in-memory fallback.`, error);
      }
      isRedisAvailable = false;
    });

    redisClient.on('close', () => {
      // Only log close once to avoid spam
      if (!hasLoggedConnectionFailure && redisClient?.status !== 'end') {
        hasLoggedConnectionFailure = true;
        Logger.warn('Redis IO FAST KEY', 'Redis connection closed. Using in-memory fallback.');
      }
      isRedisAvailable = false;
    });

    redisClient.on('end', () => {
      isRedisAvailable = false;
      // Don't log 'end' - it's normal after close
    });

    // Attempt to connect (lazy connect means we need to call connect manually)
    connectionPromise = redisClient.connect().catch((error: any) => {
      if (!hasLoggedConnectionFailure) {
        hasLoggedConnectionFailure = true;

        // Extract detailed connection error information
        let errorDetails = error.message || 'Unknown connection error';
        if (error.code) {
          errorDetails += ` (code: ${error.code})`;
        }
        if (error.errno) {
          errorDetails += ` (errno: ${error.errno})`;
        }
        if (error.syscall) {
          errorDetails += ` (syscall: ${error.syscall})`;
        }
        if (error.address) {
          errorDetails += ` (address: ${error.address})`;
        }
        if (error.port) {
          errorDetails += ` (port: ${error.port})`;
        }

        // Common error codes explanation
        if (error.code === 'ECONNREFUSED') {
          errorDetails += ' - Connection refused. Is Redis server running?';
        } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
          errorDetails += ' - Host not found. Check REDIS_URL hostname.';
        } else if (error.code === 'ETIMEDOUT') {
          errorDetails += ' - Connection timeout. Check network/firewall.';
        }

        Logger.error('Redis IO FAST KEY', `Failed to connect to Redis: ${errorDetails}. Using in-memory fallback.`, error);
      }
      isRedisAvailable = false;
    }).finally(() => {
      connectionPromise = null;
    });
  } catch (error) {
    Logger.error('Redis IO FAST KEY', 'Failed to initialize Redis client. Using in-memory fallback.', error);
    isRedisAvailable = false;
    redisClient = null;
  }
}

/**
 * Get Redis client (lazy initialization - only once)
 */
export function getRedisClient(): Redis | null {
  // Only initialize if not already attempted and URL is present
  if (!initAttempted && process.env.REDIS_URL) {
    initRedis();
  }
  return redisClient;
}

/**
 * Check if Redis is available and connected (or connecting)
 */
export function isRedisEnabled(): boolean {
  if (!redisClient) return false;

  // Check if client is connected or connecting (ioredis queues commands while connecting)
  const status = redisClient.status;
  return status === 'ready' || status === 'connect' || status === 'connecting';
}

/**
 * Start periodic health check for Redis connection
 * Checks connection every 30 seconds and attempts reconnection if needed
 */
function startHealthCheck(): void {
  // Clear any existing health check interval
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  // Only run health check if Redis client exists and we're in a Node.js environment
  if (typeof setInterval === 'undefined' || !redisClient) {
    return;
  }

  healthCheckInterval = setInterval(async () => {
    if (!redisClient) return;

    try {
      // Check if connection is healthy
      const status = redisClient.status;
      
      // If disconnected or ended, try to reconnect
      if (status === 'end' || status === 'close') {
        Logger.warn('Redis IO FAST KEY', 'Redis connection lost, attempting to reconnect...');
        isRedisAvailable = false;
        
        try {
          await redisClient.connect();
          Logger.success('Redis IO FAST KEY', 'Redis connection reestablished.');
          isRedisAvailable = true;
        } catch (reconnectError) {
          Logger.error('Redis IO FAST KEY', 'Failed to reconnect to Redis.', reconnectError);
          isRedisAvailable = false;
        }
      } else if (status === 'ready') {
        // Perform a ping to verify connection is actually working
        try {
          await redisClient.ping();
          isRedisAvailable = true;
        } catch (pingError) {
          Logger.warn('Redis IO FAST KEY', 'Redis ping failed, connection may be unhealthy.');
          isRedisAvailable = false;
        }
      }
    } catch (error) {
      Logger.error('Redis IO FAST KEY', 'Health check failed.', error);
      isRedisAvailable = false;
    }
  }, 30000); // Check every 30 seconds
}

/**
 * Stop health check interval (useful for cleanup)
 */
function stopHealthCheck(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

/**
 * Initialize Redis on module load (if URL is present)
 */
if (process.env.REDIS_URL) {
  initRedis();
}
