// Jest global setup for Saarthi backend tests
// Keep this file lightweight: no real DB or real email should be used.

jest.setTimeout(30000);

// Ensure these env vars exist during tests.
// If .env is missing, tests should still be able to run with deterministic fallbacks.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';

// Mock MongoDB connection attempts if backend/server.js (or db.js) is ever imported.
// This prevents side-effects during pure unit tests.
jest.mock('../backend/config/db', () => ({}), { virtual: true });

// Mock prisma imports to avoid module resolution failures when running backend tests.
require('./setupPrismaMock');


// Mock nodemailer so tests never try real SMTP/Ethereal.
jest.mock('../backend/node_modules/nodemailer', () => {

  const sendMail = jest.fn().mockResolvedValue({ messageId: 'mock-message-id' });
  return {
    __esModule: true,
    createTransport: jest.fn(() => ({
      verify: jest.fn().mockResolvedValue(true),
      sendMail,
    })),
    getTestMessageUrl: jest.fn(() => 'https://example.com/preview'),
    createTestAccount: jest.fn().mockResolvedValue({
      user: 'ethereal_user',
      pass: 'ethereal_pass',
    }),
  };
});



// Do not mock jsonwebtoken here; keep real implementation for jwt tests.





