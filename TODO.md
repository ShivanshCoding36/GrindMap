# Bug Fix: Platform Details UI Bug

## Description
Fixed the UI bug where the platform details section was not displaying the correct data for the selected platform.

## Changes Made

### Backend Normalizers
- **codeforces.normalizer.js**: Added `totalSolved` field to match frontend expectations.
- **codechef.normalizer.js**: Updated to return `problem_fully_solved`, `global_rank`, `country_rank`, and `total_stars` fields.

### Frontend Hook
- **useGrindMapData.js**: Updated to use normalized data directly from API responses and fixed totalSolved calculation to use `totalSolved` for Codeforces.

## Root Cause
The bug was caused by mismatched field names between backend data normalization and frontend data expectations:
- Codeforces normalizer was missing `totalSolved` field.
- CodeChef normalizer was using `problemsSolved` instead of `problem_fully_solved`.
- Frontend hook was trying to access nested `stats` object that no longer existed after normalization.

## Testing
- Verify that platform cards display correct solved counts in summary.
- Verify that expanded details show correct data for each platform.
- Verify that overall total solved count is accurate.
