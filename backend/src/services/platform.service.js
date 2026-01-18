import { scrapeLeetCode } from './scraping/leetcode.scraper.js';
import { fetchCodeforcesStats } from './scraping/codeforces.scraper.js';
import { fetchCodeChefStats } from './scraping/codechef.scraper.js';
import { normalizeCodeforces } from './normalization/codeforces.normalizer.js';
import { normalizeCodeChef } from './normalization/codechef.normalizer.js';
import { PLATFORMS, MESSAGES } from '../constants/app.constants.js';
import { AppError, ERROR_CODES } from '../utils/appError.js';
import CacheManager from '../utils/cacheManager.js';
import DataChangeEmitter from '../utils/dataChangeEmitter.js';

/**
 * Platform scraping service - handles all platform data fetching
 * NO DIRECT SERVICE DEPENDENCIES - uses DI container
 */
class PlatformService {
  constructor(container = null) {
    this.container = container;
  }

  /**
   * Fetch user data from LeetCode with caching and real-time updates
   */
  async fetchLeetCodeData(username, userId = null) {
    const cacheKey = CacheManager.generateKey(PLATFORMS.LEETCODE, username);
    
    // Try cache first
    const cached = await CacheManager.get(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    try {
      const data = await scrapeLeetCode(username);
      const result = {
        platform: PLATFORMS.LEETCODE,
        username,
        ...data,
      };
      
      // Cache for 5 minutes
      await CacheManager.set(cacheKey, result, 300);
      
      // Emit real-time update
      if (userId) {
        DataChangeEmitter.emitPlatformUpdate(PLATFORMS.LEETCODE, username, result, userId);
      }
      
      return result;
    } catch (error) {
      throw new AppError(
        `${MESSAGES.SCRAPING_FAILED}: LeetCode`,
        500,
        ERROR_CODES.SCRAPING_ERROR
      );
    }
  }

  /**
   * Fetch user data from Codeforces with caching and real-time updates
   */
  async fetchCodeforcesData(username, userId = null) {
    const cacheKey = CacheManager.generateKey(PLATFORMS.CODEFORCES, username);
    
    // Try cache first
    const cached = await CacheManager.get(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    try {
      const rawData = await fetchCodeforcesStats(username);
      const normalizedData = normalizeCodeforces({ ...rawData, username });
      
      const result = {
        platform: PLATFORMS.CODEFORCES,
        username,
        ...normalizedData,
      };
      
      // Cache for 10 minutes
      await CacheManager.set(cacheKey, result, 600);
      
      // Emit real-time update
      if (userId) {
        DataChangeEmitter.emitPlatformUpdate(PLATFORMS.CODEFORCES, username, result, userId);
      }
      
      return result;
    } catch (error) {
      throw new AppError(
        `${MESSAGES.SCRAPING_FAILED}: Codeforces`,
        500,
        ERROR_CODES.SCRAPING_ERROR
      );
    }
  }

  /**
   * Fetch user data from CodeChef with caching and real-time updates
   */
  async fetchCodeChefData(username, userId = null) {
    const cacheKey = CacheManager.generateKey(PLATFORMS.CODECHEF, username);
    
    // Try cache first
    const cached = await CacheManager.get(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    try {
      const rawData = await fetchCodeChefStats(username);
      const normalizedData = normalizeCodeChef({ ...rawData, username });
      
      const result = {
        platform: PLATFORMS.CODECHEF,
        username,
        ...normalizedData,
      };
      
      // Cache for 10 minutes
      await CacheManager.set(cacheKey, result, 600);
      
      // Emit real-time update
      if (userId) {
        DataChangeEmitter.emitPlatformUpdate(PLATFORMS.CODECHEF, username, result, userId);
      }
      
      return result;
    } catch (error) {
      throw new AppError(
        `${MESSAGES.SCRAPING_FAILED}: CodeChef`,
        500,
        ERROR_CODES.SCRAPING_ERROR
      );
    }
  }

  /**
   * Get supported platforms list
   */
  getSupportedPlatforms() {
    return Object.values(PLATFORMS);
  }

  /**
   * Invalidate cache for user
   */
  async invalidateUserCache(username) {
    const platforms = Object.values(PLATFORMS);
    const promises = platforms.map(platform => {
      const cacheKey = CacheManager.generateKey(platform, username);
      return CacheManager.del(cacheKey);
    });
    
    await Promise.all(promises);
  }

  /**
   * Get activity service (lazy loaded)
   */
  getActivityService() {
    return this.container?.get('activityService');
  }
}

export default PlatformService;