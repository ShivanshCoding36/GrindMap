// Simple request validation middleware
export const validateUsername = (req, res, next) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({
      success: false,
      error: 'Username is required'
    });
  }
  
  // Basic validation
  if (typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Username must be a non-empty string'
    });
  }
  
  // Length validation
  if (username.length > 50) {
    return res.status(400).json({
      success: false,
      error: 'Username too long (max 50 characters)'
    });
  }
  
  // Character validation (alphanumeric, underscore, hyphen only)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({
      success: false,
      error: 'Username contains invalid characters'
    });
  }
  
  // Sanitize and continue
  req.params.username = username.trim();
  next();
};

// Platform validation
export const validatePlatform = (req, res, next) => {
  const { platform } = req.params;
  const validPlatforms = ['leetcode', 'codeforces', 'codechef', 'atcoder', 'github', 'skillrack'];
  
  if (!platform || !validPlatforms.includes(platform.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid platform',
      validPlatforms
    });
  }
  
  req.params.platform = platform.toLowerCase();
  next();
};