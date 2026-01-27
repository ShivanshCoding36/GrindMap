# Async Error Handling Standardization

## Overview
Standardize async error handling patterns across 199+ async functions to prevent unhandled promise rejections and ensure consistent error responses.

## Current Issues
- Inconsistent error handling: some use try-catch, others rely on middleware, some have no error handling
- Mixed logging: console.warn/error vs Logger
- No standardized async wrapper for non-Express functions
- Platform service has inconsistent error handling patterns

## Implementation Plan

### Phase 1: Create Enhanced Async Error Wrapper
- [ ] Enhance `asyncWrapper.js` with comprehensive error handling utility
- [ ] Add async function wrapper for non-Express contexts
- [ ] Include proper logging and error classification

### Phase 2: Update Core Utilities (High Priority)
- [ ] Update `cacheManager.js` - 3 async functions
- [ ] Update `metricsCollector.js` - 2 async functions
- [ ] Update `messageQueue.js` - 5 async functions
- [ ] Update `databaseManager.js` - 5 async functions
- [ ] Update `advancedCacheManager.js` - 8 async functions

### Phase 3: Update Scraping Services
- [ ] Update `platform.service.js` - 6 async functions (standardize logging)
- [ ] Verify `baseScraper.js` error handling (already good)
- [ ] Check other scraper files for consistency

### Phase 4: Update Remaining Utilities
- [ ] Update `websocketManager.js` - 2 async functions
- [ ] Update `sessionManager.js` - 2 async functions
- [ ] Update `healthMonitor.js` - 2 async functions
- [ ] Update remaining utility files

### Phase 5: Testing and Validation
- [ ] Run existing error handling tests
- [ ] Test error scenarios across services
- [ ] Verify consistent error responses

## Files Modified
- `backend/src/utils/asyncWrapper.js` - Enhanced
- `backend/src/utils/cacheManager.js` - Updated
- `backend/src/utils/metricsCollector.js` - Updated
- `backend/src/utils/messageQueue.js` - Updated
- `backend/src/utils/databaseManager.js` - Updated
- `backend/src/utils/advancedCacheManager.js` - Updated
- `backend/src/services/platform.service.js` - Updated
- And ~40+ other files with async functions

## Expected Outcome
- All async functions have proper error boundaries
- Consistent error logging using Logger
- Standardized error responses
- No unhandled promise rejections
- Better debugging and monitoring capabilities
