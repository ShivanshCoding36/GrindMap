# Normalizer Refactoring Task

## Completed Tasks
- [x] Analyzed existing normalizer functions (codeforces, codechef, leetcode)
- [x] Created BaseNormalizer class in common.normalizer.js with standardized input/output contracts
- [x] Refactored CodeforcesNormalizer to extend BaseNormalizer
- [x] Refactored CodeChefNormalizer to extend BaseNormalizer
- [x] Refactored LeetCodeNormalizer to extend BaseNormalizer
- [x] Updated platform.service.js to use normalizeLeetCode consistently
- [x] Updated testScrapers.js to use new input format for normalizeLeetCode

## Remaining Tasks
- [ ] Test the refactored normalizers to ensure they work correctly
- [ ] Verify that the output structures are consistent across platforms
- [ ] Update any other files that might be using the old normalizer functions

## Summary of Changes
- Created a BaseNormalizer class that enforces consistent input format: { username, data }
- Standardized common output fields: platform, username, rating, totalSolved, rank
- Platform-specific fields are added in subclasses (e.g., maxRating for Codeforces, countryRank for CodeChef)
- All normalizers now follow the same pattern and validate inputs consistently
