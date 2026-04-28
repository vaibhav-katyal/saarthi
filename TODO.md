# Weekly Summary Email Testing Plan

## Steps:
- [ ] Fix week range bug (should summarize PREVIOUS week, not current week)
- [ ] Fix progress bar inline style in email template
- [ ] Create standalone test script `backend/scripts/testWeeklyEmail.js`
- [ ] Add manual test API endpoints to `activityRoutes.js`
- [ ] Add npm script in `backend/package.json`
- [ ] Test by running the script or hitting the endpoint

## Files to Edit:
1. `backend/utils/weeklySummaryHelper.js` - Fix week range to previous week
2. `backend/controllers/testpadController.js` - Fix week range to previous week
3. `backend/views/emails/weekly-summary.ejs` - Fix progress bar style
4. `backend/routes/activityRoutes.js` - Add test endpoints
5. `backend/package.json` - Add test script
6. `backend/scripts/testWeeklyEmail.js` - New test script

