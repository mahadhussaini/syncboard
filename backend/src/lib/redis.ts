import { createClient, RedisClientType } from 'redis';
import { redisConfig } from '@/config';
import logger from '@/utils/logger';

class RedisService {
  private client: RedisClientType;
  private subscriber: RedisClientType;
  private publisher: RedisClientType;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: redisConfig.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max reconnection attempts reached');
            return new Error('Redis max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.subscriber = this.client.duplicate();
    this.publisher = this.client.duplicate();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Main client events
    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (err) => {
      logger.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      logger.info('Redis client disconnected');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    // Subscriber events
    this.subscriber.on('connect', () => {
      logger.info('Redis subscriber connected');
    });

    this.subscriber.on('error', (err) => {
      logger.error('Redis subscriber error:', err);
    });

    // Publisher events
    this.publisher.on('connect', () => {
      logger.info('Redis publisher connected');
    });

    this.publisher.on('error', (err) => {
      logger.error('Redis publisher error:', err);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      await this.subscriber.connect();
      await this.publisher.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      await this.subscriber.quit();
      await this.publisher.quit();
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
    }
  }

  // Basic Redis operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      throw error;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET error:', error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<number> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      return await this.client.expire(key, ttl);
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      throw error;
    }
  }

  // Hash operations
  async hGet(key: string, field: string): Promise<string | null> {
    try {
      const value = await this.client.hGet(key, field);
      // Normalize undefined to null for consistent return type
      return value ?? null;
    } catch (error) {
      logger.error('Redis HGET error:', error);
      throw error;
    }
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hSet(key, field, value);
    } catch (error) {
      logger.error('Redis HSET error:', error);
      throw error;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      logger.error('Redis HGETALL error:', error);
      throw error;
    }
  }

  async hDel(key: string, field: string): Promise<number> {
    try {
      return await this.client.hDel(key, field);
    } catch (error) {
      logger.error('Redis HDEL error:', error);
      throw error;
    }
  }

  // List operations
  async lPush(key: string, value: string): Promise<number> {
    try {
      return await this.client.lPush(key, value);
    } catch (error) {
      logger.error('Redis LPUSH error:', error);
      throw error;
    }
  }

  async rPush(key: string, value: string): Promise<number> {
    try {
      return await this.client.rPush(key, value);
    } catch (error) {
      logger.error('Redis RPUSH error:', error);
      throw error;
    }
  }

  async lPop(key: string): Promise<string | null> {
    try {
      return await this.client.lPop(key);
    } catch (error) {
      logger.error('Redis LPOP error:', error);
      throw error;
    }
  }

  async rPop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      logger.error('Redis RPOP error:', error);
      throw error;
    }
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      logger.error('Redis LRANGE error:', error);
      throw error;
    }
  }

  // Set operations
  async sAdd(key: string, member: string): Promise<number> {
    try {
      return await this.client.sAdd(key, member);
    } catch (error) {
      logger.error('Redis SADD error:', error);
      throw error;
    }
  }

  async sRem(key: string, member: string): Promise<number> {
    try {
      return await this.client.sRem(key, member);
    } catch (error) {
      logger.error('Redis SREM error:', error);
      throw error;
    }
  }

  async sMembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS error:', error);
      throw error;
    }
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    try {
      return await this.client.sIsMember(key, member);
    } catch (error) {
      logger.error('Redis SISMEMBER error:', error);
      throw error;
    }
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.publisher.publish(channel, message);
    } catch (error) {
      logger.error('Redis PUBLISH error:', error);
      throw error;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel, callback);
    } catch (error) {
      logger.error('Redis SUBSCRIBE error:', error);
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      logger.error('Redis UNSUBSCRIBE error:', error);
      throw error;
    }
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number): Promise<void> {
    try {
      await this.set(`session:${sessionId}`, JSON.stringify(data), ttl);
    } catch (error) {
      logger.error('Redis SET SESSION error:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<any | null> {
    try {
      const data = await this.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis GET SESSION error:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.del(`session:${sessionId}`);
    } catch (error) {
      logger.error('Redis DELETE SESSION error:', error);
      throw error;
    }
  }

  // Cache operations
  async setCache(key: string, data: any, ttl: number): Promise<void> {
    try {
      await this.set(`cache:${key}`, JSON.stringify(data), ttl);
    } catch (error) {
      logger.error('Redis SET CACHE error:', error);
      throw error;
    }
  }

  async getCache(key: string): Promise<any | null> {
    try {
      const data = await this.get(`cache:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis GET CACHE error:', error);
      throw error;
    }
  }

  async deleteCache(key: string): Promise<void> {
    try {
      await this.del(`cache:${key}`);
    } catch (error) {
      logger.error('Redis DELETE CACHE error:', error);
      throw error;
    }
  }

  // Rate limiting
  async incrementRateLimit(key: string, ttl: number): Promise<number> {
    try {
      const multi = this.client.multi();
      multi.incr(key);
      multi.expire(key, ttl);
      const results = await multi.exec();
      return results?.[0] as number || 0;
    } catch (error) {
      logger.error('Redis RATE LIMIT error:', error);
      throw error;
    }
  }

  // Health check
  async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      logger.error('Redis PING error:', error);
      throw error;
    }
  }

  // Connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
const redisService = new RedisService();

export default redisService; 