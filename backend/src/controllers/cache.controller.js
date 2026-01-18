import ServiceRegistry from '../services/serviceRegistry.js';
import { sendSuccess } from '../utils/response.helper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

/**
 * Cache management controller
 */
class CacheController {
  /**
   * Invalidate cache for specific user
   */
  invalidateUserCache = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const platformService = ServiceRegistry.getPlatformService();
    
    await platformService.invalidateUserCache(username);
    
    sendSuccess(res, null, `Cache invalidated for user: ${username}`);
  });

  /**
   * Get cache statistics (admin only)
   */
  getCacheStats = asyncHandler(async (req, res) => {
    // This would require Redis INFO command implementation
    sendSuccess(res, { message: 'Cache stats endpoint' }, 'Cache statistics');
  });
}

export default new CacheController();