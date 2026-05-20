/**
 * @fileoverview JWT unit tests.
 * What is being tested:
 *  - Token generation using the same JWT_SECRET used by the app
 *  - Token verification succeeds for valid tokens
 *  - Invalid tokens are rejected
 * Expected results:
 *  - jwt.verify() succeeds for a valid token
 *  - jwt.verify() throws for malformed/invalid tokens
 */

const jwt = require('backend/node_modules/jsonwebtoken');


describe('JWT - generation & verification', () => {
  test('generates and verifies a JWT using JWT_SECRET from .env', () => {
    // Test must use the configured secret; fallback is only for local convenience.
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_development';

    const payload = { id: 'some-user-id' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, secret);

    expect(decoded).toHaveProperty('id', payload.id);
  });

  test('invalid token is rejected', () => {
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_development';

    // obviously malformed
    const badToken = 'this-is-not-a-jwt';

    expect(() => jwt.verify(badToken, secret)).toThrow();
  });

  test('token signed with a different secret is rejected', () => {
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_development';
    const wrongSecret = `${secret}__WRONG__`;

    const token = jwt.sign({ id: 'x' }, secret, { expiresIn: '1h' });

    expect(() => jwt.verify(token, wrongSecret)).toThrow();
  });
});

