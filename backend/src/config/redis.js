const redis = require('redis');
require('dotenv').config();

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('[SUCCESS] Redis connected successfully');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('[ERROR] Unable to connect to Redis:', error.message);
    // Don't exit process, allow app to run without cache
    redisClient = null;
  }
};

const getCache = async (key) => {
  if (!redisClient || !redisClient.isOpen) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error.message);
    return null;
  }
};

const setCache = async (key, value, ttl = 60) => {
  if (!redisClient || !redisClient.isOpen) return false;

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis set error:', error.message);
    return false;
  }
};

const deleteCache = async (key) => {
  if (!redisClient || !redisClient.isOpen) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error.message);
    return false;
  }
};

const clearCache = async (pattern = '*') => {
  if (!redisClient || !redisClient.isOpen) return false;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis clear error:', error.message);
    return false;
  }
};

module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  clearCache,
  getClient: () => redisClient,
};
