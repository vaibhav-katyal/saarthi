/**
 * @fileoverview Auth API tests.
 * What is being tested:
 *  - POST /api/auth/login
 * Expected results:
 *  - success returns 200 with { success: true, token, user }
 *  - invalid password returns 401 with { success: false, error: 'Invalid credentials' }
 *  - non-existing user returns 401 with { success: false, error: 'Invalid credentials' }
 */

const express = require('express');
const request = require('supertest');

// Mock the User model used by authService/login logic.
jest.mock('../backend/models/User', () => {
  return {
    __esModule: true,
    findOne: jest.fn(),
  };
});

const User = require('../backend/models/User');
const authRoutes = require('../backend/routes/authRoutes');

// Prevent prisma client import from breaking unit tests.
// (prismaClient.js loads @prisma/client at require-time)
// We mock PGUser model itself before authService imports it.
jest.mock('../backend/models/PGUser', () => ({
  __esModule: true,
  create: jest.fn(),
}), { virtual: true });

// Also mock prisma client module in case it's required directly.
jest.mock('../backend/config/prismaClient', () => ({}), { virtual: true });



describe('Auth - Login API', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  test('successful login returns 200 with token + user', async () => {
    // What we mock:
    // - User.findOne({ email }).select('+password') returns a user document
    // - user.matchPassword(password) resolves true

    const mockUserDoc = {
      _id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      avatar: null,
      password: 'hashed',
      matchPassword: jest.fn().mockResolvedValue(true),
    };

    const selectMock = jest.fn().mockReturnThis();
    const findOneMock = User.findOne;
    findOneMock.mockImplementation(() => ({ select: selectMock, ...mockUserDoc }));

    // The authService calls: await User.findOne({ email }).select('+password')
    // With our mock, `await` will resolve the object returned by findOne(), and `.select()` is a no-op.

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      id: mockUserDoc._id,
      name: mockUserDoc.name,
      email: mockUserDoc.email,
      avatar: null,
    });
  });

  test('invalid password returns 401 with correct JSON', async () => {
    const mockUserDoc = {
      _id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed',
      avatar: null,
      matchPassword: jest.fn().mockResolvedValue(false),
    };

    const selectMock = jest.fn().mockReturnThis();
    User.findOne.mockImplementation(() => ({ select: selectMock, ...mockUserDoc }));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: 'Invalid credentials',
    });
  });

  test('non-existing user returns 401 with correct JSON', async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
    });

    // `loginUser` checks if (!user) -> throw 'Invalid credentials'
    // Our returned value must be falsy when awaited.
    // Since authService awaits the User.findOne(...).select(...) chain,
    // make findOne return an object with select() that resolves to null.
    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));


    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'missing@example.com', password: 'any-password' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      error: 'Invalid credentials',
    });
  });
});

