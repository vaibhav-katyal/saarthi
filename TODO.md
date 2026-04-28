# Fix Weekly Summary Panel Showing 0 Stats on Dashboard

## Root Cause
The `getWeeklySummary` function in `testpadService.js` calculated date range for **PREVIOUS WEEK** (last Sunday → last Saturday) instead of **CURRENT WEEK** (this Sunday → this Saturday). The dashboard displays "Current Week Summary" but fetched data from the week that already ended, resulting in 0 stats for users who hadn't solved problems in the previous week.

## Changes Made

### Step 1 ✅ `backend/services/testpadService.js`
- **Fixed date range**: Changed `startOfWeek.setDate(now.getDate() - dayOfWeek - 7)` to `startOfWeek.setDate(now.getDate() - dayOfWeek)` so the dashboard now looks at the **current ongoing week** instead of the previous week.
- **Added CodeDuel wins to problemsSolved**: `problemsSolved = testpadResults.length + codeDuelWins.length`
- **Added MCQ timestamps tracking**: New `mcqTimestamps` array captures timestamps from `mcq.log` entries
- **Included MCQ activity in activeDays & bestDay**: MCQ quiz completion timestamps now contribute to active days count and best day detection

### Step 2 ✅ `backend/utils/weeklySummaryHelper.js`
- **Kept previous-week date range**: Correctly remains on last week since this is for Sunday morning email summaries ("week that just ended")
- **Applied same enhancements**: Added CodeDuel wins to problemsSolved, included MCQ timestamps in activeDays/bestDay for consistency between dashboard and email summaries

### Step 3 ✅ No frontend changes needed
- `Dashboard.tsx` already consumes `weekly-summary` endpoint data correctly — no UI changes required

## Testing
- Restart backend server
- Log in and solve a problem or complete an MCQ quiz
- Dashboard "Weekly Summary" panel should now reflect current week's live stats

