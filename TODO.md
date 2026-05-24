# EJS Email Implementation Plan

## Progress:
- [x] Understand existing codebase
- [x] Install dependencies (ejs, nodemailer, node-cron)
- [x] Update User model with resetToken and resetTokenExpiry fields
- [x] Create views/emails directory and EJS templates
- [x] Create utils/emailService.js
- [x] Create utils/emailScheduler.js
- [x] Create utils/weeklySummaryHelper.js
- [x] Update authController.js with forgotPassword, resetPassword, verifyResetToken
- [x] Update authRoutes.js
- [x] Update server.js to start scheduler

## Files Created/Modified:

### New Files:
1. `backend/views/emails/password-reset.ejs` - Styled password reset email template
2. `backend/views/emails/weekly-summary.ejs` - Styled weekly summary email template
3. `backend/utils/emailService.js` - Email sending utility with EJS rendering
4. `backend/utils/emailScheduler.js` - Cron job for weekly Sunday emails
5. `backend/utils/weeklySummaryHelper.js` - Weekly stats calculation helper

### Modified Files:
1. `backend/models/User.js` - Added resetToken and resetTokenExpiry fields
2. `backend/controllers/authController.js` - Added forgotPassword, resetPassword, verifyResetToken
3. `backend/routes/authRoutes.js` - Added new routes
4. `backend/server.js` - Set EJS view engine, started email scheduler

## API Endpoints:
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify-reset-token/:token` - Verify reset token

## Environment Variables Needed:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=Saarthi <noreply@saarthi.dev>
FRONTEND_URL=http://localhost:5173
```

## To Test:
1. Run `cd backend && npm install` to install new dependencies
2. Add SMTP credentials to `.env` file
3. Restart backend server
4. Test forgot password flow
5. Weekly emails will auto-send every Sunday at 9 AM

