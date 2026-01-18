import CacheManager from '../utils/cacheManager.js';
import { asyncMiddleware } from '../utils/asyncWrapper.js';

/**
 * Cache middleware for API responses
 */
export const cacheMiddleware = (ttlSeconds = 300) => {
  return asyncMiddleware(async (req, res, next) => {
    const cacheKey = `${req.method}:${req.originalUrl}`;
    
    try {
      // Try to get from cache
      const cachedData = await CacheManager.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          ...cachedData,
          cached: true,
          cacheTime: new Date().toISOString()
        });
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data) {
        // Cache successful responses only
        if (res.statusCode === 200 && data.success) {
          CacheManager.set(cacheKey, data, ttlSeconds);
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // Continue without caching
    }
  });
};