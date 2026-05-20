/**
 * @fileoverview Weekly summary email tests.
 * What is being tested:
 *  - Weekly summary service function triggers nodemailer sendMail
 *  - Weekly summary service does NOT send real emails
 * Expected results:
 *  - sendMail() is called exactly once
 *  - called with expected `to` and weekly summary subject format
 */

// Mock nodemailer is provided globally in tests/setup.js

const nodemailer = require('../backend/node_modules/nodemailer');





// Mock Mongo model and weekly helper to keep test deterministic.
jest.mock('../backend/models/User', () => ({
  __esModule: true,
  findById: jest.fn(),
}));

jest.mock('../backend/utils/weeklySummaryHelper', () => ({
  __esModule: true,
  getWeeklySummaryForUser: jest.fn(),
}));

const User = require('../backend/models/User');
const { getWeeklySummaryForUser } = require('../backend/utils/weeklySummaryHelper');
const { sendWeeklySummaryToUser } = require('../backend/utils/emailScheduler');

describe('Weekly Summary Email', () => {
  test('sendWeeklySummaryToUser triggers nodemailer sendMail without sending real emails', async () => {
    jest.clearAllMocks();

    // Arrange
    // emailScheduler calls: await User.findById(userId).select('name email')
    // So User.findById() must return an object with select() that returns a promise
    // resolving to the user doc.
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'user1',
        name: 'Test User',
        email: 'user@example.com',
      }),
    });




    const summary = {
      problemsSolved: 3,
      mcqsAttempted: 10,
      accuracy: 80,
      activeDays: 4,
      bestDay: 'Mon 01',
      weekStart: '2025-01-01',
      weekEnd: '2025-01-07',
    };

    getWeeklySummaryForUser.mockResolvedValue(summary);

    // Act
    const result = await sendWeeklySummaryToUser('user1');

    // Assert
    expect(result.success).toBe(true);

    // nodemailer.createTransport() is called inside emailService when sending.
    // We verify that the created transport's sendMail was invoked.
    const transport = nodemailer.createTransport.mock.results[0].value;

    expect(transport.sendMail).toHaveBeenCalledTimes(1);

    const mailArgs = transport.sendMail.mock.calls[0][0];
    expect(mailArgs).toHaveProperty('to', 'user@example.com');
    expect(mailArgs.subject).toContain('Your Weekly Summary');
    expect(mailArgs.subject).toContain('2025-01-01');
    expect(mailArgs.subject).toContain('2025-01-07');
  });
});

